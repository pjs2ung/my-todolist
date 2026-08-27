const findUserById = (db, userId) => db.query(
  `SELECT id, email, name, created_at AS "createdAt", updated_at AS "updatedAt"
   FROM users WHERE id = $1`, [userId]
).then((r) => r.rows[0]);

const updateUserName = (db, { userId, name }) => db.query(
  `UPDATE users SET name = $2, updated_at = now()
   WHERE id = $1
   RETURNING id, email, name, created_at AS "createdAt", updated_at AS "updatedAt"`,
  [userId, name]
).then((r) => r.rows[0]);

module.exports = { findUserById, updateUserName };
