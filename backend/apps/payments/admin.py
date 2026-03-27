from django.contrib import admin

from apps.payments.models import PaymentLog


@admin.register(PaymentLog)
class PaymentLogAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "ticket",
        "amount",
        "currency",
        "payment_method",
        "culqi_charge_id",
        "status",
        "created_at",
    ]
    list_filter = ["status", "payment_method", "currency"]
    search_fields = [
        "culqi_charge_id",
        "ticket__purchase_code",
        "ticket__user__email",
    ]
    readonly_fields = [
        "ticket",
        "amount",
        "currency",
        "payment_method",
        "culqi_charge_id",
        "status",
        "raw_response",
        "created_at",
    ]
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
