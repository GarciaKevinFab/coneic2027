import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class TicketType(models.Model):
    """
    Defines the different ticket tiers available for CONEIC 2027.
    Each type has its own pricing, benefits, workshop access, and capacity.
    """

    name = models.CharField(
        max_length=100,
        verbose_name="Nombre",
    )
    description = models.TextField(
        blank=True,
        default="",
        verbose_name="Descripcion",
    )
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Precio (PEN)",
    )
    benefits = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Beneficios",
        help_text="Lista JSON de beneficios incluidos en este tipo de entrada.",
    )
    includes_workshops = models.BooleanField(
        default=False,
        verbose_name="Incluye talleres",
    )
    max_workshop_slots = models.PositiveIntegerField(
        default=0,
        verbose_name="Cupos de talleres",
        help_text="Numero maximo de talleres a los que puede inscribirse.",
    )
    capacity = models.PositiveIntegerField(
        verbose_name="Capacidad total",
    )
    sold_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Vendidos",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Activo",
    )
    available_until = models.DateTimeField(
        verbose_name="Disponible hasta",
        help_text="Fecha limite para adquirir este tipo de entrada.",
    )

    class Meta:
        verbose_name = "Tipo de entrada"
        verbose_name_plural = "Tipos de entrada"
        ordering = ["price"]

    def __str__(self):
        return f"{self.name} - S/ {self.price}"

    @property
    def available_count(self):
        """Number of tickets still available for purchase."""
        return max(self.capacity - self.sold_count, 0)

    @property
    def is_sold_out(self):
        return self.available_count <= 0


class Ticket(models.Model):
    """
    Represents a single purchased ticket linking a user to a ticket type.
    Tracks payment status and stores receipt information.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        CONFIRMED = "confirmed", "Confirmado"
        CANCELLED = "cancelled", "Cancelado"

    class PaymentMethod(models.TextChoices):
        CULQI = "culqi", "Tarjeta (Culqi)"
        YAPE = "yape", "Yape"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="tickets",
        verbose_name="Usuario",
    )
    ticket_type = models.ForeignKey(
        TicketType,
        on_delete=models.PROTECT,
        related_name="tickets",
        verbose_name="Tipo de entrada",
    )
    purchase_code = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name="Codigo de compra",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
        verbose_name="Estado",
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        verbose_name="Metodo de pago",
    )
    payment_reference = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Referencia de pago",
        help_text="ID de cargo en Culqi u otra referencia externa.",
    )
    amount_paid = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Monto pagado (PEN)",
    )
    purchased_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de compra",
    )
    receipt_pdf = models.FileField(
        upload_to="receipts/%Y/%m/",
        blank=True,
        null=True,
        verbose_name="Comprobante PDF",
    )

    class Meta:
        verbose_name = "Entrada"
        verbose_name_plural = "Entradas"
        ordering = ["-purchased_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(status__in=["pending", "confirmed"]),
                name="unique_active_ticket_per_user",
            ),
        ]

    def __str__(self):
        return (
            f"{self.user} - {self.ticket_type.name} "
            f"({self.get_status_display()})"
        )
