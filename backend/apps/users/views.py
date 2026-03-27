import uuid

from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)
from .tasks import send_password_reset_email, send_verification_email

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Register a new user account.
    Sends a verification email asynchronously via Celery.
    """

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send verification email asynchronously
        send_verification_email.delay(user.id)

        return Response(
            {
                "detail": _(
                    "Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta."
                ),
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    """
    Activate a user account by verifying the email token.
    GET /auth/verify-email/<token>/
    """

    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            uuid_token = uuid.UUID(str(token))
        except (ValueError, AttributeError):
            return Response(
                {"detail": _("Token de verificación inválido.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(verification_token=uuid_token)
        except User.DoesNotExist:
            return Response(
                {"detail": _("Token de verificación inválido o expirado.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_verified:
            return Response(
                {"detail": _("Esta cuenta ya fue verificada.")},
                status=status.HTTP_200_OK,
            )

        user.is_verified = True
        user.save(update_fields=["is_verified"])

        return Response(
            {"detail": _("Correo electrónico verificado exitosamente.")},
            status=status.HTTP_200_OK,
        )


class LoginView(TokenObtainPairView):
    """
    Custom login view using SimpleJWT.
    Validates that the user is verified and not soft-deleted
    before issuing tokens.
    """

    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": _("Credenciales inválidas.")},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {"detail": _("Credenciales inválidas.")},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.is_deleted:
            return Response(
                {"detail": _("Esta cuenta ha sido eliminada.")},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"detail": _("Esta cuenta está desactivada.")},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_verified:
            return Response(
                {
                    "detail": _(
                        "Debes verificar tu correo electrónico antes de iniciar sesión."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve the authenticated user's profile.
    PUT/PATCH: Update the authenticated user's profile.
    """

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetView(APIView):
    """
    Request a password reset email.
    Always returns 200 to prevent email enumeration.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email, is_active=True, is_deleted=False)
            # Rotate the verification token for security
            user.verification_token = uuid.uuid4()
            user.save(update_fields=["verification_token"])

            # Send reset email asynchronously
            send_password_reset_email.delay(user.id)
        except User.DoesNotExist:
            pass  # Silently ignore to prevent email enumeration

        return Response(
            {
                "detail": _(
                    "Si el correo existe en nuestro sistema, recibirás un enlace "
                    "para restablecer tu contraseña."
                )
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    Confirm password reset with token and set a new password.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(
                verification_token=token, is_active=True, is_deleted=False
            )
        except User.DoesNotExist:
            return Response(
                {"detail": _("Token inválido o expirado.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        # Rotate token so it cannot be reused
        user.verification_token = uuid.uuid4()
        user.save(update_fields=["password", "verification_token"])

        return Response(
            {"detail": _("Contraseña restablecida exitosamente.")},
            status=status.HTTP_200_OK,
        )


class AccountDeleteView(APIView):
    """
    Soft-delete the authenticated user's account.
    The record remains in the database but is deactivated.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.soft_delete()
        return Response(
            {"detail": _("Tu cuenta ha sido eliminada.")},
            status=status.HTTP_200_OK,
        )
