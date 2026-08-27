const categoriesService = require('../services/categories.service');

function validationError(message) {
  return Object.assign(new Error(message), { status: 400, code: 'VALIDATION_ERROR' });
}

async function getCategories(req, res, next) {
  try {
    const categories = await categoriesService.listCategories(req.userId);
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name } = req.body || {};

    if (typeof name !== 'string' || name.length < 1 || name.length > 30) {
      throw validationError('카테고리 이름은 1~30자여야 합니다.');
    }

    const category = await categoriesService.createCategory(req.userId, name);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { name } = req.body || {};

    if (typeof name !== 'string' || name.length < 1 || name.length > 30) {
      throw validationError('카테고리 이름은 1~30자여야 합니다.');
    }

    const category = await categoriesService.updateCategory(req.userId, req.params.id, name);
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await categoriesService.deleteCategory(req.userId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
};
