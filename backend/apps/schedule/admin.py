from django.contrib import admin

from .models import ScheduleDay, ScheduleItem


class ScheduleItemInline(admin.StackedInline):
    model = ScheduleItem
    extra = 0
    raw_id_fields = ("workshop", "speaker")
    ordering = ("start_time", "order")


@admin.register(ScheduleDay)
class ScheduleDayAdmin(admin.ModelAdmin):
    list_display = ("date", "title", "item_count")
    search_fields = ("title",)
    inlines = [ScheduleItemInline]

    def item_count(self, obj):
        return obj.items.count()

    item_count.short_description = "Actividades"


@admin.register(ScheduleItem)
class ScheduleItemAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "day",
        "start_time",
        "end_time",
        "item_type",
        "location",
        "is_featured",
    )
    list_filter = ("item_type", "is_featured", "day")
    search_fields = ("title", "description", "location")
    raw_id_fields = ("day", "workshop", "speaker")
    list_editable = ("is_featured",)
