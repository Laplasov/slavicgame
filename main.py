"""
Общий запускатель проекта.
Используется для ручного запуска без Docker (для разработки).
"""
import os
import sys
import subprocess


def main():
    """Запускает Django development server."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    print("=" * 60)
    print("Slavic Game - Development Server")
    print("=" * 60)
    
    # Запуск миграций
    print("\n[1/2] Применение миграций...")
    subprocess.run([sys.executable, "manage.py", "migrate", "--run-syncdb"])
    
    # Запуск сервера
    print("\n[2/2] Запуск сервера на http://127.0.0.1:8000")
    subprocess.run([sys.executable, "manage.py", "runserver", "0.0.0.0:8000"])


if __name__ == '__main__':
    main()
