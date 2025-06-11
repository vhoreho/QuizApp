# Используем Node.js 18 как базовый образ
FROM node:18-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

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
# Копируем только production зависимости
COPY --from=deps /app/node_modules ./node_modules
# Копируем собранное приложение
COPY --from=build /app/dist ./dist
# Копируем необходимые файлы
COPY package*.json ./

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Открываем порт
EXPOSE 3000

# Команда запуска
CMD ["node", "dist/src/main"] 