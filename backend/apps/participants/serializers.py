from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from apps.users.serializers import UserProfileSerializer

from .models import Participant, ParticipantType


class ParticipantTypeSerializer(serializers.ModelSerializer):
    """Serializer for ParticipantType model."""

    display_name = serializers.CharField(source="get_name_display", read_only=True)

    class Meta:
        model = ParticipantType
        fields = [
            "id",
            "name",
            "display_name",
            "description",
            "is_active",
        ]
        read_only_fields = ["id"]


class ParticipantSerializer(serializers.ModelSerializer):
    """
    Full serializer for Participant with nested user and type details.
    Used for list/detail views.
    """

    user = UserProfileSerializer(read_only=True)
    participant_type = ParticipantTypeSerializer(read_only=True)
    participant_type_id = serializers.PrimaryKeyRelatedField(
        queryset=ParticipantType.objects.filter(is_active=True),
        source="participant_type",
        write_only=True,
    )
    payment_status_display = serializers.CharField(
        source="get_payment_status_display",
        read_only=True,
    )
    selected_workshops_count = serializers.IntegerField(
        source="selected_workshops.count",
        read_only=True,
    )

    class Meta:
        model = Participant
        fields = [
            "id",
            "user",
            "participant_type",
            "participant_type_id",
            "is_accredited",
            "accredited_at",
            "qr_code",
            "qr_token",
            "payment_status",
            "payment_status_display",
            "ticket",
            "selected_workshops",
            "selected_workshops_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "is_accredited",
            "accredited_at",
            "qr_code",
            "qr_token",
            "created_at",
            "updated_at",
        ]


class AccreditationSerializer(serializers.Serializer):
    """
    Serializer for accrediting a participant by their QR token.
    Used by organizers at the event check-in.
    """

    qr_token = serializers.UUIDField()

    def validate_qr_token(self, value):
        try:
            participant = Participant.objects.select_related(
                "user", "participant_type"
            ).get(qr_token=value)
        except Participant.DoesNotExist:
            raise serializers.ValidationError(
                _("No se encontró un participante con este código QR.")
            )

        if participant.is_accredited:
            raise serializers.ValidationError(
                _("Este participante ya fue acreditado.")
            )

        if participant.payment_status != Participant.PaymentStatus.PAID:
            raise serializers.ValidationError(
                _("El participante no tiene un pago confirmado.")
            )

        return value


class ParticipantStatsSerializer(serializers.Serializer):
    """Serializer for participant statistics (read-only)."""

    total_participants = serializers.IntegerField()
    accredited_count = serializers.IntegerField()
    pending_accreditation = serializers.IntegerField()
    payment_pending = serializers.IntegerField()
    payment_paid = serializers.IntegerField()
    payment_cancelled = serializers.IntegerField()
    by_type = serializers.ListField(child=serializers.DictField())
