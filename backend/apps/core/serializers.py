from rest_framework import serializers

from apps.participants.models import Participant, ParticipantType
from apps.payments.models import PaymentLog
from apps.workshops.models import Workshop


class AdminParticipantSerializer(serializers.ModelSerializer):
    """Serializer for the admin participants list with user details."""

    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    university = serializers.CharField(source="user.university", read_only=True)
    participant_type_name = serializers.CharField(
        source="participant_type.name", read_only=True, default=None
    )
    ticket_type = serializers.CharField(
        source="ticket.ticket_type.name", read_only=True, default=None
    )

    class Meta:
        model = Participant
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "university",
            "participant_type",
            "participant_type_name",
            "ticket_type",
            "payment_status",
            "qr_token",
            "is_accredited",
            "accredited_at",
            "created_at",
        ]
        read_only_fields = fields


class AdminPaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment log entries in the admin report."""

    user_name = serializers.CharField(
        source="ticket.user.full_name", read_only=True
    )
    user_email = serializers.EmailField(
        source="ticket.user.email", read_only=True
    )
    ticket_type = serializers.CharField(
        source="ticket.ticket_type.name", read_only=True
    )

    class Meta:
        model = PaymentLog
        fields = [
            "id",
            "user_name",
            "user_email",
            "ticket_type",
            "amount",
            "currency",
            "payment_method",
            "status",
            "culqi_charge_id",
            "created_at",
        ]
        read_only_fields = fields


class AdminWorkshopReportSerializer(serializers.ModelSerializer):
    """Serializer for workshop occupancy report."""

    available_slots = serializers.SerializerMethodField()
    occupancy_pct = serializers.SerializerMethodField()
    speaker_name = serializers.CharField(
        source="speaker.name", read_only=True, default=None
    )

    class Meta:
        model = Workshop
        fields = [
            "id",
            "name",
            "workshop_type",
            "speaker_name",
            "start_time",
            "end_time",
            "location",
            "capacity",
            "enrolled_count",
            "available_slots",
            "occupancy_pct",
            "is_active",
        ]
        read_only_fields = fields

    def get_available_slots(self, obj):
        return obj.available_slots

    def get_occupancy_pct(self, obj):
        if obj.capacity == 0:
            return None
        return round((obj.enrolled_count / obj.capacity) * 100, 1)


class AccreditSerializer(serializers.Serializer):
    """Serializer for accreditation by QR token."""

    qr_token = serializers.UUIDField()
