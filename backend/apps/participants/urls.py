from django.urls import path

from . import views

app_name = "participants"

urlpatterns = [
    path(
        "participants/",
        views.ParticipantListView.as_view(),
        name="participant-list",
    ),
    path(
        "participants/me/",
        views.MyParticipantView.as_view(),
        name="my-participant",
    ),
    path(
        "participants/accreditate/",
        views.AccreditateView.as_view(),
        name="accreditate",
    ),
    path(
        "participants/stats/",
        views.ParticipantStatsView.as_view(),
        name="participant-stats",
    ),
]
