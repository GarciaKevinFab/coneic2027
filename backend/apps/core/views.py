import io
import logging
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.participants.models import Participant
from apps.payments.models import PaymentLog
from apps.tickets.models import Ticket, TicketType
from apps.users.permissions import IsOrganizer
from apps.workshops.models import Workshop, WorkshopEnrollment

from .serializers import (
    AccreditSerializer,
    AdminParticipantSerializer,
    AdminPaymentSerializer,
    AdminWorkshopReportSerializer,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------
class AdminPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 500


# ---------------------------------------------------------------------------
# Admin Participants
# ---------------------------------------------------------------------------
class AdminParticipantsView(generics.ListAPIView):
    """
    GET /api/v1/admin/participants/
    List all participants with filters for type, payment_status, is_accredited.

    Query params:
    - search: filter by name, email, or university (partial match)
    - type: filter by participant type name
    - payment_status: filter by payment status (pending/confirmed/refunded)
    - is_accredited: filter by accreditation (true/false)
    - ordering: sort field (default: -created_at)
    """

    serializer_class = AdminParticipantSerializer
    permission_classes = [permissions.IsAdminUser | IsOrganizer]
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = (
            Participant.objects
            .select_related("user", "participant_type", "ticket__ticket_type")
            .order_by("-created_at")
        )

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(user__full_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__university__icontains=search)
            )

        ptype = self.request.query_params.get("type")
        if ptype:
            qs = qs.filter(participant_type__name=ptype)

        payment_status = self.request.query_params.get("payment_status")
        if payment_status:
            qs = qs.filter(payment_status=payment_status)

        is_accredited = self.request.query_params.get("is_accredited")
        if is_accredited is not None:
            qs = qs.filter(
                is_accredited=is_accredited.lower() in ("true", "1", "yes")
            )

        ordering = self.request.query_params.get("ordering", "-created_at")
        allowed_orderings = {
            "created_at", "-created_at",
            "user__full_name", "-user__full_name",
            "payment_status", "-payment_status",
        }
        if ordering in allowed_orderings:
            qs = qs.order_by(ordering)

        return qs


