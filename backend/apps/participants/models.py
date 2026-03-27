import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class ParticipantType(models.Model):
    """
    Defines the type/role of a participant at the congress.
    Seeded with: student, professional, speaker, organizer.
    """

    class TypeChoices(models.TextChoices):
        STUDENT = "student", _("Estudiante")
        PROFESSIONAL = "professional", _("Profesional")
        SPEAKER = "speaker", _("Ponente")
        ORGANIZER = "organizer", _("Organizador")

    name = models.CharField(
        _("nombre"),
        max_length=50,
        choices=TypeChoices.choices,
        unique=True,
    )
    description = models.TextField(
        _("descripcion"),
        blank=True,
        default="",
    )
    is_active = models.BooleanField(
        _("activo"),
        default=True,
    )
    created_at = models.DateTimeField(
        _("fecha de creacion"),
        auto_now_add=True,
    )

    class Meta:
        db_table = "participant_types"
        verbose_name = _("tipo de participante")
        verbose_name_plural = _("tipos de participante")
        ordering = ["name"]

    def __str__(self):
        return self.get_name_display()


class Participant(models.Model):
    """
    Represents a congress participant, linked one-to-one with a User.
    Tracks accreditation status, payment, ticket, and workshop selections.
    """

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", _("Pendiente")
        PAID = "paid", _("Pagado")
        CANCELLED = "cancelled", _("Cancelado")

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="participant",
        verbose_name=_("usuario"),
    )
    participant_type = models.ForeignKey(
        ParticipantType,
        on_delete=models.PROTECT,
        related_name="participants",
        verbose_name=_("tipo de participante"),
    )
    is_accredited = models.BooleanField(
        _("acreditado"),
        default=False,
        db_index=True,
    )
    accredited_at = models.DateTimeField(
        _("fecha de acreditacion"),
        null=True,
        blank=True,
    )
    accredited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accreditations_made",
        verbose_name=_("acreditado por"),
    )
    qr_code = models.ImageField(
        _("codigo QR"),
        upload_to="participants/qr_codes/",
        blank=True,
    )
    qr_token = models.UUIDField(
        _("token QR"),
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )
    payment_status = models.CharField(
        _("estado de pago"),
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True,
    )
    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="participants",
        verbose_name=_("ticket"),
    )
    selected_workshops = models.ManyToManyField(
        "workshops.Workshop",
        blank=True,
        related_name="participants",
        verbose_name=_("talleres seleccionados"),
    )
    created_at = models.DateTimeField(
        _("fecha de creacion"),
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        _("fecha de actualizacion"),
        auto_now=True,
    )

    class Meta:
        db_table = "participants"
        verbose_name = _("participante")
        verbose_name_plural = _("participantes")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.full_name} - {self.participant_type}"
