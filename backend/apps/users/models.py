import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom manager for User model where email is the unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("El email es obligatorio."))
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("El superusuario debe tener is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("El superusuario debe tener is_superuser=True."))

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model for CONEIC 2027.
    Uses email as the unique identifier instead of username.
    """

    username = None  # Remove username field

    full_name = models.CharField(
        _("nombre completo"),
        max_length=255,
    )
    email = models.EmailField(
        _("correo electrónico"),
        unique=True,
        error_messages={
            "unique": _("Ya existe un usuario con este correo electrónico."),
        },
    )
    phone = models.CharField(
        _("teléfono"),
        max_length=20,
        blank=True,
        default="",
    )
    university = models.CharField(
        _("universidad"),
        max_length=255,
        blank=True,
        default="",
    )
    career = models.CharField(
        _("carrera"),
        max_length=255,
        blank=True,
        default="",
    )
    country = models.CharField(
        _("país"),
        max_length=100,
        blank=True,
        default="",
    )
    city = models.CharField(
        _("ciudad"),
        max_length=100,
        blank=True,
        default="",
    )
    is_verified = models.BooleanField(
        _("verificado"),
        default=False,
        help_text=_("Indica si el usuario ha verificado su correo electrónico."),
    )
    verification_token = models.UUIDField(
        _("token de verificación"),
        default=uuid.uuid4,
        editable=False,
    )
    is_deleted = models.BooleanField(
        _("eliminado"),
        default=False,
        help_text=_("Soft delete flag."),
    )
    created_at = models.DateTimeField(
        _("fecha de creación"),
        auto_now_add=True,
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        db_table = "users"
        verbose_name = _("usuario")
        verbose_name_plural = _("usuarios")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} <{self.email}>"

    def soft_delete(self):
        """Mark the user as deleted without removing from the database."""
        self.is_deleted = True
        self.is_active = False
        self.save(update_fields=["is_deleted", "is_active"])
