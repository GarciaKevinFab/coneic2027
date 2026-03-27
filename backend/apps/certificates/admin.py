from django.contrib import admin

from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = (
        "participant",
        "certificate_type",
        "workshop",
        "hours",
        "validation_code",
        "issued_at",
        "has_pdf",
    )
    list_filter = ("certificate_type", "issued_at")
    search_fields = (
        "participant__user__full_name",
        "participant__user__email",
        "validation_code",
    )
    raw_id_fields = ("participant", "workshop")
    readonly_fields = ("validation_code", "issued_at")

    @admin.display(boolean=True, description="PDF")
    def has_pdf(self, obj):
        return bool(obj.pdf_file)
