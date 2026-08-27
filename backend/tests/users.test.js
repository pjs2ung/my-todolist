const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');

const uniqueEmail = () =>
  `be05-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

describe('Users API (BE-05)', () => {
  let accessToken;
  let email;

  beforeAll(async () => {
    email = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'password123', name: '회원정보테스터' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email LIKE 'be05-%@example.com'");
  });

  describe('GET /api/users/me', () => {
    test('인증 헤더 없으면 401', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });

    test('유효한 토큰이면 200과 민감 정보 없는 User', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(email);
      expect(res.body.name).toBe('회원정보테스터');
      expect(res.body.password).toBeUndefined();
      expect(res.body.passwordHash).toBeUndefined();
      expect(res.body.password_hash).toBeUndefined();
      expect(res.body.refreshTokenHash).toBeUndefined();
      expect(res.body.refresh_token_hash).toBeUndefined();
    });
  });

  describe('PATCH /api/users/me', () => {
    test('인증 헤더 없으면 401', async () => {
      const res = await request(app).patch('/api/users/me').send({ name: '새이름' });
      expect(res.status).toBe(401);
    });

    test('name이 빈 문자열이면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('name이 51자 이상이면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'a'.repeat(51) });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('정상 name이면 200과 갱신된 name/updatedAt', async () => {
      const beforeRes = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);
      const beforeUpdatedAt = new Date(beforeRes.body.updatedAt);

      await new Promise((r) => setTimeout(r, 10));

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '새이름' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('새이름');
      expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThan(beforeUpdatedAt.getTime());
    });
  });
});
