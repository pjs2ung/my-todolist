const pool = require('../db/pool');
const {
  insertTodo, findTodoById, updateTodoById, deleteTodoById, findTodosByUserId,
} = require('../queries/todo.query');
const { findCategoryById, findDefaultCategoryByUserId } = require('../queries/category.query');
const { getTodoStatus } = require('../utils/todoStatus');

function invalidCategoryError() {
  return Object.assign(new Error('유효하지 않은 카테고리입니다.'), { status: 400, code: 'INVALID_CATEGORY' });
}
function invalidDateRangeError() {
  return Object.assign(new Error('종료일은 시작일 이후여야 합니다.'), { status: 400, code: 'INVALID_DATE_RANGE' });
}

// pg는 DATE 컬럼을 Date 객체로 반환하므로 요청 문자열('YYYY-MM-DD')과 비교 가능하도록 통일한다.
function toDateStr(value) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

// BR-05: startDate <= endDate 검증 (단위 테스트 대상, project-principle §4)
function isValidDateRange(startDate, endDate) {
  return startDate <= endDate;
}

async function resolveCategoryId(userId, categoryId) {
  if (!categoryId) {
    const def = await findDefaultCategoryByUserId(pool, userId);
    return def.id;
  }
  const category = await findCategoryById(pool, categoryId);
  if (!category || category.userId !== userId) throw invalidCategoryError();
  return categoryId;
}

async function createTodo(userId, {
  categoryId, title, startDate, endDate,
}) {
  const resolvedCategoryId = await resolveCategoryId(userId, categoryId);
  if (!isValidDateRange(startDate, endDate)) throw invalidDateRangeError();
  const todo = await insertTodo(pool, {
    userId, categoryId: resolvedCategoryId, title, startDate, endDate,
  });
  console.log(`[todos] create success userId=${userId} todoId=${todo.id}`);
  return todo;
}

async function updateTodo(userId, todoId, changes) {
  const todo = await findTodoById(pool, todoId);
  if (!todo) throw Object.assign(new Error('할일을 찾을 수 없습니다.'), { status: 404, code: 'NOT_FOUND' });
  if (todo.userId !== userId) {
    console.warn(`[todos] update rejected: not owner userId=${userId} todoId=${todoId}`);
    throw Object.assign(new Error('수정 권한이 없습니다.'), { status: 403, code: 'FORBIDDEN' });
  }
  if (changes.categoryId !== undefined) {
    // 존재/소유 검증만 수행, 값은 changes.categoryId를 그대로 사용
    await resolveCategoryId(userId, changes.categoryId);
  }
  const mergedStart = changes.startDate ?? toDateStr(todo.startDate);
  const mergedEnd = changes.endDate ?? toDateStr(todo.endDate);
  if (!isValidDateRange(mergedStart, mergedEnd)) throw invalidDateRangeError();

  const updated = await updateTodoById(pool, { todoId, ...changes });
  console.log(`[todos] update success userId=${userId} todoId=${todoId}`);
  return updated;
}

async function deleteTodo(userId, todoId) {
  const todo = await findTodoById(pool, todoId);
  if (!todo) throw Object.assign(new Error('할일을 찾을 수 없습니다.'), { status: 404, code: 'NOT_FOUND' });
  if (todo.userId !== userId) {
    console.warn(`[todos] delete rejected: not owner userId=${userId} todoId=${todoId}`);
    throw Object.assign(new Error('삭제 권한이 없습니다.'), { status: 403, code: 'FORBIDDEN' });
  }
  await deleteTodoById(pool, todoId);
  console.log(`[todos] delete success userId=${userId} todoId=${todoId}`);
}

async function listTodos(userId, { categoryId, status } = {}) {
  const todos = await findTodosByUserId(pool, { userId, categoryId });
  const withStatus = todos.map((t) => ({ ...t, status: getTodoStatus(t) }));
  if (!status) return withStatus;
  return withStatus.filter((t) => t.status === status);
}

module.exports = {
  createTodo, updateTodo, deleteTodo, listTodos, isValidDateRange, resolveCategoryId,
};
