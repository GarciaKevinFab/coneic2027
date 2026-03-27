from rest_framework import serializers

from .models import Speaker, Workshop, WorkshopEnrollment


class SpeakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Speaker
        fields = [
            "id",
            "name",
            "bio",
            "photo",
            "topic",
            "organization",
        ]
        read_only_fields = fields


class WorkshopSerializer(serializers.ModelSerializer):
    speaker = SpeakerSerializer(read_only=True)
    available_slots = serializers.SerializerMethodField()
    is_full = serializers.BooleanField(read_only=True)
    workshop_type_display = serializers.CharField(
        source="get_workshop_type_display", read_only=True
    )
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Workshop
        fields = [
            "id",
            "name",
            "description",
            "workshop_type",
            "workshop_type_display",
            "speaker",
            "start_time",
            "end_time",
            "location",
            "capacity",
            "enrolled_count",
            "available_slots",
            "is_full",
            "is_active",
            "is_enrolled",
        ]
        read_only_fields = fields

    def get_available_slots(self, obj):
        return obj.available_slots

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            # Use prefetched data if available
            if hasattr(obj, "_prefetched_objects_cache") and "enrollments" in obj._prefetched_objects_cache:
                return any(e.user_id == request.user.id for e in obj.enrollments.all())
            return obj.enrollments.filter(user=request.user).exists()
        return False


class WorkshopEnrollSerializer(serializers.Serializer):
    """Serializer for enrollment request validation."""

    workshop_id = serializers.IntegerField()

    def validate_workshop_id(self, value):
        try:
            workshop = Workshop.objects.get(pk=value, is_active=True)
        except Workshop.DoesNotExist:
            raise serializers.ValidationError(
                "El taller no existe o no esta activo."
            )
        if workshop.is_full:
            raise serializers.ValidationError(
                "El taller esta lleno. No hay cupos disponibles."
            )
        return value


class WorkshopEnrollmentSerializer(serializers.ModelSerializer):
    workshop = WorkshopSerializer(read_only=True)

    class Meta:
        model = WorkshopEnrollment
        fields = ["id", "workshop", "enrolled_at"]
        read_only_fields = fields
