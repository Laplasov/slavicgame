"""Топ-50 игроков по текущим сердечкам: место - ник - сердца."""
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import PlayerSave


class LeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rows = PlayerSave.objects.select_related('user').order_by('-total_hearts_collected', 'id')[:50]
        result = [
            {'place': index + 1, 'nickname': row.user.username, 'hearts': row.total_hearts_collected}
            for index, row in enumerate(rows)
        ]
        return Response({'rows': result})
