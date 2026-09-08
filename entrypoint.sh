#!/bin/bash
set -e

echo "Применение миграций..."
python manage.py makemigrations accounts --noinput || true
python manage.py migrate --noinput

echo "Запуск Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120
