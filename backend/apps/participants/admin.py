from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from .models import Participant, ParticipantType


@admin.register(ParticipantType)
class ParticipantTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "get_display_name", "is_active", "created_at"]
    list_filter = ["is_active", "name"]
    search_fields = ["name", "description"]

    @admin.display(description=_("Nombre visible"))
    def get_display_name(self, obj):
        return obj.get_name_display()


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = [
        "get_user_name",
        "get_user_email",
        "participant_type",
        "payment_status",
        "is_accredited",
        "accredited_at",
        "created_at",
    ]
    list_filter = [
        "participant_type",
        "payment_status",
        "is_accredited",
    ]
    search_fields = [
        "user__full_name",
        "user__email",
        "qr_token",
    ]
    readonly_fields = [
        "qr_token",
        "qr_code_preview",
        "accredited_at",
        "accredited_by",
        "created_at",
        "updated_at",
    ]
    raw_id_fields = ["user", "accredited_by", "ticket"]
    filter_horizontal = ["selected_workshops"]
    list_select_related = ["user", "participant_type"]

    @admin.display(description=_("Nombre"))
    def get_user_name(self, obj):
        return obj.user.full_name

    @admin.display(description=_("Email"))
    def get_user_email(self, obj):
        return obj.user.email

    @admin.display(description=_("QR Code"))
    def qr_code_preview(self, obj):
        if obj.qr_code:
            return format_html(
                '<img src="{}" width="150" height="150" />',
                obj.qr_code.url,
            )
        return _("Sin codigo QR")

    fieldsets = (
        (
            _("Informacion del participante"),
            {
                "fields": (
                    "user",
                    "participant_type",
                    "ticket",
                    "selected_workshops",
                ),
            },
        ),
        (
            _("Pago"),
            {
                "fields": ("payment_status",),
            },
        ),
        (
            _("Acreditacion"),
            {
                "fields": (
                    "is_accredited",
                    "accredited_at",
                    "accredited_by",
                    "qr_token",
                    "qr_code",
                    "qr_code_preview",
                ),
            },
        ),
        (
            _("Fechas"),
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )
