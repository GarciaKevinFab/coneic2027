from django.contrib import admin

from .models import EventInfo, OrganizingCommittee, Sponsor


@admin.register(EventInfo)
class EventInfoAdmin(admin.ModelAdmin):
    list_display = ("name", "edition", "host_university", "city", "start_date", "end_date")
    fieldsets = (
        ("General", {
            "fields": ("name", "description", "edition"),
        }),
        ("Ubicacion", {
            "fields": ("host_university", "city", "country", "venue"),
        }),
        ("Fechas", {
            "fields": ("start_date", "end_date"),
        }),
        ("Institucional", {
            "fields": ("mission", "vision", "history"),
        }),
    )

    def has_add_permission(self, request):
        # Only allow one instance
        if EventInfo.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ("name", "tier", "website", "order")
    list_filter = ("tier",)
    search_fields = ("name",)
    list_editable = ("tier", "order")


@admin.register(OrganizingCommittee)
class OrganizingCommitteeAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "university", "order")
    search_fields = ("name", "role", "university")
    list_editable = ("order",)