# ---------------------------------------------------------------------------
# Export Participants to Excel
# ---------------------------------------------------------------------------
class ExportParticipantsView(APIView):
    """
    GET /api/v1/admin/participants/export/
    Export all participants to an Excel file (.xlsx) using openpyxl.
    """

    permission_classes = [permissions.IsAdminUser | IsOrganizer]

    def get(self, request):
        try:
            import openpyxl
            from openpyxl.styles import Alignment, Font, PatternFill
            from openpyxl.utils import get_column_letter
        except ImportError:
            return Response(
                {"detail": "openpyxl no esta instalado en el servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        participants = (
            Participant.objects
            .select_related("user", "participant_type", "ticket__ticket_type")
            .order_by("user__full_name")
        )

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Participantes CONEIC 2027"

        # Header styling
        header_font = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
        header_fill = PatternFill(
            start_color="112F77", end_color="112F77", fill_type="solid"
        )
        header_align = Alignment(
            horizontal="center", vertical="center", wrap_text=True
        )

        headers = [
            "ID",
            "Nombre Completo",
            "Email",
            "Telefono",
            "Universidad",
            "Carrera",
            "Ciudad",
            "Pais",
            "Tipo Participante",
            "Estado Pago",
            "Acreditado",
            "Fecha Acreditacion",
            "Tipo Entrada",
            "Token QR",
            "Fecha Registro",
        ]

        for col_idx, header in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col_idx, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_align

        # Data rows
        for row_idx, p in enumerate(participants, start=2):
            ticket_type_name = ""
            if p.ticket and p.ticket.ticket_type:
                ticket_type_name = p.ticket.ticket_type.name

            ws.cell(row=row_idx, column=1, value=p.id)
            ws.cell(row=row_idx, column=2, value=p.user.full_name)
            ws.cell(row=row_idx, column=3, value=p.user.email)
            ws.cell(row=row_idx, column=4, value=p.user.phone)
            ws.cell(row=row_idx, column=5, value=p.user.university)
            ws.cell(row=row_idx, column=6, value=p.user.career)
            ws.cell(row=row_idx, column=7, value=p.user.city)
            ws.cell(row=row_idx, column=8, value=p.user.country)
            ws.cell(
                row=row_idx, column=9,
                value=p.participant_type.name if p.participant_type else "",
            )
            ws.cell(row=row_idx, column=10, value=p.get_payment_status_display())
            ws.cell(row=row_idx, column=11, value="Si" if p.is_accredited else "No")
            ws.cell(
                row=row_idx, column=12,
                value=(
                    p.accredited_at.strftime("%d/%m/%Y %H:%M")
                    if p.accredited_at else ""
                ),
            )
            ws.cell(row=row_idx, column=13, value=ticket_type_name)
            ws.cell(row=row_idx, column=14, value=str(p.qr_token))
            ws.cell(
                row=row_idx, column=15,
                value=p.created_at.strftime("%d/%m/%Y %H:%M"),
            )

        # Auto-width columns
        column_widths = [
            6, 30, 30, 15, 35, 25, 15, 12, 18, 15, 12, 20, 18, 38, 20,
        ]
        for col_idx, width in enumerate(column_widths, start=1):
            ws.column_dimensions[get_column_letter(col_idx)].width = width

        ws.auto_filter.ref = ws.dimensions
        ws.freeze_panes = "A2"

        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)

        timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
        filename = "participantes_coneic2027_%s.xlsx" % timestamp

        response = HttpResponse(
            buf.getvalue(),
            content_type=(
                "application/vnd.openxmlformats-officedocument"
                ".spreadsheetml.sheet"
            ),
        )
        response["Content-Disposition"] = (
            'attachment; filename="%s"' % filename
        )

        logger.info(
            "Participants exported to Excel by %s (%d records)",
            request.user.email,
            participants.count(),
        )
        return response


# ---------------------------------------------------------------------------
# Admin Payments
# ---------------------------------------------------------------------------
class AdminPaymentsView(generics.ListAPIView):
    """
    GET /api/v1/admin/payments/
    List all payment logs with totals. Supports filters for status and method.
    """

    serializer_class = AdminPaymentSerializer
    permission_classes = [permissions.IsAdminUser | IsOrganizer]
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = (
            PaymentLog.objects
            .select_related("ticket__user", "ticket__ticket_type")
            .order_by("-created_at")
        )

        pay_status = self.request.query_params.get("status")
        if pay_status:
            qs = qs.filter(status=pay_status)

        method = self.request.query_params.get("method")
        if method:
            qs = qs.filter(payment_method=method)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(culqi_charge_id__icontains=search)
                | Q(ticket__user__full_name__icontains=search)
                | Q(ticket__user__email__icontains=search)
            )

        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        totals = PaymentLog.objects.aggregate(
            total_amount=Sum("amount"),
            total_success=Sum(
                "amount", filter=Q(status=PaymentLog.Status.SUCCESS)
            ),
            total_pending=Sum(
                "amount", filter=Q(status=PaymentLog.Status.PENDING)
            ),
            count_total=Count("id"),
            count_success=Count(
                "id", filter=Q(status=PaymentLog.Status.SUCCESS)
            ),
            count_pending=Count(
                "id", filter=Q(status=PaymentLog.Status.PENDING)
            ),
            count_failed=Count(
                "id", filter=Q(status=PaymentLog.Status.FAILED)
            ),
        )

        response.data = {
            "totals": totals,
            "results": response.data,
        }
        return response


