from django.urls import path

from . import views

app_name = "institutional"

urlpatterns = [
    path("event/", views.EventInfoView.as_view(), name="event-info"),
    path("sponsors/", views.SponsorListView.as_view(), name="sponsor-list"),
    path("committee/", views.CommitteeListView.as_view(), name="committee-list"),
]
