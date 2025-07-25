# Base stage
FROM node:18-alpine AS base
WORKDIR /usr/src/app
RUN apk add --no-cache netcat-openbsd

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build stage
FROM deps AS build
COPY . .
RUN npm run build

# Production stage
FROM base AS production
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./
COPY entrypoint.sh ./

RUN chmod +x /usr/src/app/entrypoint.sh

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001 && \
  chown -R nestjs:nodejs /usr/src/app

USER nestjs

EXPOSE 3000

ENTRYPOINT ["/usr/src/app/entrypoint.sh"] 