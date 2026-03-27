"""
Celery tasks for certificate PDF generation using ReportLab.

Generates professionally designed certificates with:
- CONEIC letterhead / header
- Participant name
- Participation type
- Event dates and hours
- Validation QR code
- Visual signature of the organizing committee
"""

import io
import logging

from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CONEIC_BLUE = (0.067, 0.2, 0.467)
CONEIC_GOLD = (0.804, 0.659, 0.290)
TEXT_DARK = (0.133, 0.133, 0.133)
TEXT_GRAY = (0.4, 0.4, 0.4)


def _build_certificate_pdf(
    participant_name,
    university,
    certificate_type_display,
    workshop_name,
    hours,
    event_name,
    event_dates,
    validation_code,
    validation_url,
):
    """
    Generate a single certificate PDF and return the raw bytes.
    Uses ReportLab canvas for PDF creation and qrcode for QR generation.
    """
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=landscape(A4))
    width, height = landscape(A4)

    # ---- Background border ----
    c.setStrokeColorRGB(*CONEIC_BLUE)
    c.setLineWidth(3)
    c.rect(20, 20, width - 40, height - 40)

    # Inner decorative border
    c.setStrokeColorRGB(*CONEIC_GOLD)
    c.setLineWidth(1.5)
    c.rect(30, 30, width - 60, height - 60)

    # ---- Header ----
    c.setFillColorRGB(*CONEIC_BLUE)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width / 2, height - 70, "CONGRESO NACIONAL DE ESTUDIANTES")
    c.drawCentredString(width / 2, height - 88, "DE INGENIERIA CIVIL")

    c.setFont("Helvetica-Bold", 22)
    c.setFillColorRGB(*CONEIC_GOLD)
    c.drawCentredString(width / 2, height - 118, event_name)

    # ---- CERTIFICADO title ----
    c.setFillColorRGB(*CONEIC_BLUE)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 165, "CERTIFICADO")

    # ---- Subtitle: type ----
    c.setFont("Helvetica", 13)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawCentredString(
        width / 2,
        height - 190,
        "De %s" % certificate_type_display,
    )

    # ---- Otorgado a: ----
    c.setFont("Helvetica", 12)
    c.setFillColorRGB(*TEXT_GRAY)
    c.drawCentredString(width / 2, height - 225, "Otorgado a:")

    # ---- Participant name ----
    c.setFont("Helvetica-Bold", 26)
    c.setFillColorRGB(*CONEIC_BLUE)
    c.drawCentredString(width / 2, height - 260, participant_name)

    # Decorative line under the name
    line_y = height - 272
    c.setStrokeColorRGB(*CONEIC_GOLD)
    c.setLineWidth(1)
    c.line(width / 2 - 180, line_y, width / 2 + 180, line_y)

    # ---- University ----
    if university:
        c.setFont("Helvetica", 12)
        c.setFillColorRGB(*TEXT_DARK)
        c.drawCentredString(width / 2, height - 292, university)

    # ---- Description paragraph ----
    desc = ["Por su participacion como %s" % certificate_type_display.lower()]
    if workshop_name:
        desc.append('en "%s"' % workshop_name)
    desc.append("durante el %s," % event_name)
    desc.append(
        "realizado en %s, con una duracion de %d horas academicas."
        % (event_dates, hours)
    )

    c.setFont("Helvetica", 11)
    c.setFillColorRGB(*TEXT_DARK)
    y_pos = height - 325
    full_text = " ".join(desc)
    max_chars = 95
    lines = []
    words = full_text.split()
    current_line = ""
    for word in words:
        test = ("%s %s" % (current_line, word)).strip()
        if len(test) <= max_chars:
            current_line = test
        else:
            lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    for line in lines:
        c.drawCentredString(width / 2, y_pos, line)
        y_pos -= 16

    # ---- Signatures ----
    sig_y = 110
    sig_lw = 140

    left_x = width / 4
    c.setStrokeColorRGB(*TEXT_DARK)
    c.setLineWidth(0.5)
    c.line(left_x - sig_lw / 2, sig_y, left_x + sig_lw / 2, sig_y)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawCentredString(left_x, sig_y - 14, "Presidente del Comite Organizador")
    c.setFont("Helvetica", 8)
    c.drawCentredString(left_x, sig_y - 26, event_name)

    right_x = 3 * width / 4
    c.line(right_x - sig_lw / 2, sig_y, right_x + sig_lw / 2, sig_y)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(right_x, sig_y - 14, "Director Academico")
    c.setFont("Helvetica", 8)
    c.drawCentredString(right_x, sig_y - 26, event_name)

    # ---- QR Code ----
    try:
        import qrcode
        from reportlab.lib.utils import ImageReader

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=1,
        )
        qr.add_data(validation_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="#112F77", back_color="white")
        qr_buf = io.BytesIO()
        qr_img.save(qr_buf, format="PNG")
        qr_buf.seek(0)

        qr_size = 65
        qr_x = width - 55 - qr_size
        qr_y = 42
        c.drawImage(
            ImageReader(qr_buf),
            qr_x,
            qr_y,
            qr_size,
            qr_size,
            preserveAspectRatio=True,
            mask="auto",
        )
        c.setFont("Helvetica", 6)
        c.setFillColorRGB(*TEXT_GRAY)
        c.drawCentredString(
            qr_x + qr_size / 2, qr_y - 10, "Validar certificado"
        )
    except ImportError:
        logger.warning(
            "qrcode package not installed; skipping QR code generation."
        )

    # ---- Validation code footer ----
    c.setFont("Helvetica", 7)
    c.setFillColorRGB(*TEXT_GRAY)
    c.drawCentredString(
        width / 2,
        42,
        "Codigo de validacion: %s  |  Verificar en: %s"
        % (validation_code, validation_url),
    )

    c.showPage()
    c.save()
    buf.seek(0)
    return buf.read()


