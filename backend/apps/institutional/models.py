from django.db import models
from django.utils.translation import gettext_lazy as _


class SingletonModel(models.Model):
    """
    Abstract base class that enforces a single row in the database.
    """

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # Prevent deletion of the singleton

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class EventInfo(SingletonModel):
    """
    Singleton model storing general information about the CONEIC congress.
    Only one instance should ever exist.
    """

    name = models.CharField(
        _("nombre del evento"),
        max_length=255,
        default="CONEIC 2027",
    )
    description = models.TextField(
        _("descripcion"),
        blank=True,
        default="",
    )
    edition = models.CharField(
        _("edicion"),
        max_length=50,
        blank=True,
        default="",
        help_text=_("Ej: XXXII Edicion"),
    )
    host_university = models.CharField(
        _("universidad sede"),
        max_length=255,
        blank=True,
        default="",
    )
    city = models.CharField(
        _("ciudad"),
        max_length=100,
        blank=True,
        default="",
    )
    country = models.CharField(
        _("pais"),
        max_length=100,
        default="Peru",
    )
    start_date = models.DateField(
        _("fecha de inicio"),
        null=True,
        blank=True,
    )
    end_date = models.DateField(
        _("fecha de fin"),
        null=True,
        blank=True,
    )
    venue = models.CharField(
        _("sede / local"),
        max_length=255,
        blank=True,
        default="",
    )
    mission = models.TextField(
        _("mision"),
        blank=True,
        default="",
    )
    vision = models.TextField(
        _("vision"),
        blank=True,
        default="",
    )
    history = models.TextField(
        _("historia"),
        blank=True,
        default="",
    )

    class Meta:
        db_table = "event_info"
        verbose_name = _("informacion del evento")
        verbose_name_plural = _("informacion del evento")

    def __str__(self):
        return self.name


class Sponsor(models.Model):
    """
    Sponsors and partners of the congress, organized by tiers.
    """

    class Tier(models.TextChoices):
        PLATINUM = "platinum", _("Platino")
        GOLD = "gold", _("Oro")
        SILVER = "silver", _("Plata")
        BRONZE = "bronze", _("Bronce")
        MEDIA = "media", _("Media Partner")

    name = models.CharField(
        _("nombre"),
        max_length=255,
    )
    logo = models.ImageField(
        _("logo"),
        upload_to="sponsors/logos/",
    )
    website = models.URLField(
        _("sitio web"),
        blank=True,
        default="",
    )
    tier = models.CharField(
        _("nivel"),
        max_length=20,
        choices=Tier.choices,
        default=Tier.BRONZE,
        db_index=True,
    )
    order = models.PositiveIntegerField(
        _("orden"),
        default=0,
    )

    class Meta:
        db_table = "sponsors"
        verbose_name = _("patrocinador")
        verbose_name_plural = _("patrocinadores")
        ordering = ["tier", "order", "name"]

    def __str__(self):
        return "%s (%s)" % (self.name, self.get_tier_display())


class OrganizingCommittee(models.Model):
    """
    Members of the organizing committee.
    """

    name = models.CharField(
        _("nombre"),
        max_length=255,
    )
    role = models.CharField(
        _("cargo"),
        max_length=255,
    )
    university = models.CharField(
        _("universidad"),
        max_length=255,
        blank=True,
        default="",
    )
    photo = models.ImageField(
        _("foto"),
        upload_to="committee/photos/",
        blank=True,
        null=True,
    )
    order = models.PositiveIntegerField(
        _("orden"),
        default=0,
    )

    class Meta:
        db_table = "organizing_committee"
        verbose_name = _("miembro del comite organizador")
        verbose_name_plural = _("miembros del comite organizador")
        ordering = ["order", "name"]

    def __str__(self):
        return "%s - %s" % (self.name, self.role)
