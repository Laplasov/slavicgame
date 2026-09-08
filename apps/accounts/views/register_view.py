"""
Регистрация: создаёт пользователя и пустой сейв со свеже-сгенерированным epoch.
Сразу выдаёт токен + epoch, чтобы клиент мог легитимно сохранять прогресс.
"""
import uuid

from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PlayerSave
from apps.accounts.serializers import RegisterSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        nickname = serializer.validated_data['nickname']
        password = serializer.validated_data['password']
        user = User.objects.create_user(username=nickname, password=password)
        # Новая сессия — новый epoch, защита от затирания другим клиентом
        epoch = uuid.uuid4().hex
        PlayerSave.objects.update_or_create(
            user=user,
            defaults={'save_epoch': epoch},
        )
        token = RefreshToken.for_user(user)
        return Response({
            'access': str(token.access_token),
            'refresh': str(token),
            'nickname': nickname,
            'epoch': epoch,
        }, status=201)
