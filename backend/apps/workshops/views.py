import logging

from django.db import transaction
from django.db.models import F, Prefetch
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Speaker, Workshop, WorkshopEnrollment
from .serializers import (
    SpeakerSerializer,
    WorkshopEnrollmentSerializer,
    WorkshopEnrollSerializer,
    WorkshopSerializer,
)

logger = logging.getLogger(__name__)


class WorkshopListView(generics.ListAPIView):
    """
    GET /api/v1/workshops/
    List all active workshops with speaker info.
    Supports filtering by workshop_type via query param.
    """

    serializer_class = WorkshopSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = (
            Workshop.objects
            .filter(is_active=True)
            .select_related("speaker")
            .prefetch_related("required_ticket_types", "enrollments")
        )
        workshop_type = self.request.query_params.get("type")
        if workshop_type:
            qs = qs.filter(workshop_type=workshop_type)
        return qs


class WorkshopDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/workshops/<pk>/
    Retrieve a single workshop with full details.
    """

    serializer_class = WorkshopSerializer
    permission_classes = [permissions.AllowAny]
    queryset = (
        Workshop.objects
        .filter(is_active=True)
        .select_related("speaker")
        .prefetch_related("required_ticket_types", "enrollments")
    )


class EnrollView(APIView):
    """
    POST /api/v1/workshops/<pk>/enroll/   - Enroll current user
    DELETE /api/v1/workshops/<pk>/enroll/  - Unenroll current user
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        """Enroll the authenticated user in the workshop."""
        try:
            workshop = Workshop.objects.select_for_update().get(
                pk=pk, is_active=True
            )
        except Workshop.DoesNotExist:
            return Response(
                {"detail": "Taller no encontrado o inactivo."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if already enrolled
        if WorkshopEnrollment.objects.filter(
            workshop=workshop, user=request.user
        ).exists():
            return Response(
                {"detail": "Ya estas inscrito en este taller."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check capacity
        if workshop.is_full:
            return Response(
                {"detail": "El taller esta lleno."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check ticket type requirement
        if workshop.required_ticket_types.exists():
            user_ticket_types = set(
                request.user.tickets.filter(
                    status="confirmed"
                ).values_list("ticket_type_id", flat=True)
            )
            required_types = set(
                workshop.required_ticket_types.values_list("id", flat=True)
            )
            if not user_ticket_types & required_types:
                return Response(
                    {
                        "detail": (
                            "Tu tipo de entrada no incluye acceso a este taller."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        with transaction.atomic():
            WorkshopEnrollment.objects.create(
                workshop=workshop, user=request.user
            )
            Workshop.objects.filter(pk=workshop.pk).update(
                enrolled_count=F("enrolled_count") + 1
            )

        logger.info(
            "User %s enrolled in workshop %s", request.user.email, workshop.name
        )
        return Response(
            {"detail": "Inscripcion exitosa."},
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, pk):
        """Unenroll the authenticated user from the workshop."""
        try:
            enrollment = WorkshopEnrollment.objects.select_related(
                "workshop"
            ).get(workshop_id=pk, user=request.user)
        except WorkshopEnrollment.DoesNotExist:
            return Response(
                {"detail": "No estas inscrito en este taller."},
                status=status.HTTP_404_NOT_FOUND,
            )

        workshop = enrollment.workshop

        with transaction.atomic():
            enrollment.delete()
            Workshop.objects.filter(pk=workshop.pk).update(
                enrolled_count=F("enrolled_count") - 1
            )

        logger.info(
            "User %s unenrolled from workshop %s",
            request.user.email,
            workshop.name,
        )
        return Response(
            {"detail": "Te has desinscrito del taller."},
            status=status.HTTP_200_OK,
        )


class MyWorkshopsView(generics.ListAPIView):
    """
    GET /api/v1/workshops/my/
    List workshops the current user is enrolled in.
    """

    serializer_class = WorkshopEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            WorkshopEnrollment.objects
            .filter(user=self.request.user)
            .select_related("workshop__speaker")
        )


class SpeakerListView(generics.ListAPIView):
    """
    GET /api/v1/workshops/speakers/
    List all speakers.
    """

    serializer_class = SpeakerSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Speaker.objects.all()
