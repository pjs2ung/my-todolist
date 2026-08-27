const { verifyAccessToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';

  if (!token) {
    console.warn(`[auth] missing/invalid Authorization header: ${req.method} ${req.originalUrl}`);
    return next(Object.assign(new Error('인증 토큰이 필요합니다.'), { status: 401, code: 'UNAUTHORIZED' }));
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    // jwt.js가 이미 status/code/message와 로깅을 완성해서 던짐, 그대로 전달
    next(err);
  }
}

module.exports = authMiddleware;
