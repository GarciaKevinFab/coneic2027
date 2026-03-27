from django.urls import path

from apps.tickets import views

app_name = "tickets"

urlpatterns = [
    path(
        "types/",
        views.TicketTypeListView.as_view(),
        name="ticket-type-list",
    ),
    path(
        "purchase/",
        views.PurchaseView.as_view(),
        name="purchase",
    ),
    path(
        "confirm/",
        views.ConfirmPaymentView.as_view(),
        name="confirm-payment",
    ),
    path(
        "me/",
        views.MyTicketView.as_view(),
        name="my-ticket",
    ),
    path(
        "receipt/<uuid:purchase_code>/",
        views.ReceiptDownloadView.as_view(),
        name="receipt-download",
    ),
]
