from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    participant_name = serializers.CharField(
        source="participant.user.full_name", read_only=True
    )
    participant_email = serializers.EmailField(
        source="participant.user.email", read_only=True
    )
    certificate_type_display = serializers.CharField(
        source="get_certificate_type_display", read_only=True
    )
    workshop_name = serializers.CharField(
        source="workshop.name", read_only=True, default=None
    )
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            "id",
            "participant_name",
            "participant_email",
            "certificate_type",
            "certificate_type_display",
            "workshop",
            "workshop_name",
            "issued_at",
            "validation_code",
            "hours",
            "download_url",
        ]
        read_only_fields = fields

    def get_download_url(self, obj):
        if obj.pdf_file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None


class CertificateValidationSerializer(serializers.Serializer):
    validation_code = serializers.UUIDField()

    def validate_validation_code(self, value):
        try:
            certificate = Certificate.objects.select_related(
                "participant__user", "workshop"
            ).get(validation_code=value)
        except Certificate.DoesNotExist:
            raise serializers.ValidationError(
                "Codigo de validacion no encontrado."
            )
        return value
