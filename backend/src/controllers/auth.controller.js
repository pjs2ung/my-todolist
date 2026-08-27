const authService = require('../services/auth.service');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
};

function validationError(message) {
  return Object.assign(new Error(message), { status: 400, code: 'VALIDATION_ERROR' });
}

function getRefreshTokenFromCookie(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith('refreshToken=')) {
      return decodeURIComponent(trimmed.slice('refreshToken='.length));
    }
  }
  return null;
}

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body || {};

    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      throw validationError('올바른 이메일 형식이 아닙니다.');
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw validationError('비밀번호는 8자 이상이어야 합니다.');
    }
    if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
      throw validationError('이름은 1~50자여야 합니다.');
    }

    const user = await authService.registerUser({ email, password, name });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || !email || typeof password !== 'string' || !password) {
      throw validationError('이메일과 비밀번호를 입력해주세요.');
    }

    const { accessToken, refreshToken, user } = await authService.loginUser({ email, password });
    res.cookie('refreshToken', refreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = getRefreshTokenFromCookie(req);
    const { accessToken } = await authService.refreshAccessToken(token);
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = getRefreshTokenFromCookie(req);
    await authService.logoutUser(token);
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout };
