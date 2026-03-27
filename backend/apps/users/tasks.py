import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    name="users.send_verification_email",
)
def send_verification_email(self, user_id):
    """
    Send an email verification link to the newly registered user.
    Retries up to 3 times with a 60-second delay on failure.
    """
    from django.contrib.auth import get_user_model

    User = get_user_model()

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.error("send_verification_email: User with id=%s not found.", user_id)
        return

    if user.is_verified:
        logger.info(
            "send_verification_email: User %s is already verified.", user.email
        )
        return

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    verification_url = f"{frontend_url}/verify-email/{user.verification_token}"

    context = {
        "user": user,
        "verification_url": verification_url,
        "congress_name": "CONEIC 2027",
    }

    try:
        html_message = render_to_string(
            "emails/verification_email.html", context
        )
        plain_message = strip_tags(html_message)
    except Exception:
        # Fallback if template does not exist
        plain_message = (
            f"Hola {user.full_name},\n\n"
            f"Gracias por registrarte en CONEIC 2027.\n"
            f"Verifica tu correo electrónico haciendo clic en el siguiente enlace:\n\n"
            f"{verification_url}\n\n"
            f"Si no creaste esta cuenta, ignora este mensaje.\n\n"
            f"Saludos,\nEquipo CONEIC 2027"
        )
        html_message = None

    try:
        send_mail(
            subject="CONEIC 2027 - Verifica tu correo electrónico",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(
            "send_verification_email: Email sent successfully to %s.", user.email
        )
    except Exception as exc:
        logger.error(
            "send_verification_email: Failed to send email to %s. Error: %s",
            user.email,
            str(exc),
        )
        raise self.retry(exc=exc)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    name="users.send_password_reset_email",
)
def send_password_reset_email(self, user_id):
    """
    Send a password reset link to the user.
    Retries up to 3 times with a 60-second delay on failure.
    """
    from django.contrib.auth import get_user_model

    User = get_user_model()

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.error(
            "send_password_reset_email: User with id=%s not found.", user_id
        )
        return

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    reset_url = f"{frontend_url}/reset-password/{user.verification_token}"

    context = {
        "user": user,
        "reset_url": reset_url,
        "congress_name": "CONEIC 2027",
    }

    try:
        html_message = render_to_string(
            "emails/password_reset_email.html", context
        )
        plain_message = strip_tags(html_message)
    except Exception:
        # Fallback if template does not exist
        plain_message = (
            f"Hola {user.full_name},\n\n"
            f"Recibimos una solicitud para restablecer tu contraseña en CONEIC 2027.\n"
            f"Haz clic en el siguiente enlace para crear una nueva contraseña:\n\n"
            f"{reset_url}\n\n"
            f"Si no solicitaste este cambio, ignora este mensaje.\n\n"
            f"Saludos,\nEquipo CONEIC 2027"
        )
        html_message = None

    try:
        send_mail(
            subject="CONEIC 2027 - Restablece tu contraseña",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(
            "send_password_reset_email: Email sent successfully to %s.", user.email
        )
    except Exception as exc:
        logger.error(
            "send_password_reset_email: Failed to send email to %s. Error: %s",
            user.email,
            str(exc),
        )
        raise self.retry(exc=exc)
