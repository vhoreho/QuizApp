# Quiz App

Приложение для создания и прохождения тестов с различными типами вопросов.

## Структура проекта

- `frontend/` - React приложение
- `backend/` - NestJS API
- `docker-compose.yml` - Основной файл Docker Compose для разработки
- `docker-compose.server.yml` - Файл Docker Compose для production

## Запуск проекта

### Разработка

```bash
docker-compose up
```

### Production

```bash
docker-compose -f docker-compose.server.yml up
```

## Переменные окружения

### Backend

- `DB_HOST` - хост базы данных (по умолчанию: db)
- `DB_PORT` - порт базы данных (по умолчанию: 5432)
- `DB_USER` - пользователь базы данных (по умолчанию: quizuser)
- `DB_PASSWORD` - пароль базы данных (по умолчанию: quizpassword)
- `DB_NAME` - название базы данных (по умолчанию: quizdb)
- `JWT_SECRET` - секретный ключ для JWT
- `RUN_SEED` - запускать ли сид при старте (по умолчанию: true)

### Frontend

- `VITE_API_URL` - URL API (по умолчанию: http://localhost:3000) 