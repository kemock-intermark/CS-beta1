# 🔍 QA Kit Documentation - ClubSuite

## Обзор

QA Kit - это набор инструментов для автоматической валидации, диагностики и исправления проблем в ClubSuite.

## Структура

```
tools/
├── verify.mjs        # Основной сценарий проверок
├── fix.mjs           # Интерактивное исправление
├── tg-utils.mjs      # Утилиты для Telegram Bot API
├── http.js           # HTTP helper с таймаутом и ретраями
└── package.json      # Зависимости для QA инструментов
```

## Основные команды

### 1. `make setup` - Полная установка

Выполняет все необходимые шаги для запуска проекта:

```bash
make setup
```

**Что делает:**
1. Запускает Docker контейнеры (PostgreSQL, Redis)
2. Ждёт готовности сервисов
3. Устанавливает зависимости через pnpm
4. Генерирует Prisma Client
5. Применяет миграции БД
6. Заполняет базу demo-данными

**Использование:**
- Первый запуск проекта
- После git clone
- После `make db:reset`

---

### 2. `make verify` - Полная проверка

Запускает комплексную проверку всей системы:

```bash
make verify
```

**Что проверяется:**

#### Node.js & Package Manager
- ✅ Node.js >= 18.18
- ✅ pnpm >= 8

#### Docker & Containers
- ✅ Docker установлен
- ✅ PostgreSQL контейнер запущен
- ✅ Redis контейнер запущен

#### Environment Variables
- ✅ Все обязательные переменные из .env.example
- ✅ JWT_SECRET >= 24 символов
- ✅ TELEGRAM_BOT_TOKEN валидный формат
- ✅ DATABASE_URL парсится
- ✅ REDIS_URL доступен

#### PostgreSQL Database
- ✅ TCP подключение
- ✅ SELECT 1 работает
- ✅ Таблицы существуют
- ✅ Seed данные присутствуют (Venue, Hall, Event, Package)

#### Redis Cache
- ✅ PING команда работает

#### Backend API
- ✅ GET /health возвращает 200
- ✅ DB = true
- ✅ Redis = true
- ✅ Version определена

#### Telegram Bot
- ✅ getMe API call успешен
- ✅ Username совпадает с TELEGRAM_BOT_USERNAME
- ✅ Webhook установлен (или long polling для dev)
- ✅ Webhook URL совпадает с BOT_PUBLIC_URL

#### Telegram WebApp
- ✅ GET /health возвращает 200
- ✅ Security headers (в prod)

#### Smoke E2E Test
- ✅ Auth: POST /auth/tg/webapp/validate (mock initData)
- ✅ Catalog: GET /catalog/events
- ✅ Catalog: GET /catalog/packages

**Вывод:**

```
🔍 ClubSuite Verification Tool

============================================================
  Node.js & Package Manager
============================================================

✅ Node.js v18.18.0 (>= 18.18)
✅ pnpm 8.10.0 (>= 8)

============================================================
  Docker & Containers
============================================================

✅ Docker is installed
✅ PostgreSQL container is running
✅ Redis container is running

... и т.д.

============================================================
  Summary
============================================================

✅ Passed: 25
⚠️  Warnings: 2
❌ Failed: 0

⚠️  Some warnings detected. Review recommendations above.
```

**Опции:**

```bash
# В CI режиме (без интерактивных проверок)
node tools/verify.mjs --ci

# Пропустить проверки Telegram (для локальной разработки)
node tools/verify.mjs --no-telegram
```

---

### 3. `make fix` - Интерактивное исправление

Запускает интерактивный помощник для исправления частых проблем:

```bash
make fix
```

**Что исправляется:**

#### 1. Environment Configuration
- Генерирует .env из .env.example
- Создаёт безопасный JWT_SECRET (64 символа)
- Устанавливает разумные значения по умолчанию
- Запрашивает TELEGRAM_BOT_TOKEN
- Запрашивает BOT_PUBLIC_URL

**Пример:**
```
==========================================================
  Environment Configuration
==========================================================

⚠️  .env already exists. Overwrite? (y/N): n
✅ Keeping existing .env
```

#### 2. Docker Containers
- Запускает docker-compose up -d
- Ждёт готовности PostgreSQL (порт 5432)
- Ждёт готовности Redis (порт 6379)

**Пример:**
```
==========================================================
  Docker Containers
==========================================================

Start PostgreSQL and Redis containers? (Y/n): y
🐳 Starting Docker containers...
✅ Containers started
⏳ Waiting for PostgreSQL to be ready...
✅ PostgreSQL is ready
⏳ Waiting for Redis to be ready...
✅ Redis is ready
```

#### 3. Database Setup
- Генерирует Prisma Client
- Применяет миграции
- Заполняет seed данными

**Пример:**
```
==========================================================
  Database Setup
==========================================================

Apply migrations and seed data? (Y/n): y
📦 Generating Prisma Client...
✅ Prisma Client generated
🔄 Running migrations...
✅ Migrations applied
🌱 Seeding database...
✅ Database seeded
```

#### 4. Telegram Webhook
- Устанавливает webhook через Telegram Bot API
- Использует BOT_PUBLIC_URL из .env
- Подтверждает успешную установку

**Пример:**
```
==========================================================
  Telegram Webhook
==========================================================

Setup Telegram webhook? (Y/n): y
Enter webhook URL [https://example.com/bot/webhook]: 
🔧 Setting webhook...
✅ Webhook set to: https://example.com/bot/webhook
```

---

### 4. Дополнительные команды

#### Webhook Management

```bash
# Установить webhook
make webhook:set

# Удалить webhook (для dev с long polling)
make webhook:del
```

#### Database Management

