require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const pool = require('../src/db/pool');
const { verifyAccessToken } = require('../src/utils/jwt');

const uniqueEmail = () =>
  `be03-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const extractRefreshCookie = (res) => {
  const cookies = res.headers['set-cookie'] || [];
  const cookie = cookies.find((c) => c.startsWith('refreshToken='));
  return cookie ? cookie.split(';')[0] : null;
};

describe('Auth API (BE-03)', () => {
  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email LIKE 'be03-%@example.com'");
  });

  describe('POST /api/auth/register', () => {
    test('회원가입 성공 시 201과 password 없는 User, 기본 카테고리 생성', async () => {
      const email = uniqueEmail();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email, password: 'password123', name: '테스터' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe(email);
      expect(res.body.name).toBe('테스터');
      expect(res.body.password).toBeUndefined();
      expect(res.body.passwordHash).toBeUndefined();

      const { rows } = await pool.query(
        "SELECT * FROM categories WHERE user_id = $1 AND name = '기본'",
        [res.body.id],
      );
      expect(rows.length).toBe(1);
    });

    test('이미 가입된 email로 재가입 시 400과 EMAIL_TAKEN', async () => {
      const email = uniqueEmail();
      await request(app)
        .post('/api/auth/register')
        .send({ email, password: 'password123', name: '테스터' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email, password: 'password123', name: '테스터2' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('EMAIL_TAKEN');
    });

    test('password가 8자 미만이면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: uniqueEmail(), password: 'short', name: '테스터' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('email 형식이 잘못되면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123', name: '테스터' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    const email = uniqueEmail();
    const password = 'password123';

    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email, password, name: '로그인테스터' });
    });

    test('로그인 성공 시 200, accessToken, HttpOnly refreshToken 쿠키', async () => {
      const res = await request(app).post('/api/auth/login').send({ email, password });

      expect(res.status).toBe(200);
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.user.email).toBe(email);

      const cookies = res.headers['set-cookie'] || [];
      const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toMatch(/HttpOnly/i);
    });

    test('없는 email과 틀린 password 모두 401이며 동일한 message', async () => {
      const resNoEmail = await request(app)
        .post('/api/auth/login')
        .send({ email: uniqueEmail(), password });

      const resWrongPassword = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' });

      expect(resNoEmail.status).toBe(401);
      expect(resNoEmail.body.code).toBe('UNAUTHORIZED');
      expect(resWrongPassword.status).toBe(401);
      expect(resWrongPassword.body.code).toBe('UNAUTHORIZED');
      expect(resNoEmail.body.message).toBe(resWrongPassword.body.message);
    });
  });

  describe('POST /api/auth/refresh', () => {
    const email = uniqueEmail();
    const password = 'password123';
    let userId;
    let refreshCookie;

    beforeAll(async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ email, password, name: '리프레시테스터' });
      userId = registerRes.body.id;

      const loginRes = await request(app).post('/api/auth/login').send({ email, password });
      refreshCookie = extractRefreshCookie(loginRes);
    });

    test('정상 refresh token으로 새 accessToken 발급', async () => {
      const res = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie);

      expect(res.status).toBe(200);
      expect(typeof res.body.accessToken).toBe('string');

      const decoded = verifyAccessToken(res.body.accessToken);
      expect(decoded.userId).toBe(userId);
    });

    test('만료된 refresh token은 401', async () => {
      const expiredToken = jwt.sign({ userId: 'x' }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: -10,
      });

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${expiredToken}`);

      expect(res.status).toBe(401);
    });

    test('다른 secret으로 서명된 위조 refresh token은 401', async () => {
      const forgedToken = jwt.sign({ userId: 'x' }, 'wrong-secret', { expiresIn: '7d' });

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${forgedToken}`);

      expect(res.status).toBe(401);
    });

    test('refresh 쿠키가 없으면 401', async () => {
      const res = await request(app).post('/api/auth/refresh');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('로그아웃 성공 시 204, 쿠키 삭제, 이후 동일 refresh token 재사용 불가', async () => {
      const email = uniqueEmail();
      const password = 'password123';

      await request(app)
        .post('/api/auth/register')
        .send({ email, password, name: '로그아웃테스터' });

      const loginRes = await request(app).post('/api/auth/login').send({ email, password });
      const refreshCookie = extractRefreshCookie(loginRes);

      const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', refreshCookie);

      expect(logoutRes.status).toBe(204);
      expect(logoutRes.body).toEqual({});
      const clearedCookie = (logoutRes.headers['set-cookie'] || []).find((c) =>
        c.startsWith('refreshToken='),
      );
      expect(clearedCookie).toBeDefined();

      const refreshAfterLogout = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie);

      expect(refreshAfterLogout.status).toBe(401);
    });
  });
});
