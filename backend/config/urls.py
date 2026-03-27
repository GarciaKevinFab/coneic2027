"""
URL configuration for CONEIC 2027 Congress Management System.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    """Simple health check endpoint for load balancers and monitoring."""
    return JsonResponse({"status": "ok", "service": "coneic2027-api"})


urlpatterns = [
    # Health check
    path("api/health/", health_check, name="health-check"),
    # Admin
    path("admin/", admin.site.urls),
    # API v1 - Authentication
    path("api/v1/", include("apps.users.urls", namespace="users")),
    # API v1 - Participants
    path("api/v1/", include("apps.participants.urls", namespace="participants")),
    # API v1 - Tickets
    path("api/v1/tickets/", include("apps.tickets.urls", namespace="tickets")),
    # API v1 - Workshops
    path("api/v1/workshops/", include("apps.workshops.urls", namespace="workshops")),
    # API v1 - Schedule
    path("api/v1/schedule/", include("apps.schedule.urls", namespace="schedule")),
    # API v1 - Payments
    path("api/v1/payments/", include("apps.payments.urls", namespace="payments")),
    # API v1 - Certificates
    path(
        "api/v1/certificates/",
        include("apps.certificates.urls", namespace="certificates"),
    ),
    # API v1 - Institutional
    path(
        "api/v1/institutional/",
        include("apps.institutional.urls", namespace="institutional"),
    ),
    # API v1 - Admin / Core
    path("api/v1/admin/", include("apps.core.urls", namespace="core")),
    # JWT token endpoints
    path("api/v1/token/", include("rest_framework_simplejwt.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Admin site customization
admin.site.site_header = "CONEIC 2027 - Panel de Administracion"
admin.site.site_title = "CONEIC 2027"
admin.site.index_title = "Gestion del Congreso"
