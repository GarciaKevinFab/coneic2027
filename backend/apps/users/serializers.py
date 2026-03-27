from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "email",
            "full_name",
            "password",
            "password_confirm",
            "phone",
            "university",
            "career",
            "country",
            "city",
        ]

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                _("Ya existe un usuario con este correo electrónico.")
            )
        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": _("Las contraseñas no coinciden.")}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True
        user.is_verified = False
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login (used with SimpleJWT)."""

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate_email(self, value):
        return value.lower().strip()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing and updating user profile."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "university",
            "career",
            "country",
            "city",
            "is_verified",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "email",
            "is_verified",
            "created_at",
        ]


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for requesting a password reset email."""

    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset with token."""

    token = serializers.UUIDField()
    new_password = serializers.CharField(
        min_length=8,
        validators=[validate_password],
        write_only=True,
        style={"input_type": "password"},
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": _("Las contraseñas no coinciden.")}
            )
        return attrs
