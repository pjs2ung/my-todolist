const insertTodo = (db, { userId, categoryId, title, startDate, endDate }) => db.query(
  `INSERT INTO todos(user_id, category_id, title, start_date, end_date)
   VALUES ($1,$2,$3,$4,$5)
   RETURNING id, user_id AS "userId", category_id AS "categoryId", title,
             start_date::text AS "startDate", end_date::text AS "endDate", is_done AS "isDone",
             created_at AS "createdAt", updated_at AS "updatedAt"`,
  [userId, categoryId, title, startDate, endDate],
).then((r) => r.rows[0]);

const findTodoById = (db, todoId) => db.query(
  `SELECT id, user_id AS "userId", category_id AS "categoryId", title,
          start_date::text AS "startDate", end_date::text AS "endDate", is_done AS "isDone",
          created_at AS "createdAt", updated_at AS "updatedAt"
   FROM todos WHERE id = $1`,
  [todoId],
).then((r) => r.rows[0]);

const COLUMN_MAP = {
  categoryId: 'category_id', title: 'title', startDate: 'start_date', endDate: 'end_date', isDone: 'is_done',
};

const updateTodoById = (db, { todoId, ...changes }) => {
  const keys = Object.keys(changes).filter((k) => changes[k] !== undefined && COLUMN_MAP[k]);
  const setClauses = keys.map((k, i) => `${COLUMN_MAP[k]} = $${i + 2}`);
  setClauses.push('updated_at = now()');
  const values = keys.map((k) => changes[k]);
  return db.query(
    `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $1
     RETURNING id, user_id AS "userId", category_id AS "categoryId", title,
               start_date::text AS "startDate", end_date::text AS "endDate", is_done AS "isDone",
               created_at AS "createdAt", updated_at AS "updatedAt"`,
    [todoId, ...values],
  ).then((r) => r.rows[0]);
};

const deleteTodoById = (db, todoId) => db.query('DELETE FROM todos WHERE id = $1', [todoId]);

const findTodosByUserId = (db, { userId, categoryId }) => db.query(
  `SELECT id, user_id AS "userId", category_id AS "categoryId", title,
          start_date::text AS "startDate", end_date::text AS "endDate", is_done AS "isDone",
          created_at AS "createdAt", updated_at AS "updatedAt"
   FROM todos
   WHERE user_id = $1 AND ($2::uuid IS NULL OR category_id = $2)
   ORDER BY created_at DESC`,
  [userId, categoryId || null]
).then(r => r.rows);

module.exports = {
  insertTodo, findTodoById, updateTodoById, deleteTodoById, findTodosByUserId,
};
