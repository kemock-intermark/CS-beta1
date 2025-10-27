# 🔧 Решение типичных проблем ClubSuite

## Быстрая диагностика

```bash
# Запустите автоматическую проверку
make verify
# или
pnpm verify
```

Инструмент покажет проблемы и как их исправить.

---

## Частые проблемы и решения

### 1. ❌ Неверный BOT_PUBLIC_URL

**Симптомы:**
- Webhook не работает
- Бот не отвечает в продакшене
- Ошибка 403 при установке webhook

**Решение:**
```bash
# 1. Убедитесь, что BOT_PUBLIC_URL доступен из интернета
# 2. Проверьте формат: https://your-domain.com/bot/webhook
# 3. Установите webhook:
make webhook:set

# или вручную в .env:
BOT_PUBLIC_URL=https://your-domain.com/bot/webhook
```

### 2. ❌ Telegram Bot API 403 Forbidden

**Причина:** Webhook URL недоступен или неверный токен.

**Решение:**
```bash
# Проверьте токен
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe

# Удалите старый webhook
make webhook:del

# Установите новый
make webhook:set
```

### 3. ❌ Пустая база данных

**Симптомы:**
- Нет событий/пакетов
- Ошибки при попытке бронирования

**Решение:**
```bash
# Заполнить демо-данными
pnpm db:seed

# Или полный сброс
make db:reset
```

### 4. ❌ PostgreSQL не подключается

**Симптомы:**
- `Connection refused`
- `ECONNREFUSED 127.0.0.1:5432`

**Решение:**
```bash
# Проверьте контейнеры
docker ps | grep postgres

# Если не запущен:
docker-compose up -d postgres

# Проверьте DATABASE_URL в .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clubsuite_dev
```

### 5. ❌ Redis не подключается

**Симптомы:**
- Rate limiting не работает
- `ECONNREFUSED 127.0.0.1:6379`

**Решение:**
```bash
# Проверьте контейнер
docker ps | grep redis

# Если не запущен:
docker-compose up -d redis

# Проверьте REDIS_URL в .env
REDIS_URL=redis://localhost:6379
```

### 6. ❌ TELEGRAM_BOT_USERNAME не совпадает

**Причина:** Токен от другого бота или устаревший username.

**Решение:**
```bash
# Получите актуальное имя бота
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe

# Обновите .env
TELEGRAM_BOT_USERNAME=your_actual_bot_username
```

### 7. ❌ TELEGRAM_PAYMENT_PROVIDER_TOKEN пуст

**Для DEV:** Это нормально! Используется mock-режим.

**Для PROD:**
```bash
# 1. Получите токен у @BotFather
# 2. Добавьте в .env:
TELEGRAM_PAYMENT_PROVIDER_TOKEN=your_provider_token
```

### 8. ❌ JWT_SECRET слишком короткий

**Решение:**
```bash
# Сгенерируйте безопасный ключ
openssl rand -hex 32

# Или используйте
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Обновите .env
JWT_SECRET=<сгенерированный_ключ>
```

### 9. ❌ Миграции не применены

**Симптомы:**
- Таблицы не существуют
- `relation "Venue" does not exist`

**Решение:**
```bash
# Применить миграции
pnpm db:migrate

# Или через Makefile
make setup
```

### 10. ❌ Node.js версия < 18

**Решение:**
```bash
# Установите Node.js >= 18
# Через nvm:
nvm install 18
nvm use 18

# Проверьте версию
node --version
```

### 11. ❌ pnpm не найден

**Решение:**
```bash
# Установите pnpm
npm install -g pnpm

# Проверьте версию
pnpm --version
```

### 12. ❌ Docker не установлен

**Решение:**
- macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Linux: `sudo apt install docker.io docker-compose`
- Windows: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

После установки:
```bash
docker --version
docker-compose --version
```

---

## Интерактивное исправление

Если не знаете, в чём проблема:

```bash
# Запустите интерактивный помощник
make fix
# или
pnpm fix
```

Он проверит:
- ✅ .env файл
- ✅ Docker контейнеры
- ✅ Миграции
- ✅ Webhook
- ✅ Зависимости

И предложит исправить автоматически.

---

## Логи и отладка

### Проверка логов Docker

```bash
# Все логи
docker-compose logs -f

# Только PostgreSQL
docker-compose logs -f postgres

# Только Redis
docker-compose logs -f redis
```

### Health Check Endpoints

```bash
# API health
curl http://localhost:3001/health

# Bot health
curl http://localhost:3002/bot/health

# WebApp health
curl http://localhost:3000/health
```

### Проверка подключения к БД

```bash
# Через psql
docker exec -it clubsuite-postgres psql -U postgres -d clubsuite_dev

# Проверить таблицы
\dt

# Проверить данные
SELECT * FROM "Venue";
```

### Проверка Redis

```bash
# Через redis-cli
docker exec -it clubsuite-redis redis-cli

# Проверить
PING
KEYS *
```

---

## Полный сброс и переустановка

Если ничего не помогает:

```bash
# 1. Остановить всё
docker-compose down -v

# 2. Удалить node_modules
pnpm clean

# 3. Переустановить
pnpm install

# 4. Полная настройка
make setup

# 5. Проверка
make verify
```

---

## Получить помощь

1. Запустите `make verify` и сохраните вывод
2. Проверьте логи: `docker-compose logs`
3. Создайте Issue с описанием проблемы и логами