```bash
# Сбросить БД (УДАЛИТ ВСЕ ДАННЫЕ!)
make db:reset

# Применить миграции
make db:migrate

# Заполнить seed
make seed

# Открыть Prisma Studio
make db:studio
```

#### Development

```bash
# Запустить все сервисы
make dev

# Запустить API только
make dev-api

# Запустить WebApp только
make dev-webapp

# Запустить Bot только
make dev-bot
```

#### Testing

```bash
# Все тесты
make test

# С покрытием
make test-cov

# Lint
make lint

# Format
make format

# Type check
make typecheck
```

---

## Health Endpoints

### API Health Check

**URL:** `http://localhost:3001/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-27T10:00:00.000Z",
  "version": "0.1.0",
  "db": true,
  "redis": true
}
```

### Bot Health Check

**URL:** `http://localhost:3002/bot/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-27T10:00:00.000Z",
  "username": "your_bot_username",
  "webhook": true,
  "webhookUrl": "https://example.com/bot/webhook"
}
```

### WebApp Health Check

**URL:** `http://localhost:3000/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-27T10:00:00.000Z",
  "version": "0.1.0"
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

Файл: `.github/workflows/verify.yml`

**Триггеры:**
- Push в main/develop
- Pull Request в main/develop
- Schedule (daily at midnight)

**Jobs:**
1. **verify** - Полная проверка
   - Matrix: Node 18, 20
   - Services: PostgreSQL, Redis
   - Steps:
     - Install dependencies
     - Generate Prisma Client
     - Run migrations
     - Seed database
     - Run smoke E2E tests
     - Run verification script
     - Upload report artifact

**Переменные окружения в CI:**
```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/clubsuite_test
REDIS_URL: redis://localhost:6379
JWT_SECRET: test-secret-key-for-ci-verification
NODE_ENV: test
```

**Артефакты:**
- `verify-report.txt` - Полный отчёт проверки (30 дней)

---

## Smoke E2E Test

Файл: `apps/api/test/e2e.smoke.spec.ts`

**Что тестируется:**

1. **Health Check**
   - GET /health → status: ok, db: true

2. **Authentication Flow**
   - POST /auth/tg/webapp/validate (mock initData)
   - Получение JWT токена

3. **Catalog**
   - GET /catalog/events
   - GET /catalog/packages

4. **Reservation Flow**
   - POST /reservations (если есть events)

5. **Ticket Flow**
   - POST /tickets (покупка билета)
   - Проверка qrCodeImage

6. **Promoter Flow**
   - POST /promoters/leads (если user промоутер)
   - GET /promoters/me/kpi

7. **Reports**
   - GET /reports/overview

**Запуск:**
```bash
pnpm test:smoke
# или
pnpm --filter @clubsuite/api run test:smoke
```

---

## Utilities

### TelegramUtils (tg-utils.mjs)

```javascript
import { TelegramUtils } from './tools/tg-utils.mjs';

const tg = new TelegramUtils(process.env.TELEGRAM_BOT_TOKEN);

// Get bot info
const me = await tg.getMe();

// Get webhook info
const webhook = await tg.getWebhookInfo();

// Set webhook
const result = await tg.setWebhook('https://example.com/webhook');

// Delete webhook
const deleted = await tg.deleteWebhook();

// Send message
await tg.sendMessage(chatId, 'Hello!');

// Generate mock initData for testing
const initData = tg.generateMockInitData(123456, 'Test', 'testuser');

// Validate bot token format
const valid = validateBotToken(token);
```

### HTTP Helpers (http.js)

```javascript
import { fetchWithTimeout, isPortOpen, waitForPort } from './tools/http.js';

// Fetch with timeout and retries
const response = await fetchWithTimeout(
  'http://api.example.com',
  { method: 'GET' },
  5000,  // timeout ms
  2      // retries
);

// Check if port is open
const open = await isPortOpen('localhost', 5432);

// Wait for port to be available
const ready = await waitForPort('localhost', 5432, 30, 1000);
```

---

## Best Practices

### При разработке

1. **Перед началом работы:**
   ```bash
   make verify
   ```

2. **После git pull:**
   ```bash
   pnpm install
   make verify
   ```

3. **При проблемах:**
   ```bash
   make fix
   ```

### Перед коммитом

```bash
make lint
make test
make verify
```

### В CI/CD

Workflow автоматически запустит проверки при:
- Push в main/develop
- Pull Request
- Ежедневно (schedule)

---

## Расширение QA Kit

### Добавление новой проверки в verify.mjs

```javascript
async function checkMyFeature(env) {
  section('My Feature');
  
  try {
    // Ваша проверка
    const result = await doSomething();
    
    if (result.ok) {
      logSuccess('My feature works!');
    } else {
      logWarning('My feature has warnings');
      console.log('   💡 Fix: Run something\n');
    }
  } catch (error) {
    logError(
      `My feature failed: ${error.message}`,
      'How to fix it'
    );
  }
}

// Добавить в main()
await checkMyFeature(env);
```

### Добавление нового фикса в fix.mjs

```javascript
async function fixMyFeature() {
  section('My Feature Fix');
  
  const answer = await question('Fix my feature? (Y/n): ');
  if (answer.toLowerCase() === 'n') {
    log('⏭️  Skipping', '\x1b[33m');
    return;
  }
  
  try {
    // Логика исправления
    log('🔧 Fixing...', '\x1b[36m');
    // ...
    log('✅ Fixed!', '\x1b[32m');
  } catch (error) {
    log(`❌ Failed: ${error.message}`, '\x1b[31m');
  }
}

// Добавить в main()
await fixMyFeature();
```

---

## Troubleshooting

См. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) для детального руководства по решению проблем.

