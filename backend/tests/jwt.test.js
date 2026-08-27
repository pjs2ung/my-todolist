require('dotenv').config();

const jsonwebtoken = require('jsonwebtoken');
const {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../src/utils/jwt');

describe('jwt utils', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('access token은 정상 발급/검증 왕복이 된다', () => {
    const token = signAccessToken({ userId: 'abc' });

    const payload = verifyAccessToken(token);

    expect(payload).toMatchObject({ userId: 'abc' });
  });

  test('refresh token은 정상 발급/검증 왕복이 된다', () => {
    const token = signRefreshToken({ userId: 'abc' });

    const payload = verifyRefreshToken(token);

    expect(payload).toMatchObject({ userId: 'abc' });
  });

  test('만료된 access token은 status:401, code:TOKEN_EXPIRED로 실패한다', () => {
    const expiredToken = jsonwebtoken.sign(
      { userId: 'x' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: -10 }
    );

    expect.assertions(2);
    try {
      verifyAccessToken(expiredToken);
    } catch (err) {
      expect(err.status).toBe(401);
      expect(err.code).toBe('TOKEN_EXPIRED');
    }
  });

  test('만료된 refresh token은 status:401, code:TOKEN_EXPIRED로 실패한다', () => {
    const expiredToken = jsonwebtoken.sign(
      { userId: 'x' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: -10 }
    );

    expect.assertions(2);
    try {
      verifyRefreshToken(expiredToken);
    } catch (err) {
      expect(err.status).toBe(401);
      expect(err.code).toBe('TOKEN_EXPIRED');
    }
  });

  test('다른 secret으로 위조된 토큰은 status:401, code:TOKEN_INVALID로 실패한다', () => {
    const forgedToken = jsonwebtoken.sign(
      { userId: 'x' },
      'totally-different-secret',
      { expiresIn: '15m' }
    );

    expect.assertions(2);
    try {
      verifyAccessToken(forgedToken);
    } catch (err) {
      expect(err.status).toBe(401);
      expect(err.code).toBe('TOKEN_INVALID');
    }
  });

  test('access token으로 발급한 토큰을 verifyRefreshToken에 넣으면 TOKEN_INVALID로 실패한다', () => {
    const accessToken = signAccessToken({ userId: 'abc' });

    expect.assertions(2);
    try {
      verifyRefreshToken(accessToken);
    } catch (err) {
      expect(err.status).toBe(401);
      expect(err.code).toBe('TOKEN_INVALID');
    }
  });

  test('refresh token으로 발급한 토큰을 verifyAccessToken에 넣으면 TOKEN_INVALID로 실패한다', () => {
    const refreshToken = signRefreshToken({ userId: 'abc' });

    expect.assertions(2);
    try {
      verifyAccessToken(refreshToken);
    } catch (err) {
      expect(err.status).toBe(401);
      expect(err.code).toBe('TOKEN_INVALID');
    }
  });
});
