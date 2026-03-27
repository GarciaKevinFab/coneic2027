from django.urls import path

from . import views

app_name = "core"

urlpatterns = [
    # Admin participants
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
    # Admin payments
    path(
        "payments/",
        views.AdminPaymentsView.as_view(),
        name="admin-payments",
    ),
    # Admin accreditation
    path(
        "accredit/",
        views.AdminAccreditView.as_view(),
        name="admin-accredit",
    ),
    # Admin dashboard stats
    path(
        "stats/",
        views.AdminStatsView.as_view(),
        name="admin-stats",
    ),
    # Admin workshops report
    path(
        "workshops/report/",
        views.AdminWorkshopsReportView.as_view(),
        name="admin-workshops-report",
    ),
]
