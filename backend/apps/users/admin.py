from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for the custom User model."""

    list_display = [
        "email",
        "full_name",
        "university",
        "is_verified",
        "is_active",
        "is_staff",
        "is_deleted",
        "created_at",
    ]
    list_filter = [
        "is_verified",
        "is_active",
        "is_staff",
        "is_superuser",
        "is_deleted",
        "country",
    ]
    search_fields = [
        "email",
        "full_name",
        "university",
        "phone",
    ]
    ordering = ["-created_at"]

    # Fieldsets for the detail/edit view
    fieldsets = (
        (
            None,
            {
                "fields": ("email", "password"),
            },
        ),
        (
            _("Información personal"),
            {
                "fields": (
                    "full_name",
                    "phone",
                    "university",
                    "career",
                    "country",
                    "city",
                ),
            },
        ),
        (
            _("Permisos"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_verified",
                    "is_deleted",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            _("Fechas importantes"),
            {
                "fields": ("last_login",),
            },
        ),
    )

    # Fieldsets for the creation form
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "full_name",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )

    readonly_fields = ["created_at"]
