const insertCategory = (db, { userId, name }) => db.query(
  `INSERT INTO categories(user_id, name) VALUES ($1, $2)
   RETURNING id, user_id AS "userId", name`,
  [userId, name]
).then((r) => r.rows[0]);

const findCategoriesByUserId = (db, userId) => db.query(
  `SELECT id, user_id AS "userId", name FROM categories WHERE user_id = $1 ORDER BY name`,
  [userId]
).then((r) => r.rows);

const findCategoryById = (db, categoryId) => db.query(
  `SELECT id, user_id AS "userId", name FROM categories WHERE id = $1`,
  [categoryId]
).then((r) => r.rows[0]);

const findDefaultCategoryByUserId = (db, userId) => db.query(
  `SELECT id, user_id AS "userId", name FROM categories WHERE user_id = $1 AND name = '기본'`,
  [userId]
).then((r) => r.rows[0]);

const reassignTodosToCategory = (db, { fromCategoryId, toCategoryId }) => db.query(
  `UPDATE todos SET category_id = $2 WHERE category_id = $1`,
  [fromCategoryId, toCategoryId]
);

const deleteCategoryById = (db, categoryId) => db.query(
  `DELETE FROM categories WHERE id = $1`,
  [categoryId]
);

const updateCategoryName = (db, { categoryId, name }) => db.query(
  `UPDATE categories SET name = $2 WHERE id = $1
   RETURNING id, user_id AS "userId", name`,
  [categoryId, name]
).then((r) => r.rows[0]);

module.exports = {
  insertCategory,
  findCategoriesByUserId,
  findCategoryById,
  findDefaultCategoryByUserId,
  reassignTodosToCategory,
  deleteCategoryById,
  updateCategoryName,
};
