import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';

describe('Phase 12: Monthly Tracking, Reports & Security Integration Test Suite', () => {
  let tokenUserA, tokenUserB;
  let userAId, userBId;
  let householdAId, householdBId;
  let snapshotRecordId;
  let reportId;

  beforeAll(async () => {
    // Clean database tables in order
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE reports');
    await db.query('TRUNCATE TABLE monthly_records');
    await db.query('TRUNCATE TABLE ai_insights');
    await db.query('TRUNCATE TABLE predictions');
    await db.query('TRUNCATE TABLE expenses');
    await db.query('TRUNCATE TABLE households');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Alpha', email: 'userA@example.com', password: 'Password123!' });
    tokenUserA = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Beta', email: 'userB@example.com', password: 'Password123!' });
    tokenUserB = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Create Household A (User A)
    const hhResA = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        name: 'Household Alpha',
        location: 'Mumbai',
        totalMembers: 4,
        earningMembers: 2,
        dependentMembers: 2,
        childrenCount: 1,
        elderlyCount: 0,
        monthlyIncome: 80000
      });
    householdAId = hhResA.body.data.id;

    // Add Expenses for Household A
    await request(app)
      .post(`/api/households/${householdAId}/expenses`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ category: 'HOUSING', amount: 30000, isEssential: true, description: 'Rent' });

    await request(app)
      .post(`/api/households/${householdAId}/expenses`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ category: 'FOOD', amount: 15000, isEssential: true, description: 'Groceries' });

    // Create Household B (User B)
    const hhResB = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({
        name: 'Household Beta',
        location: 'Delhi',
        totalMembers: 3,
        earningMembers: 1,
        dependentMembers: 2,
        childrenCount: 1,
        elderlyCount: 1,
        monthlyIncome: 50000
      });
    householdBId = hhResB.body.data.id;
  });

  afterAll(async () => {
    await db.end();
  });

  /* ----------------------------------------------------
   * 1. MONTHLY SNAPSHOT CREATION & IMMUTABILITY
   * ---------------------------------------------------- */
  describe('1. Monthly Snapshot Functionality & Immutability', () => {
    test('TC-PH12-01: Create valid monthly snapshot for Household A', async () => {
      const res = await request(app)
        .post(`/api/households/${householdAId}/monthly-records`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          recordMonth: 10,
          recordYear: 2026,
          notes: 'Snapshot after October bonus',
          overwrite: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.householdId).toBe(householdAId);
      expect(res.body.data.recordMonth).toBe(10);
      expect(res.body.data.recordYear).toBe(2026);
      expect(Number(res.body.data.monthlyIncome)).toBe(80000);
      expect(Number(res.body.data.totalExpenses)).toBe(45000);
      expect(Number(res.body.data.monthlySavings)).toBe(35000);

      snapshotRecordId = res.body.data.id;
    });

    test('TC-PH12-02: Reject duplicate month/year snapshot when overwrite is false', async () => {
      const res = await request(app)
        .post(`/api/households/${householdAId}/monthly-records`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          recordMonth: 10,
          recordYear: 2026,
          notes: 'Duplicate attempt',
          overwrite: false
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('RECORD_EXISTS');
    });

    test('TC-PH12-03: Overwrite existing month/year snapshot when overwrite is true', async () => {
      const res = await request(app)
        .post(`/api/households/${householdAId}/monthly-records`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          recordMonth: 10,
          recordYear: 2026,
          notes: 'Updated note after review',
          overwrite: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes).toBe('Updated note after review');
    });

    test('TC-PH12-04: Reject snapshot for a future month/year', async () => {
      const res = await request(app)
        .post(`/api/households/${householdAId}/monthly-records`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          recordMonth: 12,
          recordYear: 2099,
          notes: 'Far future snapshot',
          overwrite: false
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PERIOD');
    });

    test('TC-PH12-05: Critical Immutability Test — Modifying active household does NOT alter historical snapshot', async () => {
      // 1. Update current household income and expenses
      const updateRes = await request(app)
        .put(`/api/households/${householdAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'Household Alpha Updated',
          location: 'Mumbai',
          totalMembers: 4,
          earningMembers: 2,
          dependentMembers: 2,
          childrenCount: 1,
          elderlyCount: 0,
          monthlyIncome: 120000
        });

      expect(updateRes.status).toBe(200);

      await request(app)
        .post(`/api/households/${householdAId}/expenses`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          category: 'ENTERTAINMENT',
          amount: 20000,
          isEssential: false,
          description: 'Vacation'
        });

      // 2. Fetch current analytics (Income should now be 120,000)
      const currentAnalytics = await request(app)
        .get(`/api/households/${householdAId}/analytics`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(Number(currentAnalytics.body.data.financials.monthlyIncome)).toBe(120000);

      // 3. Fetch historical snapshot (Must STILL display original 80,000 income!)
      const snapshotRes = await request(app)
        .get(`/api/households/${householdAId}/monthly-records/${snapshotRecordId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(snapshotRes.status).toBe(200);
      expect(Number(snapshotRes.body.data.monthlyIncome)).toBe(80000);
      expect(Number(snapshotRes.body.data.totalExpenses)).toBe(45000);
      expect(Number(snapshotRes.body.data.monthlySavings)).toBe(35000);
    });
  });

  /* ----------------------------------------------------
   * 2. REPORT GENERATION & PDF STREAMING
   * ---------------------------------------------------- */
  describe('2. Report Generation & PDF Streaming', () => {
    test('TC-PH12-06: Generate CURRENT live report record', async () => {
      const res = await request(app)
        .post(`/api/households/${householdAId}/reports`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          reportType: 'CURRENT'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportType).toBe('CURRENT');
      expect(res.body.data.householdId).toBe(householdAId);

      reportId = res.body.data.id;
    });

    test('TC-PH12-07: Generate MONTHLY historical report record', async () => {
      const res = await request(app)
        .post(`/api/households/${householdAId}/reports`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          reportType: 'MONTHLY',
          monthlyRecordId: snapshotRecordId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportType).toBe('MONTHLY');
      expect(res.body.data.monthlyRecordId).toBe(snapshotRecordId);
    });

    test('TC-PH12-08: Download generated report as valid PDF binary stream', async () => {
      const res = await request(app)
        .get(`/api/reports/${reportId}/download`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain(`Household_Report_${reportId}.pdf`);
      expect(Buffer.isBuffer(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(500); // Valid PDF header & binary payload
    });
  });

  /* ----------------------------------------------------
   * 3. SECURITY & CROSS-USER ISOLATION TESTS
   * ---------------------------------------------------- */
  describe('3. Security & Cross-User Isolation', () => {
    test('TC-PH12-09: User B cannot access User A monthly records (returns 404)', async () => {
      const res = await request(app)
        .get(`/api/households/${householdAId}/monthly-records`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    test('TC-PH12-10: User B cannot download User A report PDF (returns 404)', async () => {
      const res = await request(app)
        .get(`/api/reports/${reportId}/download`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REPORT_NOT_FOUND');
    });
  });
});
