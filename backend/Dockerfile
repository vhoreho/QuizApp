# Используем Node.js 18 как базовый образ
FROM node:18-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем netcat для проверки доступности базы данных
RUN apk add --no-cache netcat-openbsd

# Копируем package.json и package-lock.json
COPY package*.json ./

# Этап установки зависимостей
FROM base AS deps
RUN npm ci

# Этап разработки (с dev зависимостями)
FROM base AS dev-deps
RUN npm ci

# Этап сборки
FROM dev-deps AS build
COPY . .
RUN npm run build

# Финальный этап
FROM base AS production

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001 -G nodejs

# Устанавливаем владельца для рабочей директории
RUN chown -R nestjs:nodejs /app

# Копируем только production зависимости
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Копируем собранное приложение
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Копируем необходимые файлы
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs entrypoint.sh ./

# Делаем entrypoint.sh исполняемым
RUN chmod +x /app/entrypoint.sh

USER nestjs

# Открываем порт
EXPOSE 3000

# Используем entrypoint.sh для запуска
ENTRYPOINT ["/app/entrypoint.sh"] 