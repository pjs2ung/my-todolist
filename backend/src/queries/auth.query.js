const findUserByEmail = (db, email) => db.query(
  `SELECT id, email, password_hash AS "passwordHash", name,
          created_at AS "createdAt", updated_at AS "updatedAt"
   FROM users WHERE email = $1`, [email]
).then((r) => r.rows[0]);

const insertUser = (db, { email, passwordHash, name }) => db.query(
  `INSERT INTO users(email, password_hash, name) VALUES ($1, $2, $3)
   RETURNING id, email, name, created_at AS "createdAt", updated_at AS "updatedAt"`,
  [email, passwordHash, name]
).then((r) => r.rows[0]);

const updateRefreshTokenHash = (db, { userId, refreshTokenHash }) => db.query(
  `UPDATE users SET refresh_token_hash = $2 WHERE id = $1`,
  [userId, refreshTokenHash]
);

const findRefreshTokenHashByUserId = (db, userId) => db.query(
  `SELECT refresh_token_hash AS "refreshTokenHash" FROM users WHERE id = $1`,
  [userId]
).then((r) => r.rows[0]);

module.exports = {
  findUserByEmail,
  insertUser,
  updateRefreshTokenHash,
  findRefreshTokenHashByUserId,
};
