"""
Вход по нику и паролю. Генерирует новый epoch для этой сессии,
сбрасывая любой zombie-клиент предыдущей сессии.
"""
import uuid

from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PlayerSave
from apps.accounts.serializers import LoginSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data['nickname'].strip(),
            password=serializer.validated_data['password'],
        )
        if user is None:
            return Response({'error': 'Неверный логин или пароль'}, status=401)
        # Новый вход — новый epoch, любой zombie-клиент с прошлой сессией
        # больше не сможет записать свои данные в этот аккаунт
        epoch = uuid.uuid4().hex
        PlayerSave.objects.update_or_create(
            user=user,
            defaults={'save_epoch': epoch},
        )
        token = RefreshToken.for_user(user)
        return Response({
            'access': str(token.access_token),
            'refresh': str(token),
            'nickname': user.username,
            'epoch': epoch,
        })
