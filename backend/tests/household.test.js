import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';

describe('Phase 5: Household CRUD & Ownership Isolation Test Suite', () => {

  let user1Token = '';
  let user1Id = null;

  let user2Token = '';
  let user2Id = null;

  let user1HouseholdId = null;
  let user2HouseholdId = null;

  beforeAll(async () => {
    // Register User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: `user1_hh_${Date.now()}@example.com`,
        password: 'Password123!'
      });
    user1Id = res1.body.data.user.id;
    user1Token = res1.body.data.token;

    // Register User 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: `user2_hh_${Date.now()}@example.com`,
        password: 'Password123!'
      });
    user2Id = res2.body.data.user.id;
    user2Token = res2.body.data.token;
  });

  afterAll(async () => {
    // Cleanup test users (cascades and deletes test households)
    if (user1Id) await db.query('DELETE FROM users WHERE id = ?', [user1Id]);
    if (user2Id) await db.query('DELETE FROM users WHERE id = ?', [user2Id]);
    await db.end();
  });

  // TC-HH-01: Authenticated User 1 Creates Household
  test('TC-HH-01: Authenticated User 1 can create household with valid fields', async () => {
    const payload = {
      name: 'User 1 Household',
      location: 'Mumbai',
      totalMembers: 5,
      earningMembers: 2,
      dependentMembers: 3,
      childrenCount: 1,
      elderlyCount: 1,
      monthlyIncome: 100000.00
    };

    const res = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user1Token}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.userId).toBe(user1Id);
    expect(res.body.data.monthlyIncome).toBe(100000);

    user1HouseholdId = res.body.data.id;
  });

  // TC-HH-02: Unauthenticated User Cannot Create Household
  test('TC-HH-02: Unauthenticated request to POST /api/households should return 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/households')
      .send({
        name: 'Unauth Household',
        totalMembers: 4,
        earningMembers: 2,
        dependentMembers: 2,
        childrenCount: 1,
        elderlyCount: 0,
        monthlyIncome: 50000
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NO_TOKEN_PROVIDED');
  });

  // TC-HH-03: Invalid Household Data Rejected
  test('TC-HH-03: Request with short name or empty fields should be rejected (422 VALIDATION_ERROR)', async () => {
    const res = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'A', // Too short
        totalMembers: 0,
        earningMembers: 0,
        dependentMembers: 0,
        childrenCount: 0,
        elderlyCount: 0,
        monthlyIncome: 50000
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // TC-HH-04: Negative Income Rejected
  test('TC-HH-04: Negative monthly income must be rejected by backend validation', async () => {
    const res = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Valid Name',
        totalMembers: 4,
        earningMembers: 2,
        dependentMembers: 2,
        childrenCount: 1,
        elderlyCount: 0,
        monthlyIncome: -5000
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.some(d => d.field === 'monthlyIncome')).toBe(true);
  });

  // TC-HH-05: Zero Total Members Rejected
  test('TC-HH-05: Zero total members must be rejected', async () => {
    const res = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Zero Member Household',
        totalMembers: 0,
        earningMembers: 0,
        dependentMembers: 0,
        childrenCount: 0,
        elderlyCount: 0,
        monthlyIncome: 10000
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // TC-HH-06: Earning + Dependent Exceeds Total Members Rejected
  test('TC-HH-06: Sum of earning and dependent members exceeding total members must be rejected', async () => {
    const res = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Invalid Sum Household',
        totalMembers: 4,
        earningMembers: 3,
        dependentMembers: 3, // 3 + 3 = 6 > 4
        childrenCount: 1,
        elderlyCount: 0,
        monthlyIncome: 60000
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Setup User 2 Household
  test('Setup: Create User 2 Household for Ownership Isolation Tests', async () => {
    const res = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        name: 'User 2 Household',
        location: 'Delhi',
        totalMembers: 3,
        earningMembers: 1,
        dependentMembers: 2,
        childrenCount: 1,
        elderlyCount: 0,
        monthlyIncome: 75000
      });

    expect(res.statusCode).toBe(201);
    user2HouseholdId = res.body.data.id;
  });

  // TC-HH-07: User Lists Only Their Households
  test('TC-HH-07: User 1 GET /api/households should return ONLY User 1 households', async () => {
    const res = await request(app)
      .get('/api/households')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.every(h => h.userId === user1Id)).toBe(true);
    expect(res.body.data.some(h => h.id === user2HouseholdId)).toBe(false);
  });

  // TC-HH-08: User 1 Can Retrieve Their Own Household
  test('TC-HH-08: User 1 should retrieve their own household by ID', async () => {
    const res = await request(app)
      .get(`/api/households/${user1HouseholdId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(user1HouseholdId);
  });

  // TC-HH-09: User 1 CANNOT Retrieve User 2 Household (Ownership Isolation - 404 NOT_FOUND)
  test('TC-HH-09: User 1 attempting to GET User 2 household MUST return 404 NOT_FOUND', async () => {
    const res = await request(app)
      .get(`/api/households/${user2HouseholdId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Requested resource was not found');
  });

  // TC-HH-10: User 1 Can Update Their Household
  test('TC-HH-10: User 1 should update their own household', async () => {
    const res = await request(app)
      .put(`/api/households/${user1HouseholdId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'User 1 Updated Household',
        location: 'Pune',
        totalMembers: 5,
        earningMembers: 2,
        dependentMembers: 3,
        childrenCount: 2,
        elderlyCount: 1,
        monthlyIncome: 120000
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('User 1 Updated Household');
    expect(res.body.data.location).toBe('Pune');
    expect(res.body.data.monthlyIncome).toBe(120000);
  });

  // TC-HH-11: User 1 CANNOT Update User 2 Household (Ownership Isolation - 404 NOT_FOUND)
  test('TC-HH-11: User 1 attempting to PUT User 2 household MUST return 404 NOT_FOUND', async () => {
    const res = await request(app)
      .put(`/api/households/${user2HouseholdId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Hacked Household Name',
        totalMembers: 3,
        earningMembers: 1,
        dependentMembers: 2,
        childrenCount: 1,
        elderlyCount: 0,
        monthlyIncome: 75000
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  // TC-HH-12 & TC-HH-13: Delete Behavior & Ownership Isolation
  test('TC-HH-13: User 1 attempting to DELETE User 2 household MUST return 404 NOT_FOUND', async () => {
    const res = await request(app)
      .delete(`/api/households/${user2HouseholdId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('TC-HH-12: User 2 can delete their own household', async () => {
    const res = await request(app)
      .delete(`/api/households/${user2HouseholdId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // TC-HH-14: Household Data Persists Correctly in MySQL
  test('TC-HH-14: Created household should persist in MySQL database', async () => {
    const [rows] = await db.query('SELECT * FROM households WHERE id = ?', [user1HouseholdId]);
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('User 1 Updated Household');
    expect(rows[0].user_id).toBe(user1Id);
  });

  // TC-HH-15: Repository Ownership Isolation Enforcement
  test('TC-HH-15: Direct repository query scoped by user_id should enforce isolation', async () => {
    const [rows] = await db.query(
      'SELECT * FROM households WHERE id = ? AND user_id = ?',
      [user1HouseholdId, user2Id]
    );
    expect(rows.length).toBe(0);
  });

  // TC-HH-16: Standard Success Response Format Preserved
  test('TC-HH-16: Household API response format must match standard success wrapper', async () => {
    const res = await request(app)
      .get('/api/households')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
  });

  // TC-HH-17: Standard Validation Error Format Preserved
  test('TC-HH-17: Household validation error format must match standard error wrapper', async () => {
    const res = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ monthlyIncome: -100 });

    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  // TC-HH-18: Edge Case Values (0 Earners, 0 Dependents, 0 Income) Validated
  test('TC-HH-18: Edge case combinations (0 earning members, 0 income) should be accepted when valid', async () => {
    const res = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Zero Earner Household',
        location: 'Chennai',
        totalMembers: 3,
        earningMembers: 0,
        dependentMembers: 3,
        childrenCount: 2,
        elderlyCount: 1,
        monthlyIncome: 0 // Zero income valid
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.earningMembers).toBe(0);
    expect(res.body.data.monthlyIncome).toBe(0);
  });

});
