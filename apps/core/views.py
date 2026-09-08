"""Views для core приложения."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class HealthCheckView(APIView):
    """Эндпоинт проверки работоспособности бэкенда."""
    permission_classes = [AllowAny]

    def get(self, request):
        """Возвращает статус OK."""
        return Response({
            'status': 'ok',
            'service': 'slavicgame-backend'
        })
