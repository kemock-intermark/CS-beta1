# ClubSuite Telegram Bot

Telegram Bot для управления бронированиями и билетами клуба.

## 🚀 Запуск

### Development (Long Polling)
```bash
pnpm dev
```

### Production (Webhook)
```bash
pnpm build
pnpm start
```

## 📋 Команды

- `/start` - Начать работу с ботом
- `/menu` - Главное меню
- `/book` - Бронирование стола
- `/events` - Просмотр мероприятий
- `/my` - Мои бронирования и билеты
- `/help` - Справка

## 🎯 Функциональность

### 1. Deep Links
Поддержка deep-link с промоутером:
```
https://t.me/your_bot?start=promoter_JOHN001
```

### 2. Menu Button
Кнопка меню, открывающая WebApp:
- Отображается в меню чата
- Ведет на `${WEBAPP_BASE_URL}/app`

### 3. Telegram Payments
Интеграция с Telegram Payments API:

**Создание инвойса:**
```typescript
await ctx.api.sendInvoice(userId, {
  title: 'ClubSuite - Бронирование',
  description: 'VIP Table Booking',
  payload: 'reservation_123',
  provider_token: PAYMENT_TOKEN,
  currency: 'USD',
  prices: [{ label: 'Total', amount: 150000 }],
});
```

**Обработка платежей:**
- `pre_checkout_query` - подтверждение платежа
- `successful_payment` - успешная оплата
- Интеграция с backend API

### 4. Inline клавиатуры

**Основные кнопки:**
- `🎯 Открыть Mini App` - WebApp
- `💳 Оплатить депозит` - Payment invoice
- `📱 Посмотреть QR` - Просмотр QR-кода билета

### 5. Интеграция с Backend

Бот взаимодействует с API через `api-client`:
- Получение событий: `GET /catalog/events`
- Получение бронирований: `GET /reservations`
- Получение билетов: `GET /tickets`
- Обработка платежей: `POST /payments/telegram/callback`

## 📁 Структура

```
src/
├── handlers/
│   ├── commands.ts     # Команды бота
│   ├── callbacks.ts    # Callback handlers
│   └── payments.ts     # Payment handlers
├── keyboards/
│   ├── menus.ts        # Inline клавиатуры
│   └── index.ts
├── services/
│   └── api-client.ts   # API клиент
├── utils/
│   └── logger.ts       # Логгер
└── index.ts            # Главный файл
```

## 🔧 Настройка

### Переменные окружения (.env)

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_PAYMENT_PROVIDER_TOKEN=your_payment_token
WEBAPP_BASE_URL=https://your-webapp.com
API_BASE_URL=https://your-api.com
BOT_PUBLIC_URL=https://your-bot-domain.com
NODE_ENV=production
```

### Webhook Setup

Для production настройте webhook:

```bash
curl -X POST https://api.telegram.org/bot$BOT_TOKEN/setWebhook \
  -d "url=https://your-domain.com/webhook"
```

## 🧪 Тестирование

### Long Polling (Development)
```bash
TELEGRAM_BOT_TOKEN=xxx pnpm dev
```

### Webhook (Production)
Создайте Fastify server:

```typescript
import { fastify } from 'fastify';
import { webhookCallback } from './dist/index';

const server = fastify();

server.post('/webhook', async (request, reply) => {
  const handler = await webhookCallback;
  return handler(request.raw, reply.raw);
});

server.listen(3000);
```

## 📝 Логирование

Все события логируются через `logger`:
- Commands
- Callbacks
- Payments
- API calls
- Errors

## 🔄 Workflow

1. **User** отправляет `/start`
2. **Bot** показывает главное меню
3. **User** нажимает "Открыть Mini App"
4. **WebApp** открывается в Telegram
5. **User** выбирает событие/стол
6. **Payment** через Telegram Payments
7. **Backend** обрабатывает платеж
8. **Bot** подтверждает бронь и отправляет QR

## 💡 Примеры

### Deep Link с промоутером
```
https://t.me/clubsuitep_bot?start=promoter_JOHN001
```

### Открыть WebApp
Кнопка "🎯 Открыть Mini App" с параметрами:
- `/app?action=book` - бронирование
- `/app?event=123` - конкретное событие
- `/app?ticket=456` - билет

### Оплата
После выбора стола → invoice → оплата → подтверждение

## 📚 Документация

- [grammY Documentation](https://grammy.dev)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Payments](https://core.telegram.org/bots/payments)
