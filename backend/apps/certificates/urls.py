from django.urls import path

from . import views

app_name = "certificates"

urlpatterns = [
    path("generate/", views.GenerateCertificatesView.as_view(), name="generate"),
    path("my/", views.MyCertificatesView.as_view(), name="my-certificates"),
    path(
        "<int:pk>/download/",
        views.DownloadCertificateView.as_view(),
        name="download",
    ),
    path(
        "validate/<uuid:code>/",
        views.ValidateCertificateView.as_view(),
        name="validate",
    ),
]