# ---------------------------------------------------------------------------
# Celery Tasks
# ---------------------------------------------------------------------------


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_certificate_pdf(self, certificate_id):
    """Generate a single certificate PDF and attach it to the Certificate record."""
    from .models import Certificate

    try:
        cert = Certificate.objects.select_related(
            "participant__user", "workshop"
        ).get(pk=certificate_id)
    except Certificate.DoesNotExist:
        logger.error("Certificate %s not found.", certificate_id)
        return

    if cert.pdf_file:
        logger.info(
            "Certificate %s already has a PDF. Skipping.", certificate_id
        )
        return

    frontend_url = getattr(settings, "FRONTEND_URL", "https://coneic2027.pe")
    validation_url = "%s/certificados/validar/%s" % (
        frontend_url,
        cert.validation_code,
    )

    event_name = "CONEIC 2027"
    event_dates = "2027"

    try:
        from apps.institutional.models import EventInfo

        info = EventInfo.objects.first()
        if info:
            event_name = info.name or event_name
            if info.start_date and info.end_date:
                fmt = "%d/%m/%Y"
                event_dates = "%s al %s" % (
                    info.start_date.strftime(fmt),
                    info.end_date.strftime(fmt),
                )
    except Exception:
        pass

    workshop_name = cert.workshop.name if cert.workshop else None

    try:
        pdf_bytes = _build_certificate_pdf(
            participant_name=cert.participant.user.full_name,
            university=cert.participant.user.university,
            certificate_type_display=cert.get_certificate_type_display(),
            workshop_name=workshop_name,
            hours=cert.hours,
            event_name=event_name,
            event_dates=event_dates,
            validation_code=str(cert.validation_code),
            validation_url=validation_url,
        )

        filename = "cert_%s_%s.pdf" % (cert.certificate_type, cert.validation_code)
        cert.pdf_file.save(filename, ContentFile(pdf_bytes), save=True)
        logger.info(
            "Generated PDF for certificate %s (%s).", certificate_id, filename
        )
    except Exception as exc:
        logger.exception(
            "Failed to generate PDF for certificate %s: %s", certificate_id, exc
        )
        raise self.retry(exc=exc)


@shared_task(bind=True)
def generate_all_certificates(self, certificate_type="attendance"):
    """
    Bulk-generate certificates for all confirmed participants.

    attendance: for all confirmed, accredited participants without a cert.
    workshop: for all enrolled users per workshop.
    speaker: for all speakers with matching user accounts.
    """
    from apps.participants.models import Participant
    from apps.workshops.models import Speaker, WorkshopEnrollment

    from .models import Certificate

    created_count = 0

    if certificate_type == Certificate.CertificateType.ATTENDANCE:
        participants = Participant.objects.filter(
            payment_status=Participant.PaymentStatus.PAID,
            is_accredited=True,
        ).select_related("user")

        for participant in participants:
            cert, created = Certificate.objects.get_or_create(
                participant=participant,
                certificate_type=Certificate.CertificateType.ATTENDANCE,
                workshop=None,
                defaults={"hours": 8},
            )
            if created:
                generate_certificate_pdf.delay(cert.id)
                created_count += 1

    elif certificate_type == Certificate.CertificateType.WORKSHOP:
        enrollments = WorkshopEnrollment.objects.select_related(
            "user", "workshop"
        ).all()

        for enrollment in enrollments:
            try:
                participant = enrollment.user.participant
            except Participant.DoesNotExist:
                continue

            workshop = enrollment.workshop
            if workshop.start_time and workshop.end_time:
                delta = workshop.end_time - workshop.start_time
                hours = max(1, int(delta.total_seconds() / 3600))
            else:
                hours = 2

            cert, created = Certificate.objects.get_or_create(
                participant=participant,
                certificate_type=Certificate.CertificateType.WORKSHOP,
                workshop=workshop,
                defaults={"hours": hours},
            )
            if created:
                generate_certificate_pdf.delay(cert.id)
                created_count += 1

    elif certificate_type == Certificate.CertificateType.SPEAKER:
        from apps.users.models import User

        speakers = Speaker.objects.all()
        for speaker in speakers:
            try:
                user = User.objects.get(full_name=speaker.name)
                participant = user.participant
            except (User.DoesNotExist, Participant.DoesNotExist):
                logger.warning(
                    "No participant found for speaker: %s. Skipping.",
                    speaker.name,
                )
                continue

            cert, created = Certificate.objects.get_or_create(
                participant=participant,
                certificate_type=Certificate.CertificateType.SPEAKER,
                workshop=None,
                defaults={"hours": 8},
            )
            if created:
                generate_certificate_pdf.delay(cert.id)
                created_count += 1

    logger.info(
        "Bulk certificate generation complete. Type=%s, created=%d",
        certificate_type,
        created_count,
    )
    return {"certificate_type": certificate_type, "created": created_count}
