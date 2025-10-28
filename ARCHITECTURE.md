# ClubSuite - Архитектура и Потоки Данных

## 🏗️ Системная Архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                         TELEGRAM                                 │
│  ┌──────────────┐              ┌──────────────┐                 │
│  │  Telegram    │              │  Telegram    │                 │
│  │     Bot      │              │   Mini App   │                 │
│  │ (ClubSuite)  │              │   (WebApp)   │                 │
│  └──────┬───────┘              └───────┬──────┘                 │
└─────────┼──────────────────────────────┼────────────────────────┘
          │                              │
          │ Webhook                      │ HTTPS API
          │                              │
┌─────────▼──────────┐          ┌────────▼────────┐
│   Bot Backend      │          │  Main Backend   │
│   (Node.js)        │◄────────►│   (NestJS)      │
│   - Commands       │  Internal│   - Business    │
│   - Payments       │    API   │     Logic       │
│   - Notifications  │          │   - Database    │
└────────────────────┘          └─────────┬───────┘
                                          │
                                ┌─────────▼───────┐
                                │   PostgreSQL    │
                                │   + Redis       │
                                └─────────────────┘
```

## 📊 Потоки Данных По Ролям

### 1️⃣ ГОСТЬ - Покупка Билета

```
[Гость] 
   ↓ Кликает ссылку от промоутера
[Telegram Bot]
   ↓ /start promoter_XXX → сохраняет атрибуцию
[Mini App Opens]
   ↓ Выбирает событие → "Buy Ticket"
[Telegram Bot]
   ↓ Отправляет Invoice через Telegram Payments
[Telegram Payment Form]
   ↓ Гость вводит карту и платит
[Telegram Bot]
   ↓ Получает successful_payment
[Backend API]
   ↓ Создает Ticket с QR-кодом
[Telegram Bot]
   ↓ Отправляет QR-билет гостю
[Гость]
   ✅ Имеет билет, готов к входу
```

**Время**: 30-60 секунд от приглашения до QR-кода

---

### 2️⃣ ПРОМОУТЕР - Привлечение Гостей

```
[Промоутер]
   ↓ /promoter → "Generate Link"
[Bot Backend]
   ↓ Создает уникальный код
[Main Backend]
   ↓ Сохраняет promoter_code в Redis (TTL 24h)
[Bot]
   ↓ Отправляет deep-link промоутеру
[Промоутер]
   ↓ Делится ссылкой в соцсетях
[Новый Гость]
   ↓ Кликает → открывается бот
[Bot]
   ↓ /start promoter_XXX
[Main Backend]
   ↓ Связывает гостя с промоутером
[База Данных]
   ✅ Атрибуция сохранена навсегда
```

**Результат**: Все покупки гостя приписываются промоутеру

---

### 3️⃣ DOOR - Вход Гостя

```
[Гость Приходит]
   ↓ Показывает QR-код из Telegram
[Door Person]
   ↓ Сканирует QR камерой
[Mini App Scanner]
   ↓ Отправляет QR-код на API
[Main Backend]
   ↓ Проверяет валидность билета
   ↓ Загружает данные гостя
[Mini App]
   ↓ Показывает:
     - Имя гостя
     - Статус (VIP/обычный)
     - Тип билета/брони
     - Информацию о событии
[Door Person]
   ↓ Нажимает ✅ Admit
[Main Backend]
   ↓ Отмечает check_in_time
   ↓ Обновляет статистику
[Гость]
   ✅ Проходит внутрь
```

**OFFLINE режим:**
```
[Нет Интернета] 📡
   ↓ Scanner работает с кэшем
[Local Storage]
   ↓ Проверяет QR локально
   ↓ Сохраняет check-in в очередь
[Интернет Появился] 🟢
   ↓ Нажимает "Sync Queue"
[Main Backend]
   ✅ Все данные синхронизированы
```

---

### 4️⃣ АДМИНИСТРАТОР - Создание События

```
[Admin]
   ↓ Логин → admin/Q123456
[Admin Panel]
   ↓ "Добавить событие"
[Form]
   ↓ Заполняет все поля
[Submit]
   ↓ POST /catalog/admin/events
[Main Backend]
   ↓ Валидация данных
   ↓ Создание Event в БД
[Database]
   ✅ Событие сохранено
[Catalog API]
   ↓ GET /catalog/events
[Mini App]
   ✅ Событие появилось в списке
```

---

## 🔐 Безопасность - Критические Точки

### Аутентификация Mini App (ОБЯЗАТЕЛЬНО!)

```
[Mini App Открывается]
   ↓ window.Telegram.WebApp.initData
[Frontend]
   ↓ Отправляет initData на API
