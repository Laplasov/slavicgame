"""Сохранение игрока: прогресс и статистика, привязанные к аккаунту."""
from django.conf import settings
from django.db import models


class PlayerSave(models.Model):
    """Серверный сейв игрока: сердца, покупки, экипировка, статистика."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='player_save',
        verbose_name='Игрок',
    )
    hearts = models.BigIntegerField(default=0, verbose_name='Текущие сердца')
    total_clicks = models.BigIntegerField(default=0, verbose_name='Всего кликов')
    total_hearts_collected = models.BigIntegerField(default=0, verbose_name='Всего собрано сердец')
    purchased_ids = models.JSONField(default=list, verbose_name='Купленные предметы')
    equipped = models.JSONField(default=dict, verbose_name='Надетые предметы по слотам')
    save_epoch = models.CharField(
        max_length=64, default='', blank=True,
        verbose_name='Эпоха сейва (UUID текущей сессии)',
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    class Meta:
        verbose_name = 'Сохранение игрока'
        verbose_name_plural = 'Сохранения игроков'

    def __str__(self):
        return f'{self.user.username}: {self.hearts}'
