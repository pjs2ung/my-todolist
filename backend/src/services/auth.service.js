const crypto = require('crypto');

const pool = require('../db/pool');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const {
  findUserByEmail,
  insertUser,
  updateRefreshTokenHash,
  findRefreshTokenHashByUserId,
} = require('../queries/auth.query');
const { insertCategory } = require('../queries/category.query');

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function unauthorized(message = '이메일 또는 비밀번호가 올바르지 않습니다.', code = 'UNAUTHORIZED') {
  return Object.assign(new Error(message), { status: 401, code });
}

async function registerUser({ email, password, name }) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const user = await insertUser(client, { email: normalizedEmail, passwordHash, name });
    await insertCategory(client, { userId: user.id, name: '기본' });
    await client.query('COMMIT');
    console.log(`[auth] register success userId=${user.id}`);
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      throw Object.assign(new Error('이미 사용 중인 이메일입니다.'), { status: 400, code: 'EMAIL_TAKEN' });
    }
    throw err;
  } finally {
    client.release();
  }
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(pool, normalizedEmail);

  if (!user) {
    console.warn('[auth] login failed: email not found');
    throw unauthorized();
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    console.warn(`[auth] login failed: invalid password userId=${user.id}`);
    throw unauthorized();
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });
  await updateRefreshTokenHash(pool, { userId: user.id, refreshTokenHash: sha256(refreshToken) });
  console.log(`[auth] login success userId=${user.id}`);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw unauthorized('인증이 필요합니다.', 'UNAUTHORIZED');
  }

  const payload = verifyRefreshToken(refreshToken);
  const row = await findRefreshTokenHashByUserId(pool, payload.userId);

  if (!row || !row.refreshTokenHash || row.refreshTokenHash !== sha256(refreshToken)) {
    console.warn(`[auth] refresh rejected: hash mismatch userId=${payload.userId}`);
    throw unauthorized('유효하지 않은 토큰입니다.', 'TOKEN_INVALID');
  }

  const accessToken = signAccessToken({ userId: payload.userId });
  console.log(`[auth] refresh success userId=${payload.userId}`);
  return { accessToken };
}

async function logoutUser(refreshToken) {
  if (!refreshToken) {
    throw unauthorized('인증이 필요합니다.', 'UNAUTHORIZED');
  }

  const payload = verifyRefreshToken(refreshToken);
  await updateRefreshTokenHash(pool, { userId: payload.userId, refreshTokenHash: null });
  console.log(`[auth] logout success userId=${payload.userId}`);
}

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };
