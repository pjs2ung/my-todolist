const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET/JWT_REFRESH_SECRET is required');
}

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

function buildVerifyError(err) {
  if (err instanceof jwt.TokenExpiredError) {
    const e = new Error('Token expired');
    e.status = 401;
    e.code = 'TOKEN_EXPIRED';
    return { error: e, reason: 'expired' };
  }
  const e = new Error('Token invalid');
  e.status = 401;
  e.code = 'TOKEN_INVALID';
  return { error: e, reason: 'invalid' };
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    const { error, reason } = buildVerifyError(err);
    console.warn(`[jwt] access token verify failed: ${reason}`);
    throw error;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    const { error, reason } = buildVerifyError(err);
    console.warn(`[jwt] refresh token verify failed: ${reason}`);
    throw error;
  }
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
