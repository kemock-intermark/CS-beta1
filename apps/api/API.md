# ClubSuite API Documentation

## Base URL
```
http://localhost:3001
```

## Swagger UI
```
http://localhost:3001/api/docs
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 🔐 Authentication

#### `POST /auth/tg/webapp/validate`
Validate Telegram initData and issue JWT token.

**Request:**
```json
{
  "initData": "user={\"id\":123456,\"first_name\":\"John\"}&auth_date=1234567890&hash=abc123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "telegramId": "123456",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "role": "USER"
  }
}
```

---

### 📚 Catalog

#### `GET /catalog/events`
Get list of active events.

**Query Parameters:**
- `status` (optional) - Filter by status
- `startDate` (optional) - Filter by start date
- `endDate` (optional) - Filter by end date

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "VIP Weekend Party",
    "description": "Exclusive Saturday night event",
    "date": "2024-01-15T22:00:00Z",
    "startTime": "2024-01-15T22:00:00Z",
    "endTime": "2024-01-16T04:00:00Z",
    "status": "PUBLISHED",
    "capacity": 500,
    "coverCharge": 50.00,
    "venue": {
      "id": "uuid",
      "name": "ClubSuite VIP",
      "address": "123 Main Street",
      "city": "New York"
    },
    "hall": {
      "id": "uuid",
      "name": "Main Dance Floor",
      "capacity": 500
    },
    "packages": [...]
  }
]
```

#### `GET /catalog/events/:id`
Get event by ID.

**Headers:**
```
Authorization: Bearer <token>
```

#### `GET /catalog/packages`
Get list of active packages.

**Query Parameters:**
- `eventId` (optional) - Filter by event ID

**Headers:**
```
Authorization: Bearer <token>
```

#### `GET /catalog/packages/:id`
Get package by ID.

---

### 📅 Reservations

#### `POST /reservations`
Create a new reservation.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "eventId": "uuid",
  "tableId": "uuid",
  "packageId": "uuid",
  "guestCount": 6,
  "reservationDate": "2024-01-15T22:00:00Z",
  "notes": "Birthday celebration"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "PENDING",
  "guestCount": 6,
  "event": {...},
  "table": {...},
  "package": {...}
}
```

#### `GET /reservations`
Get user's reservations.

**Headers:**
```
Authorization: Bearer <token>
```

#### `GET /reservations/:id`
Get reservation by ID.

**Headers:**
```
Authorization: Bearer <token>
```

#### `DELETE /reservations/:id`
Cancel reservation.

**Headers:**
```
Authorization: Bearer <token>
```

---

### 🎫 Tickets

#### `POST /tickets`
Buy a ticket.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "eventId": "uuid",
  "type": "VIP"
}
```

**Response:**
```json
{
  "id": "uuid",
  "type": "VIP",
  "price": "100.00",
  "qrCode": "TICKET:uuid:event-id:user-id",
  "qrCodeImage": "data:image/png;base64,...",
  "event": {...}
}
```

#### `GET /tickets`
Get user's tickets.

**Headers:**
```
Authorization: Bearer <token>
```

---

### 💳 Payments

#### `POST /payments/telegram/invoice`
Create invoice for payment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "reservationId": "uuid",
  "amount": 1500.00,
  "currency": "USD",
  "description": "VIP Package reservation"
}
```

**Response:**
```json
{
  "invoiceUrl": "https://t.me/...",
  "paymentId": "uuid",
  "transactionId": "uuid",
  "amount": 1500.00,
  "currency": "USD"
}
```

#### `POST /payments/telegram/callback`
Webhook for successful payment (called by Telegram).

**Request:**
```json
{
  "transaction_id": "uuid",
  "status": "success"
}
```

#### `GET /payments`
Get user's payments.

**Headers:**
```
Authorization: Bearer <token>
```

---

### ✅ Checkin

#### `POST /checkin/scan`
Scan ticket QR code for checkin.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "qrCode": "TICKET:uuid:event-id:user-id"
}
```

**Response:**
```json
{
  "checkin": {
    "id": "uuid",
    "userId": "uuid",
    "eventId": "uuid",
    "checkedInAt": "2024-01-15T22:30:00Z"
  },
  "ticket": {
    "id": "uuid",
    "isScanned": true
  }
}
```

---

### 👥 Promoters

#### `POST /promoters/leads`
Add guest lead by promoter.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "eventId": "uuid",
  "guestCount": 4
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "promoterCode": "JOHN001"
}
```

#### `GET /promoters/me/kpi`
Get promoter's KPI.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "promoter": {
    "name": "John Promoter",
    "code": "JOHN001",
    "commission": 15.00
  },
  "kpi": {
    "totalReservations": 10,
    "confirmedReservations": 8,
    "conversionRate": 80.00,
    "totalCommission": 1500.00,
    "paidCommission": 1000.00,
    "pendingCommission": 500.00
  }
}
```

---

### 📊 Reports

#### `GET /reports/overview`
Get basic analytics overview.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional) - Start date filter
- `endDate` (optional) - End date filter

**Response:**
```json
{
  "summary": {
    "totalUsers": 150,
    "totalEvents": 20,
    "totalReservations": 80,
    "confirmedReservations": 65,
    "checkedInReservations": 60,
    "totalTickets": 200,
    "totalCheckins": 180,
    "totalPayments": 120,
    "totalRevenue": 50000.00
  },
  "metrics": {
    "reservationConfirmationRate": 81.25,
    "checkinRate": 75.00,
    "averageTicketValue": 250.00
  },
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  }
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Invalid input",
  "error": "Bad Request"
}
```
