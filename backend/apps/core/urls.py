from django.urls import path

from . import views

app_name = "core"

urlpatterns = [
    # Participants management
    path(
        "participants/",
        views.AdminParticipantsView.as_view(),
        name="admin-participants",
    ),
    path(
        "participants/export/",
        views.ExportParticipantsView.as_view(),
        name="admin-participants-export",
    ),
    # Payments report
    path(
        "payments/",
        views.AdminPaymentsView.as_view(),
        name="admin-payments",
    ),
    # Accreditation
    path(
        "accredit/",
        views.AdminAccreditView.as_view(),
        name="admin-accredit",
    ),
    # Dashboard stats
    path(
        "stats/",
        views.AdminStatsView.as_view(),
        name="admin-stats",
    ),
    # Workshop occupancy report
    path(
        "workshops/report/",
        views.AdminWorkshopsReportView.as_view(),
        name="admin-workshops-report",
    ),
]
