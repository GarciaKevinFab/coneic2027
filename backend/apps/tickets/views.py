import logging

from django.db import transaction
from django.http import FileResponse, Http404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tickets.models import Ticket, TicketType
from apps.tickets.serializers import (
    PurchaseSerializer,
    TicketConfirmSerializer,
    TicketSerializer,
    TicketTypeSerializer,
)

logger = logging.getLogger(__name__)


class TicketTypeListView(generics.ListAPIView):
    """
    GET /api/tickets/types/

    List all active ticket types with their available counts.
    Public endpoint -- no authentication required.
    """

    serializer_class = TicketTypeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        from django.utils import timezone

        return TicketType.objects.filter(
            is_active=True,
            available_until__gt=timezone.now(),
        )


class PurchaseView(APIView):
    """
    POST /api/tickets/purchase/

    Initiate a ticket purchase.  Creates a **pending** ticket that must be
    confirmed via the payment flow.  The response includes the ``purchase_code``
    that the frontend uses to complete the payment with Culqi/YAPE.
    """

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = PurchaseSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        ticket_type = TicketType.objects.select_for_update().get(
            pk=serializer.validated_data["ticket_type_id"],
        )

        # Double-check availability inside the lock
        if ticket_type.is_sold_out:
            return Response(
                {"detail": "Este tipo de entrada esta agotado."},
                status=status.HTTP_409_CONFLICT,
            )

        ticket = Ticket.objects.create(
            user=request.user,
            ticket_type=ticket_type,
            payment_method=serializer.validated_data["payment_method"],
            amount_paid=ticket_type.price,
            status=Ticket.Status.PENDING,
        )

        return Response(
            {
                "purchase_code": str(ticket.purchase_code),
                "amount": str(ticket_type.price),
                "amount_cents": int(ticket_type.price * 100),
                "ticket_type": ticket_type.name,
            },
            status=status.HTTP_201_CREATED,
        )


class ConfirmPaymentView(APIView):
    """
    POST /api/tickets/confirm/

    Called internally (or via Culqi webhook) to confirm that payment has
    been received for a pending ticket.  Increments the sold count and
    triggers asynchronous receipt generation + email.
    """

    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = TicketConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        try:
            ticket = Ticket.objects.select_for_update().get(
                purchase_code=data["purchase_code"],
                status=Ticket.Status.PENDING,
            )
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "Entrada pendiente no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Validate amount matches (cents -> soles)
        expected_cents = int(ticket.amount_paid * 100)
        if data["amount_cents"] != expected_cents:
            logger.warning(
                "Amount mismatch for %s: expected=%d got=%d",
                ticket.purchase_code,
                expected_cents,
                data["amount_cents"],
            )
            return Response(
                {"detail": "El monto no coincide con la entrada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Confirm the ticket
        ticket.status = Ticket.Status.CONFIRMED
        ticket.payment_reference = data["culqi_charge_id"]
        ticket.save(update_fields=["status", "payment_reference"])

        # Increment sold count
        ticket_type = TicketType.objects.select_for_update().get(
            pk=ticket.ticket_type_id,
        )
        ticket_type.sold_count += 1
        ticket_type.save(update_fields=["sold_count"])

        # Dispatch async tasks
        from apps.tickets.tasks import (
            generate_receipt_pdf,
            send_purchase_confirmation_email,
        )

        generate_receipt_pdf.delay(ticket.id)
        send_purchase_confirmation_email.delay(ticket.id)

        logger.info(
            "Ticket confirmed: code=%s user=%s",
            ticket.purchase_code,
            ticket.user_id,
        )

        return Response(
            {"detail": "Pago confirmado.", "purchase_code": str(ticket.purchase_code)},
            status=status.HTTP_200_OK,
        )


class MyTicketView(generics.RetrieveAPIView):
    """
    GET /api/tickets/me/

    Return the authenticated user's active (confirmed or pending) ticket.
    Includes QR data for confirmed tickets.
    """

    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return Ticket.objects.select_related("ticket_type").get(
                user=self.request.user,
                status__in=[Ticket.Status.PENDING, Ticket.Status.CONFIRMED],
            )
        except Ticket.DoesNotExist:
            raise Http404("No tienes una entrada activa.")


class ReceiptDownloadView(APIView):
    """
    GET /api/tickets/receipt/<purchase_code>/

    Stream the receipt PDF for a confirmed ticket.
    Only the ticket owner may download their receipt.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, purchase_code):
        try:
            ticket = Ticket.objects.get(
                purchase_code=purchase_code,
                user=request.user,
                status=Ticket.Status.CONFIRMED,
            )
        except Ticket.DoesNotExist:
            raise Http404("Entrada no encontrada.")

        if not ticket.receipt_pdf:
            return Response(
                {"detail": "El comprobante aun no esta disponible."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return FileResponse(
            ticket.receipt_pdf.open("rb"),
            as_attachment=True,
            filename=f"comprobante_{ticket.purchase_code}.pdf",
        )
