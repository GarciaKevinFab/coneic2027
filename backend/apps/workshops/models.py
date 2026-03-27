from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Speaker(models.Model):
    """
    Speaker / instructor / guide for workshops, talks, and technical visits.
    """

    name = models.CharField(
        _("nombre"),
        max_length=255,
    )
    bio = models.TextField(
        _("biografia"),
        blank=True,
        default="",
    )
    photo = models.ImageField(
        _("foto"),
        upload_to="speakers/photos/%Y/",
        blank=True,
        null=True,
    )
    topic = models.CharField(
        _("tema / especialidad"),
        max_length=255,
        blank=True,
        default="",
    )
    organization = models.CharField(
        _("organizacion"),
        max_length=255,
        blank=True,
        default="",
        help_text=_("Universidad, empresa o institucion a la que pertenece."),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "speakers"
        verbose_name = _("ponente")
        verbose_name_plural = _("ponentes")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Workshop(models.Model):
    """
    Workshop, talk, or technical visit offered during the congress.
    """

    class WorkshopType(models.TextChoices):
        WORKSHOP = "workshop", _("Taller")
        TALK = "talk", _("Charla")
        TECHNICAL_VISIT = "technical_visit", _("Visita tecnica")

    name = models.CharField(
        _("nombre"),
        max_length=255,
    )
    description = models.TextField(
        _("descripcion"),
        blank=True,
        default="",
    )
    workshop_type = models.CharField(
        _("tipo"),
        max_length=20,
        choices=WorkshopType.choices,
        default=WorkshopType.WORKSHOP,
        db_index=True,
    )
    speaker = models.ForeignKey(
        Speaker,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="workshops",
        verbose_name=_("ponente"),
    )
    start_time = models.DateTimeField(
        _("inicio"),
    )
    end_time = models.DateTimeField(
        _("fin"),
    )
    location = models.CharField(
        _("ubicacion"),
        max_length=255,
        blank=True,
        default="",
    )
    capacity = models.PositiveIntegerField(
        _("capacidad"),
        default=0,
        help_text=_("0 = sin limite."),
    )
    enrolled_count = models.PositiveIntegerField(
        _("inscritos"),
        default=0,
    )
    required_ticket_types = models.ManyToManyField(
        "tickets.TicketType",
        blank=True,
        related_name="workshops",
        verbose_name=_("tipos de entrada requeridos"),
        help_text=_("Dejar vacio si esta abierto a todos los tipos de entrada."),
    )
    is_active = models.BooleanField(
        _("activo"),
        default=True,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "workshops"
        verbose_name = _("taller")
        verbose_name_plural = _("talleres")
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.name} ({self.get_workshop_type_display()})"

    @property
    def available_slots(self):
        """Return remaining slots, or None if unlimited."""
        if self.capacity == 0:
            return None
        return max(0, self.capacity - self.enrolled_count)

    @property
    def is_full(self):
        if self.capacity == 0:
            return False
        return self.enrolled_count >= self.capacity


class WorkshopEnrollment(models.Model):
    """
    Tracks which participants are enrolled in which workshops.
    """

    workshop = models.ForeignKey(
        Workshop,
        on_delete=models.CASCADE,
        related_name="enrollments",
        verbose_name=_("taller"),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="workshop_enrollments",
        verbose_name=_("usuario"),
    )
    enrolled_at = models.DateTimeField(
        _("fecha de inscripcion"),
        auto_now_add=True,
    )

    class Meta:
        db_table = "workshop_enrollments"
        verbose_name = _("inscripcion a taller")
        verbose_name_plural = _("inscripciones a talleres")
        ordering = ["-enrolled_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["workshop", "user"],
                name="unique_workshop_enrollment",
            ),
        ]

    def __str__(self):
        return f"{self.user.full_name} -> {self.workshop.name}"
