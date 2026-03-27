import io
import logging

import qrcode
from django.core.files.base import ContentFile
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Participant

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Participant)
def generate_qr_code(sender, instance, created, **kwargs):
    """
    Generate a QR code image when a Participant is created.
    The QR encodes the participant's unique qr_token UUID.
    Saves the image as a PNG to the qr_code ImageField.
    """
    if not created:
        return

    if instance.qr_code:
        return

    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(str(instance.qr_token))
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        filename = f"qr_{instance.qr_token}.png"
        instance.qr_code.save(
            filename,
            ContentFile(buffer.getvalue()),
            save=True,
        )

        logger.info(
            "QR code generated for participant %s (user: %s).",
            instance.id,
            instance.user_id,
        )
    except Exception as exc:
        logger.error(
            "Failed to generate QR code for participant %s: %s",
            instance.id,
            str(exc),
        )
