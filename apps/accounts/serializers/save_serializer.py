"""Валидация сейва, который клиент кладёт на сервер."""
from rest_framework import serializers


class SaveSerializer(serializers.Serializer):
    hearts = serializers.IntegerField(min_value=0)
    total_clicks = serializers.IntegerField(min_value=0)
    total_hearts_collected = serializers.IntegerField(min_value=0)
    purchased_ids = serializers.ListField(child=serializers.CharField(max_length=32), allow_empty=True)
    equipped = serializers.DictField(child=serializers.CharField(max_length=32, allow_blank=True), allow_empty=True)
    epoch = serializers.CharField(max_length=64, required=False, allow_blank=True)
