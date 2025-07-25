#!/bin/sh

# Ждем, пока база данных будет готова
echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done

echo "Database is ready!"

# Запускаем сид только если установлена переменная RUN_SEED
if [ "$RUN_SEED" = "true" ]; then
  echo "=== Starting seed process ==="
  if node dist/src/seed.js; then
    echo "=== Seed completed successfully ==="
  else
    echo "=== Error during seed process ==="
    exit 1
  fi
else
  echo "Skipping seed (RUN_SEED is not set to true)..."
fi

# Запускаем приложение
echo "Starting application..."
exec node dist/src/main 