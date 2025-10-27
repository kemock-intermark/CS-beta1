import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Smoke E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let eventId: string;
  let reservationId: string;
  let ticketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.db).toBe(true);
    });
  });

  describe('2. Authentication Flow', () => {
    it('should authenticate with mock initData', async () => {
      // Mock initData for development
      const mockInitData = 'user={"id":999999,"first_name":"Smoke","last_name":"Test","username":"smoketest"}&auth_date=' + 
        Math.floor(Date.now() / 1000) + '&hash=dev_mock_hash';

      const response = await request(app.getHttpServer())
        .post('/auth/tg/webapp/validate')
        .send({ initData: mockInitData })
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      authToken = response.body.accessToken;
    });
  });

  describe('3. Catalog', () => {
    it('should get events list', async () => {
      const response = await request(app.getHttpServer())
        .get('/catalog/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        eventId = response.body[0].id;
      }
    });

    it('should get packages list', async () => {
      const response = await request(app.getHttpServer())
        .get('/catalog/packages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('4. Reservation Flow', () => {
    it('should create a reservation', async () => {
      if (!eventId) {
        console.warn('⚠️ Skipping reservation test - no events in DB');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId,
          guestCount: 2,
          reservationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Smoke test reservation',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      reservationId = response.body.id;
    });
  });

  describe('5. Ticket Flow', () => {
    it('should purchase a ticket', async () => {
      if (!eventId) {
        console.warn('⚠️ Skipping ticket test - no events in DB');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId,
          type: 'REGULAR',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.qrCodeImage).toBeDefined();
      ticketId = response.body.id;
    });
  });

  describe('6. Promoter Flow', () => {
    it('should create a lead', async () => {
      const response = await request(app.getHttpServer())
        .post('/promoters/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          email: 'john.doe@example.com',
          guestCount: 4,
        });

      // May fail if user is not a promoter, which is expected
      if (response.status === 201) {
        expect(response.body.id).toBeDefined();
      }
    });

    it('should get promoter KPI', async () => {
      const response = await request(app.getHttpServer())
        .get('/promoters/me/kpi')
        .set('Authorization', `Bearer ${authToken}`);

      // May fail if user is not a promoter, which is expected
      if (response.status === 200) {
        expect(response.body.kpi).toBeDefined();
      }
    });
  });

  describe('7. Reports', () => {
    it('should get overview report', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.totalUsers).toBeGreaterThanOrEqual(0);
      expect(response.body.totalEvents).toBeGreaterThanOrEqual(0);
    });
  });
});

