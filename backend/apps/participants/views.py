from django.db.models import Count, Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsOrganizer

from .models import Participant, ParticipantType
from .serializers import (
    AccreditationSerializer,
    ParticipantSerializer,
    ParticipantStatsSerializer,
)


class StandardPagination(PageNumberPagination):
    """Standard pagination with 50 items per page."""

    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


class ParticipantListView(generics.ListAPIView):
    """
    List all participants. Admin/Organizer only.
    Supports filtering by participant_type, payment_status, and is_accredited.
    """

    serializer_class = ParticipantSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = Participant.objects.select_related(
            "user",
            "participant_type",
            "accredited_by",
            "ticket",
        ).prefetch_related(
            "selected_workshops",
        )

        # Filter by participant type
        participant_type = self.request.query_params.get("type")
        if participant_type:
            queryset = queryset.filter(participant_type__name=participant_type)

        # Filter by payment status
        payment_status = self.request.query_params.get("payment_status")
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        # Filter by accreditation status
        is_accredited = self.request.query_params.get("is_accredited")
        if is_accredited is not None:
            queryset = queryset.filter(
                is_accredited=is_accredited.lower() in ("true", "1", "yes")
            )

        # Search by user name or email
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(user__full_name__icontains=search)
                | Q(user__email__icontains=search)
            )

        return queryset


class MyParticipantView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve the current user's participant profile.
    PUT/PATCH: Update participant details (type, selected workshops).
    """

    serializer_class = ParticipantSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        participant, _created = Participant.objects.select_related(
            "user",
            "participant_type",
            "ticket",
        ).prefetch_related(
            "selected_workshops",
        ).get_or_create(
            user=self.request.user,
            defaults={
                "participant_type": ParticipantType.objects.filter(
                    name=ParticipantType.TypeChoices.STUDENT
                ).first(),
            },
        )
        return participant


class AccreditateView(APIView):
    """
    Accreditate a participant by scanning their QR code.
    Only organizers can perform this action.
    POST body: { "qr_token": "<uuid>" }
    """

    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request):
        serializer = AccreditationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        qr_token = serializer.validated_data["qr_token"]

        participant = Participant.objects.select_related(
            "user", "participant_type"
        ).get(qr_token=qr_token)

        participant.is_accredited = True
        participant.accredited_at = timezone.now()
        participant.accredited_by = request.user
        participant.save(
            update_fields=["is_accredited", "accredited_at", "accredited_by"]
        )

        return Response(
            {
                "detail": _("Participante acreditado exitosamente."),
                "participant": ParticipantSerializer(participant).data,
            },
            status=status.HTTP_200_OK,
        )


class ParticipantStatsView(APIView):
    """
    Returns aggregate statistics about participants.
    Organizer/admin only.
    """

    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request):
        total = Participant.objects.count()
        accredited = Participant.objects.filter(is_accredited=True).count()

        payment_counts = (
            Participant.objects.values("payment_status")
            .annotate(count=Count("id"))
            .order_by("payment_status")
        )
        payment_map = {item["payment_status"]: item["count"] for item in payment_counts}

        by_type = list(
            Participant.objects.values("participant_type__name")
            .annotate(count=Count("id"))
            .order_by("participant_type__name")
        )

        stats = {
            "total_participants": total,
            "accredited_count": accredited,
            "pending_accreditation": total - accredited,
            "payment_pending": payment_map.get("pending", 0),
            "payment_paid": payment_map.get("paid", 0),
            "payment_cancelled": payment_map.get("cancelled", 0),
            "by_type": by_type,
        }

        serializer = ParticipantStatsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)
