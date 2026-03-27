from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = "users"

urlpatterns = [
    # Registration and verification
    path(
        "auth/register/",
        views.RegisterView.as_view(),
        name="register",
    ),
    path(
        "auth/verify-email/<uuid:token>/",
        views.VerifyEmailView.as_view(),
        name="verify-email",
    ),
    # Authentication
    path(
        "auth/login/",
        views.LoginView.as_view(),
        name="login",
    ),
    path(
        "auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),
    # Profile
    path(
        "auth/profile/",
        views.ProfileView.as_view(),
        name="profile",
    ),
    # Password reset
    path(
        "auth/password-reset/",
        views.PasswordResetView.as_view(),
        name="password-reset",
    ),
    path(
        "auth/password-reset/confirm/",
        views.PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    # Account deletion (soft delete)
    path(
        "auth/account/delete/",
        views.AccountDeleteView.as_view(),
        name="account-delete",
    ),
]
