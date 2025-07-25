#!/bin/bash

# Проверяем, запущен ли PostgreSQL контейнер
if ! docker ps | grep -q quiz-app-db; then
    echo "Starting PostgreSQL container..."
    docker-compose up -d db
    
    # Ждем, пока база данных будет готова
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Устанавливаем зависимости, если node_modules не существует
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Запускаем приложения в режиме разработки
echo "Starting development servers..."
npx concurrently \
    "cd backend && npm run start:dev" \
    "cd frontend && npm run dev" 