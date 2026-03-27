from rest_framework import serializers

from apps.workshops.serializers import SpeakerSerializer

from .models import ScheduleDay, ScheduleItem


class ScheduleItemSerializer(serializers.ModelSerializer):
    item_type_display = serializers.CharField(
        source="get_item_type_display", read_only=True
    )
    speaker_name = serializers.CharField(
        source="speaker.name", read_only=True, default=None
    )
    workshop_name = serializers.CharField(
        source="workshop.name", read_only=True, default=None
    )

    class Meta:
        model = ScheduleItem
        fields = [
            "id",
            "title",
            "description",
            "start_time",
            "end_time",
            "location",
            "item_type",
            "item_type_display",
            "workshop",
            "workshop_name",
            "speaker",
            "speaker_name",
            "is_featured",
            "order",
        ]
        read_only_fields = fields


class ScheduleDaySerializer(serializers.ModelSerializer):
    items = ScheduleItemSerializer(many=True, read_only=True)

    class Meta:
        model = ScheduleDay
        fields = [
            "id",
            "date",
            "title",
            "description",
            "items",
        ]
        read_only_fields = fields
