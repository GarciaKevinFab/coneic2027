from rest_framework import serializers

from apps.payments.models import PaymentLog


class CulqiChargeSerializer(serializers.Serializer):
    """
    Input for processing a card payment through Culqi.
    The ``token`` is generated client-side by Culqi.js / Culqi Checkout.
    """

    token = serializers.CharField(
        max_length=255,
        help_text="Token de Culqi generado en el frontend (tkn_...).",
    )
    purchase_code = serializers.UUIDField(
        help_text="Codigo de compra de la entrada pendiente.",
    )
    email = serializers.EmailField(
        help_text="Correo electronico del comprador.",
    )


class YapeChargeSerializer(serializers.Serializer):
    """
    Input for processing a YAPE payment through Culqi.
    The user provides their phone number and the OTP from the YAPE app.
    """

    phone = serializers.RegexField(
        regex=r"^9\d{8}$",
        help_text="Numero de telefono registrado en YAPE (9 digitos, inicia con 9).",
    )
    otp = serializers.CharField(
        min_length=6,
        max_length=6,
        help_text="Codigo OTP de 6 digitos generado en la app de YAPE.",
    )
    purchase_code = serializers.UUIDField(
        help_text="Codigo de compra de la entrada pendiente.",
    )


class PaymentStatusSerializer(serializers.ModelSerializer):
    """Read-only representation of a payment log entry."""

    class Meta:
        model = PaymentLog
        fields = [
            "id",
            "ticket",
            "amount",
            "currency",
            "payment_method",
            "culqi_charge_id",
            "status",
            "created_at",
        ]
        read_only_fields = fields
