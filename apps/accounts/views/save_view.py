"""
Чтение и обновление сейва текущего игрока.
При PUT сервер сверяет epoch, присланный клиентом, с сохранённым в БД.
Если epoch не совпадает — клиент шлёт мусор (zombie-сессия) и сервер
отклоняет запрос со статусом 409 Conflict. Клиент обязан сделать reload.
"""
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import PlayerSave
from apps.accounts.serializers import SaveSerializer


class SaveView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_save(self):
        save, _ = PlayerSave.objects.get_or_create(user=self.request.user)
        return save

    @staticmethod
    def _to_payload(save):
        return {
            'hearts': save.hearts,
            'total_clicks': save.total_clicks,
            'total_hearts_collected': save.total_hearts_collected,
            'purchased_ids': save.purchased_ids or [],
            'equipped': save.equipped or {},
            'epoch': save.save_epoch or '',
        }

    def get(self, request):
        return Response(self._to_payload(self._get_save()))

    def put(self, request):
        serializer = SaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        save = self._get_save()
        data = serializer.validated_data

        # Проверка epoch: защита от zombie-запросов старых сессий
        incoming_epoch = data.get('epoch', '') or ''
        saved_epoch = save.save_epoch or ''
        if saved_epoch and incoming_epoch and incoming_epoch != saved_epoch:
            return Response(
                {'detail': 'Session expired, reload required'},
                status=409,
            )

        save.hearts = data['hearts']
        save.total_clicks = data['total_clicks']
        save.total_hearts_collected = data['total_hearts_collected']
        save.purchased_ids = data['purchased_ids']
        save.equipped = data['equipped']
        if incoming_epoch:
            save.save_epoch = incoming_epoch
        save.save()
        return Response(self._to_payload(save))
