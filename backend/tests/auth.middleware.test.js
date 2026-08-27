const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../src/middlewares/auth.middleware');
const errorHandler = require('../src/middlewares/errorHandler');
const { signAccessToken } = require('../src/utils/jwt');

function buildTestApp() {
  const app = express();
  app.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ userId: req.userId });
  });
  app.use(errorHandler);
  return app;
}

describe('authMiddleware', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('Authorization 헤더가 없으면 401 UNAUTHORIZED를 반환한다', async () => {
    const res = await request(buildTestApp()).get('/protected');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('Bearer 스킴이 아니면 401 UNAUTHORIZED를 반환한다', async () => {
    const res = await request(buildTestApp())
      .get('/protected')
      .set('Authorization', 'Basic xxx');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('Bearer 토큰이 빈 문자열이면 401 UNAUTHORIZED를 반환한다', async () => {
    const res = await request(buildTestApp())
      .get('/protected')
      .set('Authorization', 'Bearer ');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('만료된 토큰이면 401 TOKEN_EXPIRED를 반환한다', async () => {
    const expiredToken = jwt.sign(
      { userId: 'expired-user' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: -10 }
    );

    const res = await request(buildTestApp())
      .get('/protected')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });

  it('위조된 토큰이면 401 TOKEN_INVALID를 반환한다', async () => {
    const forgedToken = jwt.sign({ userId: 'x' }, 'totally-different-secret');

    const res = await request(buildTestApp())
      .get('/protected')
      .set('Authorization', `Bearer ${forgedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_INVALID');
  });

  it('정상 토큰이면 200을 반환하고 req.userId를 주입한다', async () => {
    const token = signAccessToken({ userId: 'test-user-id' });

    const res = await request(buildTestApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('test-user-id');
  });
});
