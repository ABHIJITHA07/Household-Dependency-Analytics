import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import env from '../src/config/env.js';
import db from '../src/config/db.js';
import { UserRepository } from '../src/repositories/user.repository.js';

describe('Phase 4: Authentication Module Test Suite', () => {

  const testUser = {
    name: 'Auth Test User',
    email: `authtest_${Date.now()}@example.com`,
    password: 'SecurePassword123!'
  };

  let authToken = '';
  let userId = null;

  afterAll(async () => {
    // Cleanup test user from database
    if (userId) {
      await db.query('DELETE FROM users WHERE id = ?', [userId]);
    }
    await db.end();
  });

  // TC-AUTH-01: Successful Registration
  test('TC-AUTH-01: Should register a new user successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.token).toBeDefined();

    userId = res.body.data.user.id;
    authToken = res.body.data.token;
  });

  // TC-AUTH-02: Duplicate Email Registration
  test('TC-AUTH-02: Should reject registration with duplicate email address (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  // TC-AUTH-03: Invalid Registration Data
  test('TC-AUTH-03: Should reject registration payload with short password or invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'invalid-email-format',
        password: '123'
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  // TC-AUTH-04: Password Stored Hashed in DB, Never Plaintext
  test('TC-AUTH-04: Password must be stored as bcrypt hash in DB and never plaintext', async () => {
    const dbUser = await UserRepository.findByEmail(testUser.email);
    expect(dbUser).not.toBeNull();
    expect(dbUser.password_hash).not.toBe(testUser.password);
    expect(dbUser.password_hash).toMatch(/^\$2[ayb]\$/); // Valid bcrypt hash prefix
  });

  // TC-AUTH-05: Successful Login
  test('TC-AUTH-05: Should authenticate valid credentials and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.token).toBeDefined();
  });

  // TC-AUTH-06: Incorrect Password
  test('TC-AUTH-06: Should reject login attempt with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  // TC-AUTH-07: Unknown Email / Generic Error
  test('TC-AUTH-07: Should reject login for non-existent email with generic error message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent_user_9999@example.com',
        password: 'SomePassword123!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.error.message).toBe('Invalid email or password');
  });

  // TC-AUTH-08: Valid JWT Accepted on Protected Route
  test('TC-AUTH-08: Protected GET /api/auth/me should return user profile when valid Bearer token provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(userId);
    expect(res.body.data.email).toBe(testUser.email.toLowerCase());
  });

  // TC-AUTH-09: Missing JWT Rejected
  test('TC-AUTH-09: Protected endpoint should reject request missing Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NO_TOKEN_PROVIDED');
  });

  // TC-AUTH-10: Malformed JWT Rejected
  test('TC-AUTH-10: Protected endpoint should reject malformed Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_malformed_token_string');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  // TC-AUTH-11: Expired JWT Rejected
  test('TC-AUTH-11: Protected endpoint should reject expired JWT token', async () => {
    // Generate an expired JWT token
    const expiredToken = jwt.sign(
      { userId, email: testUser.email },
      env.jwt.secret,
      { expiresIn: '-1s', algorithm: 'HS256' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  // TC-AUTH-12: Unauthenticated Request Blocked Across Auth Actions
  test('TC-AUTH-12: PUT /api/auth/profile should reject unauthenticated request', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .send({ name: 'New Name' });

    expect(res.statusCode).toBe(401);
  });

  // TC-AUTH-13: Password Hash Never Appears in Response
  test('TC-AUTH-13: Response JSON payloads must NEVER contain password or password_hash fields', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.data).not.toHaveProperty('password_hash');
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  // TC-AUTH-14: JWT Secret Never Exposed
  test('TC-AUTH-14: Response JSON payloads must NEVER expose the JWT_SECRET', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const bodyString = JSON.stringify(res.body);
    expect(bodyString.includes(env.jwt.secret)).toBe(false);
  });

  // TC-AUTH-15: Auth Rate Limiter Configured
  test('TC-AUTH-15: Auth endpoints should be protected by rate limiter headers', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.headers).toHaveProperty('ratelimit-limit');
  });

});
