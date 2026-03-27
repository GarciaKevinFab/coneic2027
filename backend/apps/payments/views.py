import json
import logging

from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.payments.models import PaymentLog
from apps.payments.serializers import (
    CulqiChargeSerializer,
    PaymentStatusSerializer,
    YapeChargeSerializer,
)
from apps.payments.services import CulqiError, CulqiService
from apps.tickets.models import Ticket

logger = logging.getLogger(__name__)


class CulqiChargeView(APIView):
    """
    POST /api/payments/charge/

    Process a card payment through Culqi.

    Flow:
        1. Frontend tokenises the card via Culqi.js -> obtains ``token``.
        2. Frontend sends ``token`` + ``purchase_code`` + ``email`` here.
        3. Backend creates the charge via Culqi API.
        4. On success, confirms the ticket and logs the payment.
    """

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CulqiChargeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Retrieve the pending ticket
        try:
            ticket = Ticket.objects.select_for_update().get(
                purchase_code=data["purchase_code"],
                user=request.user,
                status=Ticket.Status.PENDING,
            )
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "Entrada pendiente no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        amount_cents = int(ticket.amount_paid * 100)

        # Create payment log (pending)
        payment_log = PaymentLog.objects.create(
            ticket=ticket,
            amount=ticket.amount_paid,
            payment_method=PaymentLog.PaymentMethod.CULQI,
            status=PaymentLog.Status.PENDING,
        )

        # Call Culqi
        culqi = CulqiService()
        try:
            charge = culqi.create_charge(
                token=data["token"],
                amount_cents=amount_cents,
                email=data["email"],
                metadata={
                    "purchase_code": str(ticket.purchase_code),
                    "user_id": str(ticket.user_id),
                },
            )
        except CulqiError as exc:
            payment_log.status = PaymentLog.Status.FAILED
            payment_log.raw_response = exc.raw
            payment_log.save(update_fields=["status", "raw_response"])
            logger.warning("Culqi charge failed for %s: %s", ticket.purchase_code, exc)
            return Response(
                {"detail": f"Error en el pago: {exc.message}"},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        # Update payment log
        payment_log.culqi_charge_id = charge.get("id", "")
        payment_log.status = PaymentLog.Status.SUCCESS
        payment_log.raw_response = charge
        payment_log.save(
            update_fields=["culqi_charge_id", "status", "raw_response"],
        )

        # Confirm the ticket
        ticket.status = Ticket.Status.CONFIRMED
        ticket.payment_reference = charge.get("id", "")
        ticket.save(update_fields=["status", "payment_reference"])

        # Increment sold count on the ticket type
        from apps.tickets.models import TicketType

        ticket_type = TicketType.objects.select_for_update().get(
            pk=ticket.ticket_type_id,
        )
        ticket_type.sold_count += 1
        ticket_type.save(update_fields=["sold_count"])

        # Fire async tasks
        from apps.tickets.tasks import (
            generate_receipt_pdf,
            send_purchase_confirmation_email,
        )

        transaction.on_commit(lambda: generate_receipt_pdf.delay(ticket.id))
        transaction.on_commit(
            lambda: send_purchase_confirmation_email.delay(ticket.id),
        )

        logger.info(
            "Card payment successful: charge=%s ticket=%s",
            charge.get("id"),
            ticket.purchase_code,
        )

        return Response(
            {
                "detail": "Pago exitoso.",
                "purchase_code": str(ticket.purchase_code),
                "charge_id": charge.get("id", ""),
            },
            status=status.HTTP_200_OK,
        )


class YapeChargeView(APIView):
    """
    POST /api/payments/yape/

    Process a YAPE payment through Culqi's YAPE endpoint.

    Flow:
        1. User generates an OTP in the YAPE app.
        2. Frontend sends ``phone`` + ``otp`` + ``purchase_code`` here.
        3. Backend creates the YAPE charge via Culqi API.
        4. On success, confirms the ticket and logs the payment.
    """

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = YapeChargeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            ticket = Ticket.objects.select_for_update().get(
                purchase_code=data["purchase_code"],
                user=request.user,
                status=Ticket.Status.PENDING,
            )
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "Entrada pendiente no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        amount_cents = int(ticket.amount_paid * 100)

        payment_log = PaymentLog.objects.create(
            ticket=ticket,
            amount=ticket.amount_paid,
            payment_method=PaymentLog.PaymentMethod.YAPE,
            status=PaymentLog.Status.PENDING,
        )

        culqi = CulqiService()
        try:
            charge = culqi.create_yape_charge(
                phone=data["phone"],
                otp=data["otp"],
                amount_cents=amount_cents,
                metadata={
                    "purchase_code": str(ticket.purchase_code),
                    "user_id": str(ticket.user_id),
                },
            )
        except CulqiError as exc:
            payment_log.status = PaymentLog.Status.FAILED
            payment_log.raw_response = exc.raw
            payment_log.save(update_fields=["status", "raw_response"])
            logger.warning(
                "YAPE charge failed for %s: %s", ticket.purchase_code, exc
            )
            return Response(
                {"detail": f"Error en el pago con YAPE: {exc.message}"},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        payment_log.culqi_charge_id = charge.get("id", "")
        payment_log.status = PaymentLog.Status.SUCCESS
        payment_log.raw_response = charge
        payment_log.save(
            update_fields=["culqi_charge_id", "status", "raw_response"],
        )

        ticket.status = Ticket.Status.CONFIRMED
        ticket.payment_reference = charge.get("id", "")
        ticket.save(update_fields=["status", "payment_reference"])

        from apps.tickets.models import TicketType

        ticket_type = TicketType.objects.select_for_update().get(
            pk=ticket.ticket_type_id,
        )
        ticket_type.sold_count += 1
        ticket_type.save(update_fields=["sold_count"])

        from apps.tickets.tasks import (
            generate_receipt_pdf,
            send_purchase_confirmation_email,
        )

        transaction.on_commit(lambda: generate_receipt_pdf.delay(ticket.id))
        transaction.on_commit(
            lambda: send_purchase_confirmation_email.delay(ticket.id),
        )

        logger.info(
            "YAPE payment successful: charge=%s ticket=%s",
            charge.get("id"),
            ticket.purchase_code,
        )

        return Response(
            {
                "detail": "Pago con YAPE exitoso.",
                "purchase_code": str(ticket.purchase_code),
                "charge_id": charge.get("id", ""),
            },
            status=status.HTTP_200_OK,
        )


class WebhookView(APIView):
    """
    POST /api/payments/webhook/

    Receive and process Culqi webhook notifications.
    Verifies the HMAC-SHA256 signature before processing.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get("X-Culqi-Signature", "")
        if not signature:
            logger.warning("Webhook received without signature header.")
            return Response(
                {"detail": "Firma no proporcionada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        culqi = CulqiService()
        if not culqi.verify_webhook(request.body, signature):
            logger.warning("Webhook signature verification failed.")
            return Response(
                {"detail": "Firma invalida."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return Response(
                {"detail": "Payload invalido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event_type = payload.get("type", "")
        data = payload.get("data", {})

        if event_type == "charge.creation.succeeded":
            self._handle_charge_succeeded(data)
        elif event_type == "charge.creation.failed":
            self._handle_charge_failed(data)
        else:
            logger.info("Unhandled webhook event type: %s", event_type)

        return Response({"detail": "Webhook procesado."}, status=status.HTTP_200_OK)

    @transaction.atomic
    def _handle_charge_succeeded(self, data: dict):
        """Process a successful charge event from Culqi webhook."""
        charge_id = data.get("id", "")
        metadata = data.get("metadata", {})
        purchase_code = metadata.get("purchase_code")

        if not purchase_code:
            logger.warning("Webhook charge.succeeded missing purchase_code in metadata.")
            return

        try:
            ticket = Ticket.objects.select_for_update().get(
                purchase_code=purchase_code,
                status=Ticket.Status.PENDING,
            )
        except Ticket.DoesNotExist:
            logger.info(
                "Webhook charge.succeeded: ticket %s not found or already confirmed.",
                purchase_code,
            )
            return

        ticket.status = Ticket.Status.CONFIRMED
        ticket.payment_reference = charge_id
        ticket.save(update_fields=["status", "payment_reference"])

        from apps.tickets.models import TicketType

        ticket_type = TicketType.objects.select_for_update().get(
            pk=ticket.ticket_type_id,
        )
        ticket_type.sold_count += 1
        ticket_type.save(update_fields=["sold_count"])

        # Update or create payment log
        PaymentLog.objects.update_or_create(
            culqi_charge_id=charge_id,
            defaults={
                "ticket": ticket,
                "amount": ticket.amount_paid,
                "payment_method": ticket.payment_method,
                "status": PaymentLog.Status.SUCCESS,
                "raw_response": data,
            },
        )

        from apps.tickets.tasks import (
            generate_receipt_pdf,
            send_purchase_confirmation_email,
        )

        transaction.on_commit(lambda: generate_receipt_pdf.delay(ticket.id))
        transaction.on_commit(
            lambda: send_purchase_confirmation_email.delay(ticket.id),
        )

        logger.info("Webhook confirmed ticket %s via charge %s", purchase_code, charge_id)

    @transaction.atomic
    def _handle_charge_failed(self, data: dict):
        """Log a failed charge event from Culqi webhook."""
        charge_id = data.get("id", "")
        metadata = data.get("metadata", {})
        purchase_code = metadata.get("purchase_code")

        if not purchase_code:
            logger.warning("Webhook charge.failed missing purchase_code in metadata.")
            return

        try:
            ticket = Ticket.objects.get(
                purchase_code=purchase_code,
                status=Ticket.Status.PENDING,
            )
        except Ticket.DoesNotExist:
            return

        PaymentLog.objects.update_or_create(
            culqi_charge_id=charge_id,
            defaults={
                "ticket": ticket,
                "amount": ticket.amount_paid,
                "payment_method": ticket.payment_method,
                "status": PaymentLog.Status.FAILED,
                "raw_response": data,
            },
        )

        logger.info("Webhook recorded failed charge %s for ticket %s", charge_id, purchase_code)


class PaymentStatusView(APIView):
    """
    GET /api/payments/status/<purchase_code>/

    Check the payment status for a given purchase code.
    Returns the most recent payment log entries.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, purchase_code):
        logs = PaymentLog.objects.filter(
            ticket__purchase_code=purchase_code,
            ticket__user=request.user,
        ).order_by("-created_at")[:5]

        if not logs.exists():
            return Response(
                {"detail": "No se encontraron registros de pago."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PaymentStatusSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
