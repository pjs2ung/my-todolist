const pool = require('../db/pool');
const {
  insertCategory, findCategoriesByUserId, findCategoryById,
  findDefaultCategoryByUserId, reassignTodosToCategory, deleteCategoryById,
  updateCategoryName,
} = require('../queries/category.query');

async function listCategories(userId) {
  return findCategoriesByUserId(pool, userId);
}

async function createCategory(userId, name) {
  try {
    const category = await insertCategory(pool, { userId, name });
    console.log(`[categories] create success userId=${userId} categoryId=${category.id}`);
    return category;
  } catch (err) {
    if (err.code === '23505') {
      throw Object.assign(new Error('이미 사용 중인 카테고리 이름입니다.'), { status: 400, code: 'CATEGORY_NAME_TAKEN' });
    }
    throw err;
  }
}

async function updateCategory(userId, categoryId, name) {
  const category = await findCategoryById(pool, categoryId);
  if (!category) {
    throw Object.assign(new Error('카테고리를 찾을 수 없습니다.'), { status: 404, code: 'NOT_FOUND' });
  }
  if (category.userId !== userId) {
    console.warn(`[categories] update rejected: not owner userId=${userId} categoryId=${categoryId}`);
    throw Object.assign(new Error('수정 권한이 없습니다.'), { status: 403, code: 'FORBIDDEN' });
  }
  if (category.name === '기본') {
    console.warn(`[categories] update rejected: default category userId=${userId} categoryId=${categoryId}`);
    throw Object.assign(new Error("'기본' 카테고리는 이름을 변경할 수 없습니다."), { status: 400, code: 'DEFAULT_CATEGORY_RENAME_FORBIDDEN' });
  }

  try {
    const updated = await updateCategoryName(pool, { categoryId, name });
    console.log(`[categories] update success userId=${userId} categoryId=${categoryId}`);
    return updated;
  } catch (err) {
    if (err.code === '23505') {
      throw Object.assign(new Error('이미 사용 중인 카테고리 이름입니다.'), { status: 400, code: 'CATEGORY_NAME_TAKEN' });
    }
    throw err;
  }
}

async function deleteCategory(userId, categoryId) {
  const category = await findCategoryById(pool, categoryId);
  if (!category) {
    throw Object.assign(new Error('카테고리를 찾을 수 없습니다.'), { status: 404, code: 'NOT_FOUND' });
  }
  if (category.userId !== userId) {
    console.warn(`[categories] delete rejected: not owner userId=${userId} categoryId=${categoryId}`);
    throw Object.assign(new Error('삭제 권한이 없습니다.'), { status: 403, code: 'FORBIDDEN' });
  }
  if (category.name === '기본') {
    console.warn(`[categories] delete rejected: default category userId=${userId} categoryId=${categoryId}`);
    throw Object.assign(new Error("'기본' 카테고리는 삭제할 수 없습니다."), { status: 400, code: 'DEFAULT_CATEGORY_DELETE_FORBIDDEN' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const defaultCategory = await findDefaultCategoryByUserId(client, userId);
    await reassignTodosToCategory(client, { fromCategoryId: categoryId, toCategoryId: defaultCategory.id });
    await deleteCategoryById(client, categoryId);
    await client.query('COMMIT');
    console.log(`[categories] delete success userId=${userId} categoryId=${categoryId}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  listCategories, createCategory, updateCategory, deleteCategory,
};