[Backend]
   ↓ Проверяет подпись с BOT_TOKEN
   ↓ Извлекает user_id, username
   ↓ Создает JWT сессию
[Frontend]
   ✅ Сохраняет JWT для последующих запросов
```

**Почему Важно:**
- initData подписан Telegram → нельзя подделать
- Без проверки подписи = любой может притвориться любым пользователем
- **НЕ ДОВЕРЯТЬ** initDataUnsafe (только для отладки!)

### Deep Links - Безопасность Атрибуции

```
[Promoter Link Generated]
   ↓ Уникальный токен = UUID
[Redis]
   ↓ Сохранение: token → promoter_id (TTL 24h)
[Гость Кликает]
   ↓ /start promoter_TOKEN
[Backend]
   ↓ Проверяет токен в Redis
   ↓ Если валиден → связывает гостя с промоутером
   ↓ Удаляет токен (одноразовый!)
[Database]
   ✅ Guest.referredBy = Promoter.id
```

**Защита от Фрода:**
- Токен одноразовый
- TTL 24 часа
- Первый промоутер "захватывает" гостя навсегда

---

## 💳 Платежи - Telegram Payments Flow

```
[Mini App]
   ↓ Гость нажимает "Buy Ticket"
[Telegram Bot]
   ↓ ctx.api.sendInvoice(...)
   ↓ Параметры:
     - title: "ClubSuite - Event Ticket"
     - description: Описание события
     - payload: ticket_EVENT_ID_TIMESTAMP
     - provider_token: PAYMENT_PROVIDER_TOKEN
     - prices: [{ label: 'Ticket', amount: 2500 }]
[Telegram]
   ↓ Показывает форму оплаты гостю
[Гость]
   ↓ Вводит карту → Оплачивает
[Telegram]
   ↓ pre_checkout_query → бот должен ответить OK
[Bot Backend]
   ↓ Проверяет payload
   ↓ ctx.answerPreCheckoutQuery(true)
[Telegram]
   ↓ Списывает деньги
   ↓ successful_payment → бот получает уведомление
[Bot Backend]
   ↓ Извлекает данные платежа
   ↓ POST /payments/telegram/callback
[Main Backend]
   ↓ Создает Ticket
   ↓ Генерирует QR-код
   ↓ Возвращает ticket_id
[Bot]
   ↓ Отправляет QR гостю
[Гость]
   ✅ Получил билет!
```

**Важно:**
- `amount` в копейках (25.00$ = 2500)
- `payload` = уникальный идентификатор для связи платежа с билетом
- `provider_token` = токен от платежного провайдера (Stripe/ЮMoney)

---

## 🎯 Компоненты Системы - Детали

### Backend API (NestJS)

**Модули:**
```
AppModule
├── AuthModule (JWT, Telegram validation)
├── CatalogModule (Events, Packages, Venues)
├── ReservationsModule (Table bookings)
├── TicketsModule (Ticket purchase, QR)
├── PaymentsModule (Telegram Payments callback)
├── CheckinModule (Door QR scan)
├── PromotersModule (Links, KPI, Guests)
├── ReportsModule (Analytics)
└── UsersModule (User management)
```

**База Данных (Prisma Schema):**
```
User (id, telegramId, role, vipLevel, referredBy)
  ↓ 1:N
Ticket (id, userId, eventId, qrCode, status)
Reservation (id, userId, eventId, tableId, deposit)
  ↓ N:1
Event (id, venueId, date, name, capacity)
  ↓ N:1
Venue (id, name, city, address)
  ↓ 1:N
Hall (id, venueId, name, capacity)
  ↓ 1:N
Package (id, eventId, name, price, benefits)
```

### Bot Backend (Grammy.js)

**Handlers:**
```
commands.ts
  - /start (deep links, promoter attribution)
  - /menu, /events, /my, /help
  
promoter.ts
  - /promoter (dashboard)
  - Generate links
  - View guests
  - KPI stats
  - Broadcast
  
payments.ts
  - pre_checkout_query (validate before payment)
  - successful_payment (create ticket)
  
callbacks.ts
  - Button handlers
  - Navigation
```

### Frontend (Next.js 14)

**Pages:**
```
/events              - Каталог событий
/events/[id]         - Детали события + покупка
/book                - Бронирование стола (форма)
/my/tickets          - QR-билеты гостя
/promoter            - Dashboard промоутера
/door                - Сканер QR для входа
/waitlist            - Запись в лист ожидания
/admin               - Панель администратора
/admin/events/create - Создание события
/admin/packages/new  - Создание пакета
/admin/users         - Управление пользователями
```

---

## 🔄 Критические Процессы - Детали

### Waitlist - Автоматические Уведомления

```
[Событие Заполнено]
   ↓ capacity = 200, sold = 200
