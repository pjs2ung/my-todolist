const todosService = require('../services/todos.service');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS_VALUES = ['not_started', 'in_progress', 'done', 'overdue'];

function validationError(message) {
  return Object.assign(new Error(message), { status: 400, code: 'VALIDATION_ERROR' });
}

function assertTitle(title) {
  if (typeof title !== 'string' || title.length < 1 || title.length > 100) {
    throw validationError('제목은 1~100자여야 합니다.');
  }
}

function assertDate(value, label) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    throw validationError(`${label}는 YYYY-MM-DD 형식이어야 합니다.`);
  }
}

async function createTodo(req, res, next) {
  try {
    const body = req.body || {};
    const { title, startDate, endDate } = body;
    const categoryId = body.categoryId || undefined;

    assertTitle(title);
    assertDate(startDate, 'startDate');
    assertDate(endDate, 'endDate');

    const todo = await todosService.createTodo(req.userId, {
      categoryId, title, startDate, endDate,
    });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
}

async function updateTodo(req, res, next) {
  try {
    const body = req.body || {};
    const changes = {};
    ['title', 'categoryId', 'startDate', 'endDate', 'isDone'].forEach((key) => {
      if (body[key] !== undefined) changes[key] = body[key];
    });

    if (changes.title !== undefined) assertTitle(changes.title);
    if (changes.startDate !== undefined) assertDate(changes.startDate, 'startDate');
    if (changes.endDate !== undefined) assertDate(changes.endDate, 'endDate');

    const todo = await todosService.updateTodo(req.userId, req.params.id, changes);
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
}

async function deleteTodo(req, res, next) {
  try {
    await todosService.deleteTodo(req.userId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function listTodos(req, res, next) {
  try {
    const { categoryId, status } = req.query;
    if (categoryId !== undefined && !UUID_RE.test(categoryId)) {
      throw validationError('categoryId 형식이 올바르지 않습니다.');
    }
    if (status !== undefined && !STATUS_VALUES.includes(status)) {
      throw validationError('status 값이 올바르지 않습니다.');
    }
    const todos = await todosService.listTodos(req.userId, { categoryId, status });
    res.status(200).json(todos);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTodo, updateTodo, deleteTodo, listTodos,
};
