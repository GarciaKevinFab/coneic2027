from django.contrib import admin

from .models import Speaker, Workshop, WorkshopEnrollment


@admin.register(Speaker)
class SpeakerAdmin(admin.ModelAdmin):
    list_display = ("name", "topic", "organization", "created_at")
    search_fields = ("name", "topic", "organization")
    list_filter = ("organization",)


class WorkshopEnrollmentInline(admin.TabularInline):
    model = WorkshopEnrollment
    extra = 0
    readonly_fields = ("user", "enrolled_at")
    raw_id_fields = ("user",)


@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "workshop_type",
        "speaker",
        "start_time",
        "end_time",
        "location",
        "capacity",
        "enrolled_count",
        "is_active",
    )
    list_filter = ("workshop_type", "is_active", "start_time")
    search_fields = ("name", "description", "speaker__name")
    raw_id_fields = ("speaker",)
    filter_horizontal = ("required_ticket_types",)
    inlines = [WorkshopEnrollmentInline]
    readonly_fields = ("enrolled_count",)


@admin.register(WorkshopEnrollment)
class WorkshopEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "workshop", "enrolled_at")
    search_fields = ("user__full_name", "user__email", "workshop__name")
    raw_id_fields = ("user", "workshop")
    list_filter = ("workshop",)
