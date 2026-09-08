"""Маршруты аккаунтов: регистрация, вход, выход, сейв, рейтинг."""
from django.urls import path

from apps.accounts.views import (
    LeaderboardView,
    LoginView,
    LogoutView,
    RegisterView,
    SaveView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('save/', SaveView.as_view()),
    path('leaderboard/', LeaderboardView.as_view()),
]
