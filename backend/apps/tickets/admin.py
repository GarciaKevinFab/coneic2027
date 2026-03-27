from django.contrib import admin

from apps.tickets.models import Ticket, TicketType


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "price",
        "capacity",
        "sold_count",
        "available_count_display",
        "includes_workshops",
        "is_active",
        "available_until",
    ]
    list_filter = ["is_active", "includes_workshops"]
    search_fields = ["name"]
    readonly_fields = ["sold_count"]

    @admin.display(description="Disponibles")
    def available_count_display(self, obj):
        return obj.available_count


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = [
        "purchase_code",
        "user",
        "ticket_type",
        "status",
        "payment_method",
        "amount_paid",
        "purchased_at",
    ]
    list_filter = ["status", "payment_method", "ticket_type"]
    search_fields = [
        "purchase_code",
        "user__email",
        "user__first_name",
        "user__last_name",
        "payment_reference",
    ]
    readonly_fields = [
        "purchase_code",
        "purchased_at",
    ]
    raw_id_fields = ["user", "ticket_type"]
    date_hierarchy = "purchased_at"
