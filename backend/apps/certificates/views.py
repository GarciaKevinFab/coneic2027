import logging

from django.http import FileResponse, Http404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsOrganizer

from .models import Certificate
from .serializers import CertificateSerializer, CertificateValidationSerializer
from .tasks import generate_all_certificates

logger = logging.getLogger(__name__)


class GenerateCertificatesView(APIView):
    """
    POST /api/v1/certificates/generate/
    Admin endpoint to trigger bulk certificate generation via Celery.
    """

    permission_classes = [permissions.IsAdminUser | IsOrganizer]

    def post(self, request):
        certificate_type = request.data.get("certificate_type", "attendance")
        valid_types = [c[0] for c in Certificate.CertificateType.choices]
        if certificate_type not in valid_types:
            return Response(
                {"detail": f"Tipo invalido. Opciones: {valid_types}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = generate_all_certificates.delay(certificate_type)
        logger.info(
            "Certificate generation triggered by %s, type=%s, task_id=%s",
            request.user.email,
            certificate_type,
            task.id,
        )
        return Response(
            {
                "detail": "Generacion de certificados iniciada.",
                "task_id": task.id,
                "certificate_type": certificate_type,
            },
            status=status.HTTP_202_ACCEPTED,
        )


class MyCertificatesView(generics.ListAPIView):
    """
    GET /api/v1/certificates/my/
    List certificates for the authenticated user.
    """

    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Certificate.objects
            .filter(participant__user=self.request.user)
            .select_related("participant__user", "workshop")
        )


class DownloadCertificateView(APIView):
    """
    GET /api/v1/certificates/<pk>/download/
    Download the PDF for a specific certificate.
    Only the certificate owner or admin can download.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            certificate = Certificate.objects.select_related(
                "participant__user"
            ).get(pk=pk)
        except Certificate.DoesNotExist:
            raise Http404("Certificado no encontrado.")

        # Check ownership or admin
        if (
            certificate.participant.user != request.user
            and not request.user.is_staff
        ):
            return Response(
                {"detail": "No tienes permiso para descargar este certificado."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not certificate.pdf_file:
            return Response(
                {"detail": "El PDF aun no ha sido generado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        filename = (
            f"certificado_{certificate.certificate_type}_"
            f"{certificate.validation_code}.pdf"
        )
        return FileResponse(
            certificate.pdf_file.open("rb"),
            as_attachment=True,
            filename=filename,
            content_type="application/pdf",
        )


class ValidateCertificateView(APIView):
    """
    GET /api/v1/certificates/validate/<uuid:code>/
    Public endpoint to validate a certificate by its unique code.
    No authentication required.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request, code):
        try:
            certificate = Certificate.objects.select_related(
                "participant__user", "workshop"
            ).get(validation_code=code)
        except Certificate.DoesNotExist:
            return Response(
                {"valid": False, "detail": "Certificado no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = {
            "valid": True,
            "participant_name": certificate.participant.user.full_name,
            "university": certificate.participant.user.university,
            "certificate_type": certificate.get_certificate_type_display(),
            "hours": certificate.hours,
            "issued_at": certificate.issued_at,
            "validation_code": str(certificate.validation_code),
        }
        if certificate.workshop:
            data["workshop"] = certificate.workshop.name

        return Response(data)
