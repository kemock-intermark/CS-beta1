# Setup Guide для ClubSuite

## Шаг 1: Клонирование и установка зависимостей

```bash
# Установить pnpm (если еще не установлен)
npm install -g pnpm

# Клонировать репозиторий
git clone <your-repo-url>
cd CS-beta1

# Установить зависимости
pnpm install
```

## Шаг 2: Настройка переменных окружения

```bash
# Скопировать пример конфигурации
cp .env.example .env

# Отредактировать .env
nano .env  # или ваш любимый редактор
```

### Обязательные переменные:

- `TELEGRAM_BOT_TOKEN` - получить у [@BotFather](https://t.me/BotFather)
- `JWT_SECRET` - секретный ключ для JWT (минимум 32 символа)
- `DATABASE_URL` - URL для подключения к PostgreSQL
- `REDIS_URL` - URL для подключения к Redis

### Опциональные переменные:

- `TELEGRAM_PAYMENT_PROVIDER_TOKEN` - для платежей (можно оставить mock)
- `BOT_PUBLIC_URL` - публичный URL для webhook (для продакшена)

## Шаг 3: Запуск инфраструктуры (Docker)

```bash
# Запустить PostgreSQL и Redis
pnpm docker:up

# Проверить статус
docker-compose ps
```

## Шаг 4: Настройка базы данных

```bash
# Сгенерировать Prisma Client
pnpm db:generate

# Применить миграции
pnpm db:migrate

# (Опционально) Открыть Prisma Studio
pnpm db:studio
```

## Шаг 5: Настройка Telegram Bot

### Создание бота:

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный токен в `.env` файл

### Настройка команд:

```bash
# TODO: Добавить инструкции для настройки команд через BotFather
```

## Шаг 6: Запуск приложений

```bash
# Запустить все приложения
pnpm dev

# Или запустить по отдельности:

# Telegram Bot
pnpm dev:bot

# WebApp
pnpm dev:webapp

# API
pnpm dev:api
```

## Шаг 7: Проверка работы

1. **API**: Откройте http://localhost:3001
2. **API Docs**: Откройте http://localhost:3001/api/docs
3. **WebApp**: Откройте http://localhost:3000
4. **Bot**: Напишите боту в Telegram

## Устранение проблем

### Ошибка подключения к БД

```bash
# Проверить, что PostgreSQL запущен
docker-compose ps

# Проверить логи
docker-compose logs postgres

# Пересоздать контейнеры
pnpm docker:down
pnpm docker:up
```

### Ошибка Prisma

```bash
# Сгенерировать Prisma Client заново
pnpm db:generate
```

### Проблемы с портами

Если порты заняты, измените их в `.env`:

```env
API_PORT=3002
```

И в `docker-compose.yml` для PostgreSQL и Redis.

## Следующие шаги

1. Прочитайте [README.md](./README.md) для получения дополнительной информации
2. Изучите структуру проекта
3. Начните разработку!

## Поддержка

Для вопросов создайте Issue в репозитории.
