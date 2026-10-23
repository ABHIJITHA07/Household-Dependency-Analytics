import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';
import {
  calculateDependencyRatio,
  classifyDependencyLevel,
  calculateSavings,
  calculateSavingsRate,
  calculateExpenseRatio,
  calculateEssentialPercentage,
  calculateNonEssentialPercentage,
  classifyFinancialCondition,
  calculateCanonicalInputHash,
  computeAnalytics
} from '../src/utils/analytics.engine.js';

describe('Phase 7: Pure Deterministic Analytics Engine Test Suite', () => {
  let user1Token, user1Id, user1HouseholdId;
  let user2Token, user2Id, user2HouseholdId;

  beforeAll(async () => {
    // Clean database tables for predictable testing
    await db.query('DELETE FROM expenses');
    await db.query('DELETE FROM households');
    await db.query('DELETE FROM users');

    // Register User 1
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'Analytics Owner',
      email: 'analytics_owner@example.com',
      password: 'Password123!'
    });
    user1Token = res1.body.data.token;
    user1Id = res1.body.data.user.id;

    // Create Household for User 1 (Total 5, Earning 2, Dependent 3, Income 50000)
    const hhRes1 = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Analytics Household 1',
        totalMembers: 5,
        earningMembers: 2,
        dependentMembers: 3,
        childrenCount: 1,
        elderlyCount: 1,
        monthlyIncome: 50000.00
      });
    user1HouseholdId = hhRes1.body.data.id;

    // Register User 2 for Security Isolation Test
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Analytics Other',
      email: 'analytics_other@example.com',
      password: 'Password123!'
    });
    user2Token = res2.body.data.token;
    user2Id = res2.body.data.user.id;

    // Create Household for User 2
    const hhRes2 = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        name: 'Analytics Household 2',
        totalMembers: 3,
        earningMembers: 1,
        dependentMembers: 2,
        childrenCount: 1,
        elderlyCount: 0,
        monthlyIncome: 30000.00
      });
    user2HouseholdId = hhRes2.body.data.id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM expenses');
    await db.query('DELETE FROM households');
    await db.query('DELETE FROM users');
    await db.end();
  });

  // ==========================================
  // PURE UNIT TESTS (Engine Functions)
  // ==========================================

  describe('Pure Function Unit Tests', () => {
    test('TC-AN-01: Dependency ratio basic calculation', () => {
      const ratio = calculateDependencyRatio(3, 2);
      expect(ratio).toBe(150.00);
    });

    test('TC-AN-02: Dependency ratio LOW classification (< 50%)', () => {
      const ratio = calculateDependencyRatio(1, 3); // 33.33%
      const level = classifyDependencyLevel(ratio, 3);
      expect(ratio).toBe(33.33);
      expect(level).toBe('LOW');
    });

    test('TC-AN-03: Dependency ratio MEDIUM classification (50% - 100%)', () => {
      const ratio = calculateDependencyRatio(2, 2); // 100.00%
      const level = classifyDependencyLevel(ratio, 2);
      expect(ratio).toBe(100.00);
      expect(level).toBe('MEDIUM');
    });

    test('TC-AN-04: Dependency ratio HIGH classification (> 100%)', () => {
      const ratio = calculateDependencyRatio(3, 2); // 150.00%
      const level = classifyDependencyLevel(ratio, 2);
      expect(ratio).toBe(150.00);
      expect(level).toBe('HIGH');
    });

    test('TC-AN-05: Zero earning members edge case', () => {
      const ratio = calculateDependencyRatio(3, 0);
      const level = classifyDependencyLevel(ratio, 0);
      expect(ratio).toBeNull();
      expect(level).toBe('HIGH');
    });

    test('TC-AN-06: Dependency ratio boundary at 50%', () => {
      const ratio = calculateDependencyRatio(1, 2); // 50.00%
      const level = classifyDependencyLevel(ratio, 2);
      expect(ratio).toBe(50.00);
      expect(level).toBe('MEDIUM');
    });

    test('TC-AN-07: Dependency ratio boundary at 100%', () => {
      const ratio = calculateDependencyRatio(2, 2); // 100.00%
      const level = classifyDependencyLevel(ratio, 2);
      expect(ratio).toBe(100.00);
      expect(level).toBe('MEDIUM');
    });

    test('TC-AN-08: Savings calculation', () => {
      const savings = calculateSavings(50000, 30000);
      expect(savings).toBe(20000.00);
    });

    test('TC-AN-09: Savings rate calculation', () => {
      const rate = calculateSavingsRate(20000, 50000);
      expect(rate).toBe(40.00);
    });

    test('TC-AN-10: Expense ratio calculation', () => {
      const ratio = calculateExpenseRatio(30000, 50000);
      expect(ratio).toBe(60.00);
    });

    test('TC-AN-11: Essential expense total & percentage', () => {
      const pct = calculateEssentialPercentage(25000, 30000);
      expect(pct).toBe(83.33);
    });

    test('TC-AN-12: Non-essential expense total & percentage', () => {
      const pct = calculateNonEssentialPercentage(5000, 30000);
      expect(pct).toBe(16.67);
    });

    test('TC-AN-13: Essential/non-essential percentage sum equals 100%', () => {
      const essentialPct = calculateEssentialPercentage(25000, 30000);
      const nonEssentialPct = calculateNonEssentialPercentage(5000, 30000);
      expect(Number((essentialPct + nonEssentialPct).toFixed(2))).toBe(100.00);
    });

    test('TC-AN-14: Zero income case', () => {
      const savings = calculateSavings(0, 5000);
      const savingsRate = calculateSavingsRate(savings, 0);
      const expenseRatio = calculateExpenseRatio(5000, 0);
      const condition = classifyFinancialCondition(0, savings, savingsRate);

      expect(savings).toBe(-5000.00);
      expect(savingsRate).toBeNull();
      expect(expenseRatio).toBeNull();
      expect(condition).toBe('NO_INCOME');
    });

    test('TC-AN-15: Zero income with zero expenses', () => {
      const savings = calculateSavings(0, 0);
      const savingsRate = calculateSavingsRate(savings, 0);
      const expenseRatio = calculateExpenseRatio(0, 0);
      const condition = classifyFinancialCondition(0, savings, savingsRate);

      expect(savings).toBe(0.00);
      expect(savingsRate).toBeNull();
      expect(expenseRatio).toBeNull();
      expect(condition).toBe('NO_INCOME');
    });

    test('TC-AN-16: Income lower than expenses (DEFICIT)', () => {
      const savings = calculateSavings(40000, 50000); // -10000
      const savingsRate = calculateSavingsRate(savings, 40000); // -25.00%
      const condition = classifyFinancialCondition(40000, savings, savingsRate);

      expect(savings).toBe(-10000.00);
      expect(savingsRate).toBe(-25.00);
      expect(condition).toBe('DEFICIT');
    });

    test('TC-AN-17: Income equal to expenses (TIGHT condition)', () => {
      const savings = calculateSavings(50000, 50000); // 0
      const savingsRate = calculateSavingsRate(savings, 50000); // 0.00%
      const condition = classifyFinancialCondition(50000, savings, savingsRate);

      expect(savings).toBe(0.00);
      expect(savingsRate).toBe(0.00);
      expect(condition).toBe('TIGHT');
    });

    test('TC-AN-18: Positive savings (HEALTHY condition)', () => {
      const savings = calculateSavings(100000, 40000); // 60000
      const savingsRate = calculateSavingsRate(savings, 100000); // 60.00%
      const condition = classifyFinancialCondition(100000, savings, savingsRate);

      expect(savings).toBe(60000.00);
      expect(savingsRate).toBe(60.00);
      expect(condition).toBe('HEALTHY');
    });

    test('TC-AN-19: Empty expense list behavior', () => {
      const result = computeAnalytics(
        { id: 1, total_members: 4, earning_members: 2, dependent_members: 2, children_count: 1, elderly_count: 0, monthly_income: 50000.00 },
        { totalExpenses: 0, essentialExpenses: 0, nonEssentialExpenses: 0 },
        []
      );

      expect(result.financials.totalExpenses).toBe(0.00);
      expect(result.financials.savings).toBe(50000.00);
      expect(result.financials.savingsRate).toBe(100.00);
      expect(result.financials.essentialPercentage).toBe(0.00);
      expect(result.financials.nonEssentialPercentage).toBe(0.00);
      expect(result.financials.financialCondition).toBe('HEALTHY');
    });

    test('TC-AN-24: Verify no NaN or Infinity values in analytics output', () => {
      const result = computeAnalytics(
        { id: 1, totalMembers: 0, earningMembers: 0, dependentMembers: 0, childrenCount: 0, elderlyCount: 0, monthlyIncome: 0 },
        { totalExpenses: 0, essentialExpenses: 0, nonEssentialExpenses: 0 },
        []
      );

      expect(Object.values(result.financials)).not.toContain(NaN);
      expect(Object.values(result.financials)).not.toContain(Infinity);
      expect(Object.values(result.financials)).not.toContain(-Infinity);
      expect(result.dependencyRatio).toBeNull();
      expect(result.financials.savingsRate).toBeNull();
      expect(result.financials.expenseRatio).toBeNull();
    });

    test('TC-AN-25: Money rounding follows 2-decimal specification', () => {
      const savings = calculateSavings(100000.555, 40000.123);
      expect(savings).toBe(60000.43);
    });

    test('TC-AN-26: SHA-256 canonical input hash is deterministic', () => {
      const household = { totalMembers: 5, earningMembers: 2, dependentMembers: 3, childrenCount: 1, elderlyCount: 1, monthlyIncome: 50000 };
      const financials = { totalExpenses: 30000, essentialExpenses: 25000, nonEssentialExpenses: 5000 };
      const categories = [{ category: 'HOUSING', total: 20000 }, { category: 'FOOD', total: 10000 }];

      const hash1 = calculateCanonicalInputHash(household, financials, categories);
      const hash2 = calculateCanonicalInputHash(household, financials, categories);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBe(64); // 64 hex characters for SHA-256
    });
  });

  // ==========================================
  // INTEGRATION TESTS (API & Ownership)
  // ==========================================

  describe('Integration & End-to-End API Tests', () => {
    test('TC-AN-20: Authenticated household owner can fetch analytics', async () => {
      // Add expenses to User 1 household using valid ExpenseCategory enum values
      const exp1 = await request(app)
        .post(`/api/households/${user1HouseholdId}/expenses`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ category: 'HOUSING', amount: 20000, isEssential: true });
      expect(exp1.statusCode).toBe(201);

      const exp2 = await request(app)
        .post(`/api/households/${user1HouseholdId}/expenses`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ category: 'FOOD', amount: 5000, isEssential: true });
      expect(exp2.statusCode).toBe(201);

      const exp3 = await request(app)
        .post(`/api/households/${user1HouseholdId}/expenses`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ category: 'ENTERTAINMENT', amount: 5000, isEssential: false });
      expect(exp3.statusCode).toBe(201);

      const res = await request(app)
        .get(`/api/households/${user1HouseholdId}/analytics`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data.householdId).toBe(user1HouseholdId);

      // Manual mathematical verification assertions
      expect(data.demographics).toEqual({
        totalMembers: 5,
        earningMembers: 2,
        dependentMembers: 3,
        childrenCount: 1,
        elderlyCount: 1
      });
      expect(data.dependencyRatio).toBe(150.00);
      expect(data.dependencyLevel).toBe('HIGH');
      expect(data.financials.monthlyIncome).toBe(50000.00);
      expect(data.financials.totalExpenses).toBe(30000.00);
      expect(data.financials.essentialExpenses).toBe(25000.00);
      expect(data.financials.nonEssentialExpenses).toBe(5000.00);
      expect(data.financials.savings).toBe(20000.00);
      expect(data.financials.savingsRate).toBe(40.00);
      expect(data.financials.expenseRatio).toBe(60.00);
      expect(data.financials.essentialPercentage).toBe(83.33);
      expect(data.financials.nonEssentialPercentage).toBe(16.67);
      expect(data.financials.financialCondition).toBe('HEALTHY');
      expect(data.explanations.dependencyText).toContain('150.00%');
      expect(data.explanations.financialText).toContain('Healthy savings rate');
      expect(typeof data.inputHash).toBe('string');
    });

    test('TC-AN-21: User cannot access analytics for another user household', async () => {
      const res = await request(app)
        .get(`/api/households/${user1HouseholdId}/analytics`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    test('TC-AN-22: Backend analytics ignore any frontend attempt to supply fake totals', async () => {
      const res = await request(app)
        .get(`/api/households/${user1HouseholdId}/analytics`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ totalExpenses: 999999, savings: -999999 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.financials.totalExpenses).toBe(30000.00);
      expect(res.body.data.financials.savings).toBe(20000.00);
    });

    test('TC-AN-23: Analytics response matches approved JSON schema', async () => {
      const res = await request(app)
        .get(`/api/households/${user1HouseholdId}/analytics`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      const data = res.body.data;
      expect(data).toHaveProperty('householdId');
      expect(data).toHaveProperty('demographics');
      expect(data).toHaveProperty('dependencyRatio');
      expect(data).toHaveProperty('dependencyLevel');
      expect(data).toHaveProperty('financials');
      expect(data.financials).toHaveProperty('monthlyIncome');
      expect(data.financials).toHaveProperty('totalExpenses');
      expect(data.financials).toHaveProperty('essentialExpenses');
      expect(data.financials).toHaveProperty('nonEssentialExpenses');
      expect(data.financials).toHaveProperty('savings');
      expect(data.financials).toHaveProperty('savingsRate');
      expect(data.financials).toHaveProperty('expenseRatio');
      expect(data.financials).toHaveProperty('essentialPercentage');
      expect(data.financials).toHaveProperty('nonEssentialPercentage');
      expect(data.financials).toHaveProperty('financialCondition');
      expect(data).toHaveProperty('explanations');
      expect(data).toHaveProperty('inputHash');
    });
  });
});
