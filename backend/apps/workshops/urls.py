from django.urls import path

from . import views

app_name = "workshops"

urlpatterns = [
    path("", views.WorkshopListView.as_view(), name="workshop-list"),
    path("my/", views.MyWorkshopsView.as_view(), name="my-workshops"),
    path("speakers/", views.SpeakerListView.as_view(), name="speaker-list"),
    path("<int:pk>/", views.WorkshopDetailView.as_view(), name="workshop-detail"),
    path("<int:pk>/enroll/", views.EnrollView.as_view(), name="workshop-enroll"),
]
