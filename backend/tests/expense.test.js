import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';

describe('Phase 6: Expense CRUD & Automatic Recalculation Test Suite', () => {

  let user1Token = '';
  let user1Id = null;
  let user1HouseholdId = null;

  let user2Token = '';
  let user2Id = null;
  let user2HouseholdId = null;

  let testExpense1Id = null;
  let testExpense2Id = null;
  let user2ExpenseId = null;

  beforeAll(async () => {
    // Register User 1 & create Household 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Expense User One',
        email: `exp_user1_${Date.now()}@example.com`,
        password: 'Password123!'
      });
    user1Id = res1.body.data.user.id;
    user1Token = res1.body.data.token;

    const hh1 = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Household One Expenses',
        totalMembers: 4,
        earningMembers: 2,
        dependentMembers: 2,
        childrenCount: 1,
        elderlyCount: 0,
        monthlyIncome: 100000
      });
    user1HouseholdId = hh1.body.data.id;

    // Register User 2 & create Household 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Expense User Two',
        email: `exp_user2_${Date.now()}@example.com`,
        password: 'Password123!'
      });
    user2Id = res2.body.data.user.id;
    user2Token = res2.body.data.token;

    const hh2 = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        name: 'Household Two Expenses',
        totalMembers: 3,
        earningMembers: 1,
        dependentMembers: 2,
        childrenCount: 1,
        elderlyCount: 0,
        monthlyIncome: 60000
      });
    user2HouseholdId = hh2.body.data.id;
  });

  afterAll(async () => {
    // Cleanup test users (cascades and deletes households and expenses)
    if (user1Id) await db.query('DELETE FROM users WHERE id = ?', [user1Id]);
    if (user2Id) await db.query('DELETE FROM users WHERE id = ?', [user2Id]);
    await db.end();
  });

  // TC-EXP-21: Empty Household Expense List Returns Valid Empty Response
  test('TC-EXP-21: Empty household expense list returns valid empty response with 0 totals', async () => {
    const res = await request(app)
      .get(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.totals).toEqual({
      totalExpenses: 0,
      essentialExpenses: 0,
      nonEssentialExpenses: 0
    });
  });

  // TC-EXP-01 & TC-EXP-16: Authenticated Owner Creates Essential Expense
  test('TC-EXP-01: Authenticated owner can create an essential expense item', async () => {
    const res = await request(app)
      .post(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'HOUSING',
        amount: 25000.00,
        isEssential: true,
        description: 'Monthly Apartment Rent'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense).toHaveProperty('id');
    expect(res.body.data.expense.category).toBe('HOUSING');
    expect(res.body.data.expense.amount).toBe(25000);
    expect(res.body.data.expense.isEssential).toBe(true);
    expect(res.body.data.totals).toEqual({
      totalExpenses: 25000,
      essentialExpenses: 25000,
      nonEssentialExpenses: 0
    });

    testExpense1Id = res.body.data.expense.id;
  });

  // TC-EXP-17: Authenticated Owner Adds Non-Essential Expense & Verifies Recalculated Totals
  test('TC-EXP-17: Adding non-essential expense recalculates essential and non-essential totals correctly', async () => {
    const res = await request(app)
      .post(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'ENTERTAINMENT',
        amount: 5000.00,
        isEssential: false,
        description: 'Streaming Subscriptions'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense.isEssential).toBe(false);
    expect(res.body.data.totals).toEqual({
      totalExpenses: 30000,
      essentialExpenses: 25000,
      nonEssentialExpenses: 5000
    });

    testExpense2Id = res.body.data.expense.id;
  });

  // TC-EXP-02: Unauthenticated User Cannot Create Expense
  test('TC-EXP-02: Unauthenticated user cannot create an expense (401 Unauthorized)', async () => {
    const res = await request(app)
      .post(`/api/households/${user1HouseholdId}/expenses`)
      .send({
        category: 'FOOD',
        amount: 10000,
        isEssential: true
      });

    expect(res.statusCode).toBe(401);
  });

  // TC-EXP-03 & TC-EXP-04: Negative Amount Rejected
  test('TC-EXP-04: Negative expense amount is rejected with 422 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'FOOD',
        amount: -1500,
        isEssential: true
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.some(d => d.field === 'amount')).toBe(true);
  });

  // TC-EXP-05: Invalid Category Rejected
  test('TC-EXP-05: Invalid category string is rejected with 422 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'INVALID_CATEGORY_NAME',
        amount: 2000,
        isEssential: true
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // TC-EXP-06: Invalid essential value type
  test('TC-EXP-06: Non-boolean essential flag is rejected', async () => {
    const res = await request(app)
      .post(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'FOOD',
        amount: 2000,
        isEssential: 'not-a-boolean'
      });

    expect(res.statusCode).toBe(422);
  });

  // TC-EXP-20: Zero-value expense accepted
  test('TC-EXP-20: Zero-value expense (amount = 0) is accepted per specification', async () => {
    const res = await request(app)
      .post(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'OTHER',
        amount: 0,
        isEssential: true,
        description: 'Waived Fee'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.expense.amount).toBe(0);
  });

  // TC-EXP-07: Owner Lists Household Expenses
  test('TC-EXP-07: Owner can list household expenses with authoritative totals summary', async () => {
    const res = await request(app)
      .get(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(3);
    expect(res.body.data.totals).toEqual({
      totalExpenses: 30000,
      essentialExpenses: 25000,
      nonEssentialExpenses: 5000
    });
  });

  // TC-EXP-19 & TC-EXP-08: Owner Updates Expense & Totals Recalculate
  test('TC-EXP-19: Updating an expense causes totals to be recalculated correctly', async () => {
    const res = await request(app)
      .put(`/api/expenses/${testExpense2Id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'ENTERTAINMENT',
        amount: 8000.00, // Updated from 5000 to 8000
        isEssential: false,
        description: 'Upgraded Streaming Package'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense.amount).toBe(8000);
    expect(res.body.data.totals).toEqual({
      totalExpenses: 33000,
      essentialExpenses: 25000,
      nonEssentialExpenses: 8000
    });
  });

  // TC-EXP-18 & TC-EXP-09: Owner Deletes Expense & Totals Recalculate
  test('TC-EXP-18: Deleting an expense causes totals to be recalculated correctly', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${testExpense2Id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totals).toEqual({
      totalExpenses: 25000,
      essentialExpenses: 25000,
      nonEssentialExpenses: 0
    });
  });

  // Setup User 2 Expense for Indirect Ownership Security Tests
  test('Setup: Create User 2 Expense Item', async () => {
    const res = await request(app)
      .post(`/api/households/${user2HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        category: 'HEALTHCARE',
        amount: 4000,
        isEssential: true,
        description: 'User 2 Medicines'
      });

    expect(res.statusCode).toBe(201);
    user2ExpenseId = res.body.data.expense.id;
  });

  // SECURITY TESTS (TC-EXP-10 to TC-EXP-13: Two-User Authorization Verification)

  // TC-EXP-10: User 1 Cannot Access User 2 Household Expenses
  test('TC-EXP-10: User 1 attempting GET User 2 household expenses MUST return 404 NOT_FOUND', async () => {
    const res = await request(app)
      .get(`/api/households/${user2HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  // TC-EXP-11: User 1 Cannot Add Expense to User 2 Household
  test('TC-EXP-11: User 1 attempting POST expense to User 2 household MUST return 404 NOT_FOUND', async () => {
    const res = await request(app)
      .post(`/api/households/${user2HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'FOOD',
        amount: 3000,
        isEssential: true
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  // TC-EXP-12: User 1 Cannot Update User 2 Expense Item
  test('TC-EXP-12: User 1 attempting PUT User 2 expense item MUST return 404 NOT_FOUND', async () => {
    const res = await request(app)
      .put(`/api/expenses/${user2ExpenseId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'FOOD',
        amount: 9999,
        isEssential: true
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  // TC-EXP-13: User 1 Cannot Delete User 2 Expense Item
  test('TC-EXP-13: User 1 attempting DELETE User 2 expense item MUST return 404 NOT_FOUND', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${user2ExpenseId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  // TC-EXP-14 & TC-EXP-15: Database Persistence & Total Match
  test('TC-EXP-14: Expense item persists correctly in MySQL expenses table', async () => {
    const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [testExpense1Id]);
    expect(rows.length).toBe(1);
    expect(rows[0].category).toBe('HOUSING');
    expect(rows[0].amount).toBe(25000);
  });

  // TC-EXP-22 & TC-EXP-23: Standard Success & Validation Error Wrappers
  test('TC-EXP-22: Expense API standard success response wrapper structure', async () => {
    const res = await request(app)
      .get(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
  });

  test('TC-EXP-23: Expense API standard validation error response wrapper structure', async () => {
    const res = await request(app)
      .post(`/api/households/${user1HouseholdId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ amount: -50 });

    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

});
