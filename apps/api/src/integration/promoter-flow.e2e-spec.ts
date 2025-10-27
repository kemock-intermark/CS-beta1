import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Promoter Flow (e2e)', () => {
  let app: INestApplication;
  let promoterToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    // Authenticate as promoter
    const authResponse = await request(app.getHttpServer())
      .post('/auth/tg/webapp/validate')
      .send({
        initData: 'user={"id":789012,"first_name":"Promoter"}&auth_date=1234567890&hash=test',
      });

    promoterToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Promoter operations', () => {
    it('should create a lead', async () => {
      const leadResponse = await request(app.getHttpServer())
        .post('/promoters/leads')
        .set('Authorization', `Bearer ${promoterToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          email: 'john@example.com',
          guestCount: 4,
        });

      expect(leadResponse.status).toBe(201);
    });

    it('should get promoter KPI', async () => {
      const kpiResponse = await request(app.getHttpServer())
        .get('/promoters/me/kpi')
        .set('Authorization', `Bearer ${promoterToken}`);

      expect(kpiResponse.status).toBe(200);
      expect(kpiResponse.body.kpi).toBeDefined();
      expect(kpiResponse.body.kpi.totalReservations).toBeGreaterThanOrEqual(0);
    });
  });
});
