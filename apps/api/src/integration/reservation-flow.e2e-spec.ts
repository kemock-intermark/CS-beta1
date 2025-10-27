import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Reservation Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    // Authenticate and get token
    const authResponse = await request(app.getHttpServer())
      .post('/auth/tg/webapp/validate')
      .send({
        initData: 'user={"id":123456,"first_name":"Test"}&auth_date=1234567890&hash=test',
      });

    authToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Reservation → Payment → Check-in Flow', () => {
    it('should create reservation with deposit', async () => {
      // Step 1: Get events
      const eventsResponse = await request(app.getHttpServer())
        .get('/catalog/events')
        .set('Authorization', `Bearer ${authToken}`);

      expect(eventsResponse.status).toBe(200);
      const events = eventsResponse.body;
      expect(events.length).toBeGreaterThan(0);

      const event = events[0];

      // Step 2: Create reservation
      const reservationResponse = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: event.id,
          guestCount: 4,
          reservationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Test reservation',
        });

      expect(reservationResponse.status).toBe(201);
      const reservation = reservationResponse.body;

      // Step 3: Get payment invoice
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments/telegram/invoice')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reservationId: reservation.id,
          amount: 100,
          currency: 'USD',
          description: 'Deposit for reservation',
        });

      expect(paymentResponse.status).toBe(201);
      const payment = paymentResponse.body;

      // Step 4: Simulate payment callback
      const callbackResponse = await request(app.getHttpServer())
        .post('/payments/telegram/callback')
        .send({
          transaction_id: payment.transactionId,
          status: 'success',
        });

      expect(callbackResponse.status).toBe(200);

      // Step 5: Verify reservation is confirmed
      const updatedReservation = await request(app.getHttpServer())
        .get(`/reservations/${reservation.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(updatedReservation.body.status).toBe('CONFIRMED');
    });
  });
});
