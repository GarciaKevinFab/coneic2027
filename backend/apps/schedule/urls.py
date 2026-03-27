from django.urls import path

from . import views

app_name = "schedule"

urlpatterns = [
    path("", views.ScheduleListView.as_view(), name="schedule-list"),
    path("by-type/", views.ScheduleByTypeView.as_view(), name="schedule-by-type"),
    path("<str:date>/", views.ScheduleDayView.as_view(), name="schedule-day"),
]
