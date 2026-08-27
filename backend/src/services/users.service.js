const pool = require('../db/pool');
const { findUserById, updateUserName: updateUserNameQuery } = require('../queries/users.query');

async function getUserById(userId) {
  const user = await findUserById(pool, userId);
  if (!user) {
    throw Object.assign(new Error('사용자를 찾을 수 없습니다.'), { status: 404, code: 'USER_NOT_FOUND' });
  }
  return user;
}

async function updateUserName(userId, name) {
  const user = await updateUserNameQuery(pool, { userId, name });
  console.log(`[users] update success userId=${userId}`);
  return user;
}

module.exports = { getUserById, updateUserName };
