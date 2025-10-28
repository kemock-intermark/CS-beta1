# ClubSuite MVP

🎉 **Премиальная платформа управления ночными клубами в Telegram**

Полный цикл работы с гостями: от приглашения промоутера до входа по QR-коду.

## 🌟 Что Реализовано (MVP Ready!)

✅ **Премиальный дизайн** - темная тема с неоновыми градиентами  
✅ **Каталог событий** - список и детали с VIP пакетами  
✅ **Система бронирования** - столы и билеты  
✅ **QR-билеты** - автогенерация и отображение  
✅ **Промоутерская панель** - deep links, KPI, broadcast  
✅ **Door check-in** - сканирование QR с offline режимом  
✅ **Waitlist** - запись в лист ожидания  
✅ **Админка** - управление событиями, пакетами, пользователями  
✅ **Telegram Payments** - интеграция платежей  

## 📚 Документация

- **[QUICK_START.md](QUICK_START.md)** - Быстрая шпаргалка на 1 странице
- **[INSTRUCTIONS.md](INSTRUCTIONS.md)** - Полные инструкции для всех ролей
- **[SPECIFICATION.md](SPECIFICATION.md)** - Бизнес-требования
- **[TECHNICAL_SPEC.md](TECHNICAL_SPEC.md)** - Техническая спецификация
- **[USER_GUIDE.md](USER_GUIDE.md)** - Руководство пользователя

## 🚀 Развернутое Приложение

### Рабочие Ссылки:
- **WebApp**: https://clubsuite-webapp.onrender.com
- **API**: https://clubsuite-api.onrender.com
- **API Docs**: https://clubsuite-api.onrender.com/api
- **Telegram Bot**: @ClubSuiteBot (настройте свой)

### Быстрый Доступ:
- **События**: https://clubsuite-webapp.onrender.com/events
- **Админка**: https://clubsuite-webapp.onrender.com/admin (admin/Q123456)
- **Door Check-in**: https://clubsuite-webapp.onrender.com/door
- **Промоутер**: https://clubsuite-webapp.onrender.com/promoter

---

Монорепозиторий для платформы управления клубами на базе Telegram.

## 🏗️ Архитектура

ClubSuite состоит из следующих компонентов:

- **Telegram Bot** (`apps/bot`) - бот на grammY с поддержкой webhook и платежей
- **WebApp** (`apps/webapp`) - Telegram Mini App на Next.js 14 (App Router)
- **Backend API** (`apps/api`) - NestJS API с Fastify, Prisma ORM и PostgreSQL
- **Shared Packages**:
  - `packages/config` - общие конфигурации
  - `packages/ui` - переиспользуемые UI компоненты
  - `packages/shared` - общие типы и утилиты

## 🚀 Быстрый старт

### Предварительные требования

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker и Docker Compose
- Make (опционально, для удобства)

### Автоматическая установка (рекомендуется)

```bash
# Всё в одной команде - установка и проверка
make setup
make verify
```

Команда `make setup` автоматически:
- ✅ Запустит Docker контейнеры (PostgreSQL, Redis)
- ✅ Установит зависимости
- ✅ Применит миграции базы данных
- ✅ Заполнит базу демо-данными
- ✅ Настроит окружение

### Ручная установка

```bash
# Установить зависимости
pnpm install

# Создать .env файл из примера
cp .env.example .env

# Запустить PostgreSQL и Redis
pnpm docker:up

# Применить миграции базы данных
pnpm db:migrate

# Заполнить базу демо-данными
pnpm db:seed

# Сгенерировать Prisma Client
pnpm --filter @clubsuite/api run db:generate
```

### Проверка установки

```bash
# Запустить полную проверку системы
pnpm verify
# или
make verify
```

### Исправление проблем

```bash
# Интерактивный помощник для исправления частых проблем
pnpm fix
# или
make fix
```

### Конфигурация

Отредактируйте `.env` файл и укажите:

