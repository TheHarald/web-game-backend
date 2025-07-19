#!/bin/bash

# Конфигурация
IMAGE_NAME="web-game-backend"
CONTAINER_NAME="web-game-backend"
PORT=3001
TEMP_PORT=3091  # Временный порт для тестирования
TEMP_CONTAINER_NAME="${CONTAINER_NAME}-temp"

# Функция для обработки ошибок
handle_error() {
    echo "Error occurred! Rolling back..."
    docker stop $TEMP_CONTAINER_NAME >/dev/null 2>&1
    docker rm $TEMP_CONTAINER_NAME >/dev/null 2>&1
    exit 1
}

trap 'handle_error' ERR

# 1. Получаем обновления (с обработкой локальных изменений)
echo "Updating source code..."
git pull

# 2. Собираем новый образ
echo "Building new Docker image..."
docker build -t $IMAGE_NAME:latest .

# 3. Запускаем новый контейнер временно на другом порту
echo "Starting new container for testing..."
docker run -d -p $TEMP_PORT:3001 --name $TEMP_CONTAINER_NAME $IMAGE_NAME

# 4. Проверяем здоровье (можно добавить curl проверку API)
echo "Waiting for backend to start..."
sleep 10  # Бэкенду обычно нужно больше времени для старта

# 5. Если проверка прошла, переключаем трафик
echo "Backend is healthy, switching traffic..."

# Останавливаем старый контейнер если существует
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker stop $CONTAINER_NAME >/dev/null
    docker rm $CONTAINER_NAME >/dev/null
fi

# Останавливаем временный контейнер и запускаем на основном порту
docker stop $TEMP_CONTAINER_NAME >/dev/null
docker rm $TEMP_CONTAINER_NAME >/dev/null
docker run -d -p $PORT:3001 --name $CONTAINER_NAME $IMAGE_NAME

# 6. Чистим старые образы
echo "Cleaning up old images..."
docker image prune -a --force --filter "until=24h"

echo "Backend update completed successfully!"