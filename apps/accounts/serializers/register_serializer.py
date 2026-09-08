"""Валидация данных регистрации: ник, пароль, подтверждение пароля."""
from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    nickname = serializers.CharField(min_length=3, max_length=20)
    password = serializers.CharField(min_length=4, max_length=128, write_only=True)
    password2 = serializers.CharField(min_length=4, max_length=128, write_only=True)

    def validate_nickname(self, value):
        nickname = value.strip()
        if not nickname:
            raise serializers.ValidationError('Ник не может быть пустым')
        if User.objects.filter(username__iexact=nickname).exists():
            raise serializers.ValidationError('Такой ник уже занят')
        return nickname

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': 'Пароли не совпадают'})
        return attrs