- `TELEGRAM_BOT_TOKEN` - токен вашего Telegram бота (получите у [@BotFather](https://t.me/BotFather))
- `JWT_SECRET` - секретный ключ для JWT
- `TELEGRAM_PAYMENT_PROVIDER_TOKEN` - токен платежей (для тестирования можно оставить mock)

### Запуск в режиме разработки

```bash
# Запустить все приложения
pnpm dev

# Или по отдельности:
pnpm dev:bot    # Telegram Bot (long polling)
pnpm dev:webapp # WebApp на http://localhost:3000
pnpm dev:api    # API на http://localhost:3001
```

### Сборка для продакшена

```bash
pnpm build
```

## 📁 Структура проекта

```
ClubSuite/
├── apps/
│   ├── bot/          # Telegram Bot (grammY)
│   ├── webapp/       # Telegram WebApp (Next.js)
│   └── api/          # Backend API (NestJS)
├── packages/
│   ├── config/       # Общие конфигурации
│   ├── ui/           # UI компоненты
│   └── shared/       # Общие типы и утилиты
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## 🔧 Команды

### Корневые команды

- `pnpm dev` - запустить все приложения в режиме разработки
- `pnpm build` - собрать все приложения
- `pnpm lint` - проверить код линтером
- `pnpm format` - отформатировать код с Prettier
- `pnpm test` - запустить все тесты
- `pnpm docker:up` - запустить Docker контейнеры
- `pnpm docker:down` - остановить Docker контейнеры

### Команды для конкретного приложения

- `pnpm --filter @clubsuite/bot run dev`
- `pnpm --filter @clubsuite/webapp run dev`
- `pnpm --filter @clubsuite/api run dev`

### База данных

- `pnpm db:migrate` - применить миграции
- `pnpm db:seed` - заполнить базу демо-данными
- `pnpm db:studio` - открыть Prisma Studio
- `pnpm db:generate` - сгенерировать Prisma Client

### Тестирование

- `pnpm test` - запустить все тесты
- `pnpm test:cov` - тесты с покрытием
- `pnpm test:e2e` - E2E тесты
- `pnpm test:smoke` - smoke тесты (быстрая проверка)

### QA и Отладка

- `make verify` - полная проверка системы (окружение, DB, API, Bot)
- `make fix` - интерактивный помощник для исправления
- `make webhook:set` - установить Telegram webhook
- `make webhook:del` - удалить Telegram webhook
- `make db:reset` - сбросить БД (drop + migrate + seed)

## 🛠️ Технологии

- **Language:** TypeScript
- **Package Manager:** pnpm
- **Bot Framework:** grammY
- **Frontend:** Next.js 14 (App Router), React 18
- **Backend:** NestJS, Fastify
- **Database:** PostgreSQL (Prisma ORM)
- **Cache:** Redis
- **Authentication:** JWT, Telegram initData validation (HMAC-SHA256)
- **Payments:** Telegram Bot Payments
- **Security:** Rate limiting, PII masking, Role-based access
- **Testing:** Jest, Supertest (70%+ coverage)
- **CI/CD:** GitHub Actions (lint, typecheck, test, build)
- **Code Quality:** ESLint, Prettier, Husky
- **Documentation:** Swagger (OpenAPI)

## 🔐 Аутентификация

WebApp использует серверную валидацию Telegram `initData`:

1. Клиент отправляет `initData` в `/auth/telegram` endpoint
2. Сервер валидирует `initData` используя HMAC-SHA256 с секретным ключом
3. При успешной валидации выдается JWT токен
4. JWT токен используется для авторизованных запросов к API

## 💳 Платежи

В DEV режиме используются mock платежи. Для продакшена:

1. Получите `TELEGRAM_PAYMENT_PROVIDER_TOKEN` от [@BotFather](https://t.me/BotFather)
2. Настройте провайдера платежей в настройках бота
3. Обновите `.env` файл

## 📚 API Документация

После запуска API, документация доступна по адресу:
- Development: http://localhost:3001/api/docs
- Swagger UI: http://localhost:3001/api/docs

### Swagger Features
- ✅ Полная документация всех эндпоинтов
- ✅ Примеры запросов/ответов
- ✅ Авторизация через JWT
- ✅ Try it out для тестирования

## 🐳 Docker

```bash
# Запустить контейнеры
pnpm docker:up

# Остановить контейнеры
pnpm docker:down

# Просмотреть логи
docker-compose logs -f
```

## 🧪 Тестирование

```bash
# Запустить все тесты
pnpm test

# Тесты с покрытием
pnpm --filter @clubsuite/api run test:cov

# E2E тесты
pnpm --filter @clubsuite/api run test:e2e
```

## 📝 Git Hooks

Проект настроен с Husky для автоматической проверки кода:

- **pre-commit:** ESLint и Prettier
- **commit-msg:** Проверка Conventional Commits

## 🔄 Workflow

1. `git checkout -b feature/your-feature`
2. Разработка
3. `git commit -m "feat: add new feature"`
4. `git push`
5. Создать Pull Request

## 🔒 Безопасность

- ✅ **Telegram InitData Validation** - HMAC-SHA256 валидация
- ✅ **JWT Authentication** - токены с ролями
- ✅ **Rate Limiting** - 60 req/min через Redis
- ✅ **PII Masking** - маскирование данных в логах
- ✅ **Role-based Access** - контроль доступа по ролям
- ✅ **Input Validation** - Zod + class-validator

## 🧪 Тестирование

Тесты покрывают:
- ✅ Auth flow (Telegram validation, JWT)
- ✅ Полный цикл: бронь → оплата → check-in
- ✅ Waitlist flow
- ✅ Promoter flow (создание заявок, KPI)
- ✅ QR code generation и валидация

**Покрытие:** ≥70%

## 🚀 CI/CD

GitHub Actions автоматически запускает:
- ✅ Lint
- ✅ Type check
- ✅ Tests (с PostgreSQL и Redis)
- ✅ Build

## 🔍 QA Kit & Валидация

ClubSuite включает полный набор инструментов для проверки и отладки:

### Автоматическая проверка

```bash
make verify
```

**Что проверяется:**
- ✅ Node.js и pnpm версии
- ✅ Docker и контейнеры
- ✅ .env переменные
- ✅ PostgreSQL подключение и схема
- ✅ Redis подключение
- ✅ API health
- ✅ Bot (getMe, webhook)
- ✅ WebApp доступность
- ✅ Smoke E2E тест (auth → catalog → reservation)

### Интерактивное исправление

```bash
make fix
```

**Что исправляется:**
- 🔧 Генерация .env из .env.example
- 🔧 Запуск Docker контейнеров
- 🔧 Применение миграций и seed
- 🔧 Установка Telegram webhook
- 🔧 Настройка DEV мок-платежей

### Типичные проблемы

См. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) для решения частых проблем:
- ❌ Неверный BOT_PUBLIC_URL
- ❌ Telegram 403 Forbidden
- ❌ Пустая база данных
- ❌ PostgreSQL/Redis не подключается
- ❌ JWT_SECRET слишком короткий

### Health Endpoints

- API: `http://localhost:3001/health`
- Bot: `http://localhost:3002/bot/health`
- WebApp: `http://localhost:3000/health`

### Door Dev Panel

Для отладки оффлайн-режима Door: `http://localhost:3000/door/dev`

## 📊 Критерии приёмки

### ✅ Все функции работают:

1. **Guest режим**
   - ✅ Просмотр событий
   - ✅ Бронирование с депозитом
   - ✅ Оплата через Telegram Payments
   - ✅ Check-in по QR-коду
   - ✅ Waitlist при отсутствии мест

2. **Promoter режим**
   - ✅ Создание заявок гостей
   - ✅ KPI (заявки, подтверждения, комиссия)
   - ✅ Реферальные ссылки

3. **Door режим**
   - ✅ Сканер QR-кодов
   - ✅ Проверка билетов
   - ✅ Поиск по имени/телефону
   - ✅ Dev панель для отладки оффлайн-кэша

4. **Admin режим**
   - ✅ Управление событиями
   - ✅ Управление пакетами
   - ✅ Аналитика и отчёты

## 📞 Контакты

Для вопросов и предложений создайте Issue в репозитории.

## 📄 Лицензия

MIT

---

**Версия:** 0.1.0 (MVP)  
**Статус:** ✅ Готов к разработке
