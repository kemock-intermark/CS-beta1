# Структура проекта ClubSuite MVP

## 📁 Общая структура

```
ClubSuite/
├── .editorconfig
├── .eslintrc.js
├── .gitignore
├── .husky/
│   └── pre-commit
├── .lintstagedrc.json
├── .nvmrc
├── .prettierrc
├── .prettierignore
├── CHANGELOG.md
├── LICENSE
├── Makefile
├── PROJECT_STRUCTURE.md
├── README.md
├── SETUP.md
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
│
├── apps/
│   ├── api/              # Backend API (NestJS + Fastify)
│   │   ├── .eslintrc.js
│   │   ├── jest.config.js
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── tsconfig.build.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── app.controller.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.service.ts
│   │   │   ├── main.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── telegram-auth.dto.ts
│   │   │   ├── health/
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── health.module.ts
│   │   │   └── prisma/
│   │   │       ├── prisma.module.ts
│   │   │       └── prisma.service.ts
│   │   └── test/
│   │       └── app.e2e-spec.ts
│   │
│   ├── bot/              # Telegram Bot (grammY)
│   │   ├── .eslintrc.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── utils/
│   │           └── logger.ts
│   │
│   └── webapp/           # Telegram WebApp (Next.js)
│       ├── .eslintrc.json
│       ├── next.config.js
│       ├── next-env.d.ts
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── src/
│           ├── app/
│           │   ├── globals.css
│           │   ├── layout.tsx
│           │   └── page.tsx
│           └── lib/
│               └── telegram.ts
│
└── packages/             # Shared packages
    ├── config/           # Shared configs
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       └── index.ts
    │
    ├── shared/           # Shared types & utils
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       └── index.ts
    │
    └── ui/               # Shared UI components
        ├── package.json
        ├── tsconfig.json
        └── src/
            └── index.tsx
```

## 🛠️ Компоненты

### 1. Telegram Bot (`apps/bot`)
- **Framework**: grammY
- **Режимы**: Long polling (dev), Webhook (prod)
- **Функции**: Обработка команд, платежи, webhook

### 2. WebApp (`apps/webapp`)
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **Функции**: Telegram Mini App, авторизация через initData

### 3. Backend API (`apps/api`)
- **Framework**: NestJS + Fastify
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **Функции**: REST API, JWT auth, валидация Telegram initData

### 4. Shared Packages
- **config**: Общие конфигурации для всех приложений
- **shared**: Общие типы и утилиты
- **ui**: Переиспользуемые UI компоненты

## 🔧 Конфигурационные файлы

### Корневые
- `package.json` - зависимости и скрипты монорепо
- `pnpm-workspace.yaml` - конфигурация pnpm workspace
- `tsconfig.json` - базовый TypeScript конфиг
- `.eslintrc.js` - базовые правила ESLint
- `.prettierrc` - правила форматирования
- `.gitignore` - игнорируемые файлы
- `docker-compose.yml` - Docker контейнеры
- `Makefile` - удобные команды

### Для Bot
- `tsconfig.json` - настройки TypeScript
- `.eslintrc.js` - правила ESLint для бота

### Для WebApp
- `tsconfig.json` - настройки TypeScript для Next.js
- `next.config.js` - конфигурация Next.js
- `tailwind.config.js` - конфигурация Tailwind CSS
- `postcss.config.js` - конфигурация PostCSS
- `.eslintrc.json` - ESLint с поддержкой Next.js

### Для API
- `tsconfig.json` - настройки TypeScript
- `tsconfig.build.json` - настройки для сборки
- `nest-cli.json` - конфигурация NestJS CLI
- `jest.config.js` - конфигурация Jest
- `.eslintrc.js` - ESLint для NestJS
- `prisma/schema.prisma` - схема базы данных

## 📦 Зависимости

### Dev Dependencies (корневой package.json)
- TypeScript
- ESLint + Prettier
- Husky + lint-staged
- Commitlint

### Bot Dependencies
- grammY
- @grammyjs/menu
- @grammyjs/payment

### WebApp Dependencies
- Next.js 14
- React 18
- Tailwind CSS
- @twa-dev/sdk

### API Dependencies
- NestJS
- Fastify adapter
- Prisma
- JWT
- Swagger
- Jest

## 🚀 Быстрый старт

```bash
# 1. Установить зависимости
pnpm install

# 2. Запустить инфраструктуру
pnpm docker:up

# 3. Настроить БД
pnpm db:generate
pnpm db:migrate

# 4. Запустить в режиме разработки
pnpm dev
```

## 📚 Документация

- `README.md` - основная документация
- `SETUP.md` - инструкция по установке
- `CHANGELOG.md` - история изменений
- `LICENSE` - MIT License

## 🧪 Тестирование

```bash
# Все тесты
pnpm test

# API тесты
pnpm --filter @clubsuite/api run test

# Тесты с покрытием
pnpm --filter @clubsuite/api run test:cov
```

## 🔍 Инструменты разработки

- **ESLint** - проверка кода
- **Prettier** - форматирование
- **Husky** - Git hooks
- **lint-staged** - проверка staged файлов
- **Jest** - unit тесты
- **Supertest** - E2E тесты
- **Swagger** - API документация
