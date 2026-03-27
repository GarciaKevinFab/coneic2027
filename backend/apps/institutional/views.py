from collections import OrderedDict

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EventInfo, OrganizingCommittee, Sponsor
from .serializers import (
    EventInfoSerializer,
    OrganizingCommitteeSerializer,
    SponsorSerializer,
)


class EventInfoView(APIView):
    """
    GET /api/v1/institutional/event/
    Returns the singleton EventInfo object.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        info = EventInfo.load()
        serializer = EventInfoSerializer(info, context={"request": request})
        return Response(serializer.data)


class SponsorListView(APIView):
    """
    GET /api/v1/institutional/sponsors/
    Returns sponsors grouped by tier in order: platinum, gold, silver, bronze, media.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sponsors = Sponsor.objects.all()
        serializer = SponsorSerializer(
            sponsors, many=True, context={"request": request}
        )

        # Group by tier preserving the defined order
        tier_order = [choice[0] for choice in Sponsor.Tier.choices]
        grouped = OrderedDict()
        for tier in tier_order:
            grouped[tier] = []

        for sponsor_data in serializer.data:
            tier = sponsor_data["tier"]
            if tier in grouped:
                grouped[tier].append(sponsor_data)

        # Remove empty tiers
        grouped = OrderedDict(
            (k, v) for k, v in grouped.items() if v
        )

        return Response(grouped)


class CommitteeListView(generics.ListAPIView):
    """
    GET /api/v1/institutional/committee/
    Returns all organizing committee members in order.
    """

    serializer_class = OrganizingCommitteeSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    queryset = OrganizingCommittee.objects.all()