# ---------------------------------------------------------------------------
# Admin Accreditation
# ---------------------------------------------------------------------------
class AdminAccreditView(APIView):
    """
    POST /api/v1/admin/accredit/
    Accredit a participant by their QR token.
    Body: { "qr_token": "<uuid>" }
    """

    permission_classes = [permissions.IsAdminUser | IsOrganizer]

    def post(self, request):
        serializer = AccreditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        qr_token = serializer.validated_data["qr_token"]

        try:
            participant = Participant.objects.select_related(
                "user", "participant_type", "ticket__ticket_type"
            ).get(qr_token=qr_token)
        except Participant.DoesNotExist:
            return Response(
                {"detail": "No se encontro un participante con este codigo QR."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if participant.is_accredited:
            return Response(
                {
                    "detail": "Este participante ya fue acreditado.",
                    "participant": AdminParticipantSerializer(participant).data,
                    "already_accredited": True,
                },
                status=status.HTTP_409_CONFLICT,
            )

        if participant.payment_status != Participant.PaymentStatus.PAID:
            return Response(
                {
                    "detail": "El pago del participante no esta confirmado.",
                    "payment_status": participant.payment_status,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        participant.is_accredited = True
        participant.accredited_at = timezone.now()
        participant.accredited_by = request.user
        participant.save(
            update_fields=["is_accredited", "accredited_at", "accredited_by"]
        )

        logger.info(
            "Participant %s accredited by %s",
            participant.user.email,
            request.user.email,
        )

        return Response(
            {
                "detail": "Participante acreditado exitosamente.",
                "participant": AdminParticipantSerializer(participant).data,
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Admin Dashboard Stats
# ---------------------------------------------------------------------------
class AdminStatsView(APIView):
    """
    GET /api/v1/admin/stats/
    Returns aggregate statistics for the admin dashboard:
    total participants, revenue, remaining capacity, etc.
    """

    permission_classes = [permissions.IsAdminUser | IsOrganizer]

    def get(self, request):
        # Participant counts
        total_participants = Participant.objects.count()
        confirmed_count = Participant.objects.filter(
            payment_status=Participant.PaymentStatus.PAID
        ).count()
        accredited_count = Participant.objects.filter(
            is_accredited=True
        ).count()
        pending_count = Participant.objects.filter(
            payment_status=Participant.PaymentStatus.PENDING
        ).count()

        # Revenue
        total_revenue = (
            PaymentLog.objects.filter(
                status=PaymentLog.Status.SUCCESS
            ).aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        # Ticket capacity
        ticket_stats = []
        for tt in TicketType.objects.order_by("price"):
            ticket_stats.append({
                "name": tt.name,
                "price": str(tt.price),
                "capacity": tt.capacity,
                "sold": tt.sold_count,
                "available": tt.available_count,
                "is_sold_out": tt.is_sold_out,
            })

        # Workshop stats
        total_workshops = Workshop.objects.filter(is_active=True).count()
        total_enrollments = (
            Workshop.objects.filter(is_active=True)
            .aggregate(total=Sum("enrolled_count"))["total"] or 0
        )

        # Participants by type
        by_type = list(
            Participant.objects
            .values("participant_type__name")
            .annotate(count=Count("id"))
            .order_by("participant_type__name")
        )

        return Response({
            "participants": {
                "total": total_participants,
                "confirmed": confirmed_count,
                "accredited": accredited_count,
                "pending": pending_count,
            },
            "revenue": {
                "total": str(total_revenue),
                "currency": "PEN",
            },
            "tickets": ticket_stats,
            "workshops": {
                "total_active": total_workshops,
                "total_enrollments": total_enrollments,
            },
            "participants_by_type": by_type,
        })


# ---------------------------------------------------------------------------
# Admin Workshops Report
# ---------------------------------------------------------------------------
class AdminWorkshopsReportView(generics.ListAPIView):
    """
    GET /api/v1/admin/workshops/report/
    Workshop occupancy report with capacity and enrollment data.
    """

    serializer_class = AdminWorkshopReportSerializer
    permission_classes = [permissions.IsAdminUser | IsOrganizer]
    pagination_class = None

    def get_queryset(self):
        return (
            Workshop.objects
            .select_related("speaker")
            .order_by("start_time")
        )