[Гость]
   ↓ Нажимает "Join Waitlist"
[Backend]
   ↓ Создает WaitlistEntry
   ↓ position = 1, 2, 3...
[Другой Гость Отменяет Бронь]
   ↓ sold = 199, available = 1
[Backend - Cron Job каждые 5 мин]
   ↓ Проверяет waitlist
   ↓ Находит первого в очереди
[Bot]
   ↓ Отправляет уведомление:
     "🎉 Место освободилось! 
      У вас 15 минут для брони."
[Гость]
   ↓ Кликает → оплачивает
[Backend]
   ↓ Удаляет из waitlist
   ↓ sold = 200
```

**Приоритет в waitlist:**
1. VIP гости (выше в очереди)
2. Время добавления в waitlist
3. Размер группы (меньше = выше шанс)

### VIP CRM - Автоматическое Определение

```
[Гость Покупает Билет]
   ↓
[Backend Смотрит Историю]
   ↓ Если spent_total > $500 → VIP Silver
   ↓ Если spent_total > $1000 → VIP Gold
   ↓ Если spent_total > $2500 → VIP Platinum
[Database]
   ↓ User.vipLevel = 'GOLD'
   ↓ User.vipSince = now()
[Benefits Activated]
   ✅ Приоритет в waitlist
   ✅ Ранний доступ к новым событиям
   ✅ Персональный менеджер
   ✅ Комплименты от заведения
```

**VIP бейдж на входе:**
- Door person видит ⭐ GOLD VIP
- Особое внимание и сервис

### No-Show Handling

```
[Событие Завершилось]
   ↓ event.endTime прошло
[Backend - Cron Job]
   ↓ Проверяет все Reservations
   ↓ Если check_in_time = null → NO SHOW
[Penalty]
   ↓ Если deposit оплачен → не возвращается
   ↓ User.noShowCount += 1
[Если noShowCount >= 3]
   ↓ User.restricted = true
   ↓ Следующие брони требуют 100% предоплату
[Bot Notification]
   ↓ "❌ Вы не пришли на событие.
      Депозит не возвращается."
```

---

## 🔌 API Endpoints - Полная Карта

### Public (Без Auth)
```
GET  /catalog/events           - Список событий
GET  /catalog/events/:id       - Детали события
GET  /catalog/packages         - VIP пакеты
POST /auth/browser-login       - Логин админа
```

### Authenticated (JWT Required)
```
POST /reservations             - Создать бронь
GET  /reservations             - Мои брони
POST /tickets                  - Купить билет
GET  /tickets                  - Мои билеты
POST /checkin/scan             - Сканировать QR
GET  /promoters/me/kpi         - KPI промоутера
POST /promoters/leads          - Добавить гостя
```

### Admin Only
```
POST /catalog/admin/events     - Создать событие
POST /catalog/admin/packages   - Создать пакет
POST /catalog/admin/seed       - Заполнить тестовыми данными
GET  /catalog/admin/events     - Все события (не только активные)
GET  /admin/users              - Все пользователи
GET  /reports/overview         - Отчеты
```

### Webhook (From Telegram)
```
POST /telegram-webhook         - Обновления от бота
POST /payments/telegram/callback - Подтверждение платежа
```

---

## 💾 Схема Базы Данных (Prisma)

### Core Entities

```prisma
model User {
  id            String   @id @default(uuid())
  telegramId    String   @unique
  username      String?
  firstName     String?
  role          Role     @default(GUEST)
  vipLevel      VipLevel?
  referredBy    String?  // ID промоутера
  
  tickets       Ticket[]
  reservations  Reservation[]
  checkIns      CheckIn[]
}

model Event {
  id            String   @id @default(uuid())
  venueId       String
  hallId        String?
  name          String
  description   String?
  date          DateTime
  startTime     DateTime
  endTime       DateTime
  capacity      Int?
  coverCharge   Decimal?
  status        EventStatus @default(ACTIVE)
  
  venue         Venue    @relation(fields: [venueId])
  tickets       Ticket[]
  reservations  Reservation[]
  packages      Package[]
}

model Ticket {
  id            String   @id @default(uuid())
  userId        String
  eventId       String
  packageId     String?
  qrCode        String   @unique
  status        TicketStatus @default(ACTIVE)
  purchasePrice Decimal
  purchasedAt   DateTime @default(now())
  
  user          User     @relation(fields: [userId])
  event         Event    @relation(fields: [eventId])
  checkIn       CheckIn?
}

model CheckIn {
  id            String   @id @default(uuid())
  ticketId      String   @unique
  userId        String
  eventId       String
  checkInTime   DateTime @default(now())
  checkedInBy   String   // Door person ID
  admitted      Boolean  @default(true)
  denyReason    String?
  
  ticket        Ticket   @relation(fields: [ticketId])
}

