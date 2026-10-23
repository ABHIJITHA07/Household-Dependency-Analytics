import request from 'supertest';
import app from '../src/app.js';
import env from '../src/config/env.js';
import db from '../src/config/db.js';
import { validate } from '../src/middleware/validate.middleware.js';
import { z } from 'zod';

describe('Phase 3: Backend Foundation Test Suite', () => {

  afterAll(async () => {
    // Close database pool connections cleanly after test execution
    await db.end();
  });

  // Test 1: Server Startup & App Instantiation
  test('TC-P3-01: Express application should instantiate cleanly', () => {
    expect(app).toBeDefined();
  });

  // Test 2: Environment Validation
  test('TC-P3-02: Environment configuration should load expected defaults', () => {
    expect(env.port).toBeDefined();
    expect(env.jwt.secret).toBeDefined();
    expect(env.db.database).toBe('household_dependency');
  });

  // Test 3: MySQL Connection Pool Health
  test('TC-P3-03: MySQL database pool should ping database successfully', async () => {
    const [rows] = await db.query('SELECT 1 AS alive');
    expect(rows).toBeDefined();
    expect(rows[0].alive).toBe(1);
  });

  // Test 4: Health Endpoint GET /api/health
  test('TC-P3-04: GET /api/health should return 200 OK with standard status wrapper', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.services.backend).toBe('UP');
    expect(res.body.data.services.database).toBe('UP');
  });

  // Test 5: Root Route GET /
  test('TC-P3-05: GET / root fallback route should respond', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ACTIVE');
  });

  // Test 6: Unknown Route Handling (404 NOT_FOUND)
  test('TC-P3-06: Requesting undefined route should return standard 404 NOT_FOUND error', async () => {
    const res = await request(app).get('/api/non-existent-route');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Cannot GET /api/non-existent-route',
        details: []
      }
    });
  });

  // Test 7: Zod Validation Middleware Formatting
  test('TC-P3-07: Validation middleware should format Zod errors into standard error structure', async () => {
    const res = await request(app)
      .post('/api/test-validate')
      .send({ income: -500 });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual([
      { field: 'income', message: 'Income must be >= 0' }
    ]);
  });

  // Test 8: Security & Helmet Headers
  test('TC-P3-08: Responses should include security headers from Helmet', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
  });

  // Test 9: Standard Success Format Assertion
  test('TC-P3-09: Success responses must match { success: true, data: ... } format', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.error).toBeUndefined();
  });

  // Test 10: Standard Error Format Assertion
  test('TC-P3-10: Error responses must match { success: false, error: { code, message, details } } format', async () => {
    const res = await request(app).get('/api/undefined-endpoint-test');
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(typeof res.body.error.code).toBe('string');
    expect(typeof res.body.error.message).toBe('string');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

});
