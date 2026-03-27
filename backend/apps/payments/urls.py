from django.urls import path

from apps.payments import views

app_name = "payments"

urlpatterns = [
    path(
        "charge/",
        views.CulqiChargeView.as_view(),
        name="culqi-charge",
    ),
    path(
        "yape/",
        views.YapeChargeView.as_view(),
        name="yape-charge",
    ),
    path(
        "webhook/",
        views.WebhookView.as_view(),
        name="webhook",
    ),
    path(
        "status/<uuid:purchase_code>/",
        views.PaymentStatusView.as_view(),
        name="payment-status",
    ),
]