model PromoterCode {
  id            String   @id @default(uuid())
  promoterId    String
  code          String   @unique
  createdAt     DateTime @default(now())
  expiresAt     DateTime
  used          Boolean  @default(false)
}

enum Role {
  GUEST
  PROMOTER
  DOOR
  MANAGER
  ADMIN
}

enum VipLevel {
  SILVER
  GOLD
  PLATINUM
}
```

---

## 🚀 Deployment Architecture (Render)

```
GitHub Repository
   ↓ Auto-deploy on push to main
┌────────────────────────────────────┐
│           Render.com               │
│                                    │
│  ┌─────────────────────────────┐  │
│  │  clubsuite-webapp           │  │
│  │  (Next.js Static + SSR)     │  │
│  │  Port: 3000                 │  │
│  └─────────────────────────────┘  │
│                                    │
│  ┌─────────────────────────────┐  │
│  │  clubsuite-api              │  │
│  │  (NestJS API)               │  │
│  │  Port: 10000                │  │
│  └─────────────────────────────┘  │
│                                    │
│  ┌─────────────────────────────┐  │
│  │  clubsuite-bot              │  │
│  │  (Telegram Webhook Server)  │  │
│  │  Port: 3002                 │  │
│  └─────────────────────────────┘  │
│                                    │
│  ┌─────────────────────────────┐  │
│  │  clubsuite-postgres         │  │
│  │  (PostgreSQL 16)            │  │
│  └─────────────────────────────┘  │
└────────────────────────────────────┘

External:
  Redis Cloud (redis-14432.c14.us-east-1-2.ec2.redns.redis-cloud.com)
```

---

## 📱 Telegram Integration Points

### Bot Commands (Registered)
```javascript
/start      - Начать работу (+ deep links)
/menu       - Главное меню
/book       - Забронировать стол
/events     - Мероприятия
/my         - Мои бронирования
/promoter   - Промоутер панель
/help       - Справка
```

### Menu Button
```javascript
{
  type: 'web_app',
  text: 'ClubSuite',
  web_app: { url: 'https://clubsuite-webapp.onrender.com/app' }
}
```

### Webhooks
```
Bot Webhook: https://clubsuite-bot.onrender.com/bot/SECRET
Health Check: https://clubsuite-bot.onrender.com/health
```

---

## 🧪 Тестовые Сценарии

### Сценарий 1: Промоутер Приводит VIP Гостя
1. Промоутер: `/promoter` → генерирует ссылку
2. VIP гость: кликает → покупает Gold Package ($500)
3. Промоутер: видит в stats +$500 revenue, +$75 commission
4. VIP гость: приходит → Door видит ⭐ GOLD VIP
5. VIP гость: проходит без очереди
6. Backend: user.vipLevel = 'GOLD' (автоматически)

### Сценарий 2: Waitlist → Автоматическое Заполнение
1. Событие: sold = 200/200 (полностью)
2. Гость А: Join Waitlist → position = 1
3. Гость Б: Join Waitlist → position = 2
4. VIP Гость: Join Waitlist → position = 0 (приоритет!)
5. Кто-то отменяет бронь → sold = 199
6. Bot → уведомление VIP гостю (первый в очереди)
7. VIP гость: покупает за 15 минут
8. sold = 200 again

### Сценарий 3: Door Offline Mode
1. Событие началось, 100 гостей уже зашли
2. Интернет пропал → 📡 OFFLINE
3. Door: продолжает сканировать (работает с кэшем)
4. 50 гостей прошли → check-ins в очереди
5. Интернет появился → 🟢 ONLINE
6. Door: "Sync Queue" → все 50 синхронизированы
7. Backend: статистика корректна

---

## 📈 Метрики и KPI

### Операционные (Real-time)
- **Входы по часам** - графики пиков
- **Текущая загрузка** - X/capacity
- **No-show rate** - % не пришедших
- **Средняя очередь** - время прохода

### Промоутерские
- **Conversion rate** - invited → confirmed
- **Attendance rate** - confirmed → attended
- **Revenue per lead** - total_revenue / invited
- **Commission earned** - сумма выплат

### Финансовые
- **Total revenue** - общая выручка
- **By channel** - Telegram vs Direct vs Promoter
- **Average check** - средний чек
- **VIP contribution** - % от VIP гостей

### Маркетинговые
- **Repeat rate** - % повторных визитов
- **Time to return** - средний интервал между визитами
- **Campaign ROI** - выручка / затраты на рекламу

---

**Последнее обновление**: 28.10.2025
**Статус**: Production Ready ✅
