from rest_framework import generics, permissions

from .models import ScheduleDay, ScheduleItem
from .serializers import ScheduleDaySerializer, ScheduleItemSerializer


class ScheduleListView(generics.ListAPIView):
    """
    GET /api/v1/schedule/
    Returns the full congress schedule grouped by day,
    with nested items for each day.
    """

    serializer_class = ScheduleDaySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Return all days without pagination

    def get_queryset(self):
        return (
            ScheduleDay.objects
            .prefetch_related(
                "items__workshop",
                "items__speaker",
            )
            .all()
        )


class ScheduleDayView(generics.RetrieveAPIView):
    """
    GET /api/v1/schedule/<date>/
    Returns a specific day's schedule.
    Accepts date in YYYY-MM-DD format as lookup.
    """

    serializer_class = ScheduleDaySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "date"

    def get_queryset(self):
        return (
            ScheduleDay.objects
            .prefetch_related(
                "items__workshop",
                "items__speaker",
            )
            .all()
        )


class ScheduleByTypeView(generics.ListAPIView):
    """
    GET /api/v1/schedule/by-type/?type=workshop
    Returns schedule items filtered by item_type.
    """

    serializer_class = ScheduleItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = (
            ScheduleItem.objects
            .select_related("day", "workshop", "speaker")
            .all()
        )
        item_type = self.request.query_params.get("type")
        if item_type:
            qs = qs.filter(item_type=item_type)
        is_featured = self.request.query_params.get("featured")
        if is_featured is not None:
            qs = qs.filter(is_featured=is_featured.lower() in ("true", "1", "yes"))
        return qs
