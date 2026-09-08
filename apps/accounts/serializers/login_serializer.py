"""Валидация данных входа: ник и пароль."""
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    nickname = serializers.CharField(max_length=20)
    password = serializers.CharField(max_length=128, write_only=True)
