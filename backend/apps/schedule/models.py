from django.db import models
from django.utils.translation import gettext_lazy as _


class ScheduleDay(models.Model):
    """
    Represents one day of the congress schedule.
    """

    date = models.DateField(
        _("fecha"),
        unique=True,
    )
    title = models.CharField(
        _("titulo"),
        max_length=255,
        help_text=_("Ej: Dia 1 - Inauguracion"),
    )
    description = models.TextField(
        _("descripcion"),
        blank=True,
        default="",
    )

    class Meta:
        db_table = "schedule_days"
        verbose_name = _("dia del cronograma")
        verbose_name_plural = _("dias del cronograma")
        ordering = ["date"]

    def __str__(self):
        return f"{self.date} - {self.title}"


class ScheduleItem(models.Model):
    """
    A single item/event within a schedule day.
    """

    class ItemType(models.TextChoices):
        CONFERENCE = "conference", _("Conferencia")
        WORKSHOP = "workshop", _("Taller")
        BREAK = "break", _("Receso")
        CEREMONY = "ceremony", _("Ceremonia")
        SOCIAL = "social", _("Social")

    day = models.ForeignKey(
        ScheduleDay,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name=_("dia"),
    )
    title = models.CharField(
        _("titulo"),
        max_length=255,
    )
    description = models.TextField(
        _("descripcion"),
        blank=True,
        default="",
    )
    start_time = models.TimeField(
        _("hora de inicio"),
    )
    end_time = models.TimeField(
        _("hora de fin"),
    )
    location = models.CharField(
        _("ubicacion"),
        max_length=255,
        blank=True,
        default="",
    )
    item_type = models.CharField(
        _("tipo"),
        max_length=20,
        choices=ItemType.choices,
        default=ItemType.CONFERENCE,
        db_index=True,
    )
    workshop = models.ForeignKey(
        "workshops.Workshop",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="schedule_items",
        verbose_name=_("taller vinculado"),
    )
    speaker = models.ForeignKey(
        "workshops.Speaker",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="schedule_items",
        verbose_name=_("ponente"),
    )
    is_featured = models.BooleanField(
        _("destacado"),
        default=False,
        db_index=True,
    )
    order = models.PositiveIntegerField(
        _("orden"),
        default=0,
        help_text=_("Para ordenar items con la misma hora de inicio."),
    )

    class Meta:
        db_table = "schedule_items"
        verbose_name = _("actividad del cronograma")
        verbose_name_plural = _("actividades del cronograma")
        ordering = ["day__date", "start_time", "order"]

    def __str__(self):
        return f"{self.day.date} {self.start_time} - {self.title}"
