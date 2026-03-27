from rest_framework import serializers

from apps.tickets.models import Ticket, TicketType


class TicketTypeSerializer(serializers.ModelSerializer):
    """Public serializer for listing available ticket types."""

    available_count = serializers.SerializerMethodField()

    class Meta:
        model = TicketType
        fields = [
            "id",
            "name",
            "description",
            "price",
            "benefits",
            "includes_workshops",
            "max_workshop_slots",
            "capacity",
            "sold_count",
            "available_count",
            "available_until",
        ]
        read_only_fields = fields

    def get_available_count(self, obj):
        return obj.available_count


class TicketSerializer(serializers.ModelSerializer):
    """Full ticket representation returned to the ticket owner."""

    ticket_type = TicketTypeSerializer(read_only=True)
    qr_data = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_type",
            "purchase_code",
            "status",
            "payment_method",
            "payment_reference",
            "amount_paid",
            "purchased_at",
            "receipt_pdf",
            "qr_data",
        ]
        read_only_fields = fields

    def get_qr_data(self, obj):
        """
        Data encoded in the attendee QR code.
        Contains the purchase code which staff scan for check-in.
        """
        if obj.status != Ticket.Status.CONFIRMED:
            return None
        return {
            "purchase_code": str(obj.purchase_code),
            "user_id": obj.user_id,
            "ticket_type": obj.ticket_type.name,
        }


class PurchaseSerializer(serializers.Serializer):
    """
    Input serializer for initiating a ticket purchase.
    Validates availability before creating a pending ticket.
    """

    ticket_type_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Ticket.PaymentMethod.choices)

    def validate_ticket_type_id(self, value):
        from django.utils import timezone

        try:
            ticket_type = TicketType.objects.get(pk=value)
        except TicketType.DoesNotExist:
            raise serializers.ValidationError(
                "El tipo de entrada no existe."
            )

        if not ticket_type.is_active:
            raise serializers.ValidationError(
                "Este tipo de entrada no esta disponible."
            )

        if ticket_type.available_until < timezone.now():
            raise serializers.ValidationError(
                "El periodo de venta para este tipo de entrada ha finalizado."
            )

        if ticket_type.is_sold_out:
            raise serializers.ValidationError(
                "Este tipo de entrada esta agotado."
            )

        return value

    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user:
            has_active = Ticket.objects.filter(
                user=request.user,
                status__in=[Ticket.Status.PENDING, Ticket.Status.CONFIRMED],
            ).exists()
            if has_active:
                raise serializers.ValidationError(
                    "Ya tienes una entrada activa o pendiente de pago."
                )
        return attrs


class TicketConfirmSerializer(serializers.Serializer):
    """
    Input serializer for confirming payment on a pending ticket.
    Used by the Culqi webhook callback.
    """

    purchase_code = serializers.UUIDField()
    culqi_charge_id = serializers.CharField(max_length=255)
    amount_cents = serializers.IntegerField(min_value=1)
