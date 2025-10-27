# База данных ClubSuite

## 📊 Схема данных

### Основные сущности

- **Venue** - место/клуб
- **Hall** - зал внутри venue
- **Table** - стол для резервирования
- **Event** - событие/вечер
- **Package** - пакет услуг (bottle service)
- **User** - пользователь системы
- **GuestProfile** - профиль гостя с предпочтениями
- **Reservation** - бронирование
- **Ticket** - билет
- **WaitlistEntry** - лист ожидания
- **Promoter** - промоутер
- **PromoterAttribution** - атрибуция промоутера к резервации
- **Checkin** - чекин пользователя
- **Payment** - платеж
- **MessageLog** - лог сообщений

### Статусы

#### ReservationStatus
- `PENDING` - ожидает подтверждения
- `CONFIRMED` - подтверждено
- `CANCELLED` - отменено
- `CHECKED_IN` - зарегистрировано
- `COMPLETED` - завершено

#### PaymentStatus
- `PENDING` - ожидает оплаты
- `PAID` - оплачено
- `REFUNDED` - возвращено
- `FAILED` - неудача

#### EventStatus
- `DRAFT` - черновик
- `PUBLISHED` - опубликовано
- `ONGOING` - происходит сейчас
- `COMPLETED` - завершено
- `CANCELLED` - отменено

#### TableStatus
- `AVAILABLE` - доступно
- `RESERVED` - зарезервировано
- `OCCUPIED` - занято
- `MAINTENANCE` - на обслуживании

## 🚀 Миграции и Seed

### Создание миграции

```bash
# Создать новую миграцию
pnpm db:migrate

# Или с именем
cd apps/api
npx prisma migrate dev --name your_migration_name
```

### Применение миграций

```bash
# Development
pnpm db:migrate

# Production (без интерактивного подтверждения)
pnpm --filter @clubsuite/api run db:deploy
```

### Seed (демо-данные)

Seed создает:
- 1 Venue (ClubSuite VIP)
- 2 Hall (Main Dance Floor, VIP Lounge)
- 5 Tables (с разной вместимостью)
- 1 Event (VIP Weekend Party)
- 2 Packages (Premium и Deluxe Bottle Service)
- 10 Users (включая 1 админа)
- 5 Guest Profiles
- 1 Promoter
- 2 Reservations
- 2 Tickets
- 1 Waitlist Entry
- 1 Payment

```bash
# Запустить seed
pnpm db:seed

# Или напрямую
pnpm --filter @clubsuite/api run db:seed
```

## 🔄 Сброс базы данных

```bash
# Удалить все данные и применить миграции заново
cd apps/api
npx prisma migrate reset

# Это также автоматически запустит seed (если настроен)
```

## 📊 Prisma Studio

Визуальный редактор базы данных:

```bash
pnpm db:studio
```

Откроется по адресу: http://localhost:5555

## 🗑️ Очистка миграций

**ВНИМАНИЕ**: Только для development!

```bash
# Удалить папку миграций
rm -rf apps/api/prisma/migrations

# Создать начальную миграцию
cd apps/api
npx prisma migrate dev --name init

# Применить seed
pnpm db:seed
```

## 📝 Полезные команды Prisma

```bash
# Показать статус базы
npx prisma migrate status

# Сгенерировать Prisma Client
pnpm db:generate

# Форматировать schema
npx prisma format

# Валидация schema
npx prisma validate
```

## 🔍 Примеры запросов

### Получить все события с venue и hall

```typescript
const events = await prisma.event.findMany({
  include: {
    venue: true,
    hall: true,
    packages: true,
  },
});
```

### Получить резервацию с деталями

```typescript
const reservation = await prisma.reservation.findUnique({
  where: { id },
  include: {
    user: true,
    event: true,
    table: true,
    package: true,
    ticket: true,
    payment: true,
  },
});
```

### Получить профиль гостя со статистикой

```typescript
const guest = await prisma.guestProfile.findUnique({
  where: { userId },
  include: {
    user: {
      include: {
        reservations: {
          where: {
            status: 'COMPLETED',
          },
        },
        checkins: true,
      },
    },
  },
});
```

## 📈 Индексы

Схема включает индексы для оптимизации:
- `events(date)` - для фильтрации по дате
- `events(status)` - для фильтрации по статусу
- `reservations(status)` - для фильтрации резерваций
- `reservations(reservationDate)` - для сортировки по дате
- `tickets(qrCode)` - для быстрого поиска по QR
- `checkins(checkedInAt)` - для статистики
- `message_logs(createdAt)` - для хронологии

## ⚠️ Best Practices

1. **Всегда используйте UUID для ID** - уже настроено в схеме
2. **Timestamp поля** - createdAt, updatedAt автоматически обновляются
3. **Soft deletes** - используйте isActive вместо DELETE
4. **Metadata поля** - используйте Json для гибкого хранения
5. **Cascade deletes** - настроены для связанных данных
6. **Indices** - добавлены для частых запросов

## 🔗 Связи

- User -> GuestProfile (1:1)
- User -> Reservations (1:N)
- Venue -> Halls (1:N)
- Hall -> Tables (1:N)
- Event -> Packages (1:N)
- Event -> Tickets (1:N)
- Reservation -> PromoterAttribution (1:1)
- Table -> Reservations (1:N)

Все связи настроены с каскадным удалением для целостности данных.
