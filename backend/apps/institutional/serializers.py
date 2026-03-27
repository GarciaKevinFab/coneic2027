from rest_framework import serializers

from .models import EventInfo, OrganizingCommittee, Sponsor


class EventInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventInfo
        fields = [
            "id",
            "name",
            "description",
            "edition",
            "host_university",
            "city",
            "country",
            "start_date",
            "end_date",
            "venue",
            "mission",
            "vision",
            "history",
        ]
        read_only_fields = fields


class SponsorSerializer(serializers.ModelSerializer):
    tier_display = serializers.CharField(
        source="get_tier_display", read_only=True
    )

    class Meta:
        model = Sponsor
        fields = [
            "id",
            "name",
            "logo",
            "website",
            "tier",
            "tier_display",
            "order",
        ]
        read_only_fields = fields


class OrganizingCommitteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizingCommittee
        fields = [
            "id",
            "name",
            "role",
            "university",
            "photo",
            "order",
        ]
        read_only_fields = fields
