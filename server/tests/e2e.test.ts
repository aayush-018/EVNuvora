import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { pool } from '../src/config/database';

describe('EVNuvora Phase 9 - End-to-End Suite', () => {
  let authToken: string;
  let testUserId: string;
  let testChargerId: string;
  let testConnectorId: string;
  let testBookingId: string;

  const timestamp = Date.now();
  const testEmail = `suite_driver_${timestamp}@evnuvora.test`;

  afterAll(async () => {
    // Draining db pool
    await pool.end();
  });

  it('1. Health Check Endpoint responds with 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.services.database).toBe('connected');
  });

  it('2. Register new Driver user with bcrypt hash & JWT token pair', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        fullName: 'Aayush Test Driver',
        password: 'password123',
        role: 'driver_host',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.tokens.accessToken).toBeDefined();

    authToken = res.body.data.tokens.accessToken;
    testUserId = res.body.data.user.id;
  });

  it('3. Authenticate and retrieve user profile /api/v1/users/me', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testUserId);
    expect(res.body.data.fullName).toBe('Aayush Test Driver');
  });

  it('4. Host lists new EV charger with multi-connectors (CCS2, Type 2)', async () => {
    const res = await request(app)
      .post('/api/v1/chargers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Suite FastHub - Koramangala',
        address: '80ft Road, 4th Block, Koramangala, Bengaluru 560034',
        approximateArea: 'Koramangala',
        latitude: 12.9352,
        longitude: 77.6245,
        listingType: 'public',
        chargingType: 'AC_DC',
        pricePerUnit: 1800,
        parkingFee: 2000,
        isReservable: true,
        connectors: [
          { connectorType: 'ccs2', powerKw: 60, quantity: 2 },
          { connectorType: 'type2', powerKw: 22, quantity: 2 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Suite FastHub - Koramangala');
    expect(res.body.data.connectors.length).toBe(2);

    testChargerId = res.body.data.id;
    testConnectorId = res.body.data.connectors[0].id;
  });

  it('5. PostGIS Spatial Search locates charger within 5km radius with exact distance', async () => {
    // Search from Sony World Signal Koramangala (approx 600 meters away: 12.9380, 77.6260)
    const res = await request(app).get('/api/v1/chargers/search').query({
      latitude: 12.938,
      longitude: 77.626,
      radiusKm: 5,
      sortBy: 'distance',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const match = res.body.data.find((c: any) => c.id === testChargerId);
    expect(match).toBeDefined();
    expect(match.distanceKm).toBeLessThan(2.0);
  });

  it('6. Create booking slot and prevent double-booking collision', async () => {
    const startTime = new Date(Date.now() + 10000 * 1000).toISOString();
    const endTime = new Date(Date.now() + 13600 * 1000).toISOString();

    const bookingRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        chargerId: testChargerId,
        connectorId: testConnectorId,
        startTime,
        endTime,
        driverNote: 'Tata Nexon Max fast charge',
      });

    expect(bookingRes.status).toBe(201);
    expect(bookingRes.body.success).toBe(true);
    expect(bookingRes.body.data.status).toBe('pending');
    testBookingId = bookingRes.body.data.id;

    // Collision check: overlapping time slot on same connector must reject with 409 Conflict
    const collisionRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        chargerId: testChargerId,
        connectorId: testConnectorId,
        startTime,
        endTime,
      });

    expect(collisionRes.status).toBe(409);
    expect(collisionRes.body.success).toBe(false);
  });

  it('7. Process Razorpay payment order and verify capture', async () => {
    const orderRes = await request(app)
      .post(`/api/v1/bookings/${testBookingId}/payment-order`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(orderRes.status).toBe(200);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.data.orderId).toBeDefined();

    const verifyRes = await request(app)
      .post('/api/v1/bookings/payments/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        orderId: orderRes.body.data.orderId,
        paymentId: `pay_e2e_${Date.now()}`,
        signature: 'simulated_valid_signature',
        method: 'upi',
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.status).toBe('captured');
  });

  it('8. Admin endpoint /api/v1/admin/stats returns live platform metrics', async () => {
    const statsRes = await request(app).get('/api/v1/admin/stats');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.success).toBe(true);
    expect(statsRes.body.data.totalUsers).toBeGreaterThan(0);
    expect(statsRes.body.data.totalChargers).toBeGreaterThan(0);
  });
});
