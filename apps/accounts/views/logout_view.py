"""Выход: серверная часть формальная, токен удаляет клиент."""
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        return Response({'detail': 'ok'})
