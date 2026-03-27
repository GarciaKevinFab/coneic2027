from django.db import models


class PaymentLog(models.Model):
    """
    Immutable log of every payment attempt processed through Culqi.
    Stores the raw API response for auditing and dispute resolution.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        SUCCESS = "success", "Exitoso"
        FAILED = "failed", "Fallido"
        REFUNDED = "refunded", "Reembolsado"

    class PaymentMethod(models.TextChoices):
        CULQI = "culqi", "Tarjeta (Culqi)"
        YAPE = "yape", "Yape"

    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.PROTECT,
        related_name="payment_logs",
        verbose_name="Entrada",
    )
    amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name="Monto (PEN)",
    )
    currency = models.CharField(
        max_length=3,
        default="PEN",
        verbose_name="Moneda",
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        verbose_name="Metodo de pago",
    )
    culqi_charge_id = models.CharField(
        max_length=255,
        blank=True,
        default="",
        db_index=True,
        verbose_name="ID de cargo Culqi",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
        verbose_name="Estado",
    )
    raw_response = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Respuesta cruda",
        help_text="Respuesta JSON completa de la API de Culqi.",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de creacion",
    )

    class Meta:
        verbose_name = "Registro de pago"
        verbose_name_plural = "Registros de pago"
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"Pago {self.culqi_charge_id or 'sin-id'} - "
            f"S/ {self.amount} ({self.get_status_display()})"
        )
