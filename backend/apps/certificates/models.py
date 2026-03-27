import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


class Certificate(models.Model):
    """
    Issued certificate for a participant's involvement in the congress.
    """

    class CertificateType(models.TextChoices):
        ATTENDANCE = "attendance", _("Asistencia")
        WORKSHOP = "workshop", _("Taller")
        SPEAKER = "speaker", _("Ponente")

    participant = models.ForeignKey(
        "participants.Participant",
        on_delete=models.CASCADE,
        related_name="certificates",
        verbose_name=_("participante"),
    )
    certificate_type = models.CharField(
        _("tipo de certificado"),
        max_length=20,
        choices=CertificateType.choices,
        db_index=True,
    )
    workshop = models.ForeignKey(
        "workshops.Workshop",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="certificates",
        verbose_name=_("taller"),
        help_text=_("Solo aplica para certificados de tipo taller."),
    )
    issued_at = models.DateTimeField(
        _("fecha de emision"),
        auto_now_add=True,
    )
    validation_code = models.UUIDField(
        _("codigo de validacion"),
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )
    pdf_file = models.FileField(
        _("archivo PDF"),
        upload_to="certificates/%Y/%m/",
        blank=True,
        null=True,
    )
    hours = models.PositiveIntegerField(
        _("horas"),
        default=8,
        help_text=_("Horas academicas certificadas."),
    )

    class Meta:
        db_table = "certificates"
        verbose_name = _("certificado")
        verbose_name_plural = _("certificados")
        ordering = ["-issued_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["participant", "certificate_type", "workshop"],
                name="unique_certificate_per_participant_type_workshop",
            ),
        ]

    def __str__(self):
        label = self.get_certificate_type_display()
        if self.workshop:
            label += f" - {self.workshop.name}"
        return f"{self.participant} | {label}"
