jest.mock('../src/queries/category.query');
const { findCategoryById, findDefaultCategoryByUserId } = require('../src/queries/category.query');
const { resolveCategoryId } = require('../src/services/todos.service');

describe('resolveCategoryId (BE-09, BR-03/BR-04)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('categoryId 미지정 시 기본 카테고리를 조회해서 그 id를 반환한다', async () => {
    findDefaultCategoryByUserId.mockResolvedValue({ id: 'default-cat-id', userId: 'user-1', name: '기본' });

    const result = await resolveCategoryId('user-1', undefined);

    expect(result).toBe('default-cat-id');
    expect(findDefaultCategoryByUserId).toHaveBeenCalledTimes(1);
    expect(findDefaultCategoryByUserId).toHaveBeenCalledWith(expect.anything(), 'user-1');
    expect(findCategoryById).not.toHaveBeenCalled();
  });

  test('categoryId가 빈 문자열이면 기본 카테고리로 처리한다', async () => {
    findDefaultCategoryByUserId.mockResolvedValue({ id: 'default-cat-id', userId: 'user-1', name: '기본' });

    const result = await resolveCategoryId('user-1', '');

    expect(result).toBe('default-cat-id');
    expect(findCategoryById).not.toHaveBeenCalled();
  });

  test('categoryId 지정 시 본인 소유면 그 categoryId를 그대로 반환한다', async () => {
    findCategoryById.mockResolvedValue({ id: 'cat-123', userId: 'user-1', name: '업무' });

    const result = await resolveCategoryId('user-1', 'cat-123');

    expect(result).toBe('cat-123');
    expect(findCategoryById).toHaveBeenCalledTimes(1);
    expect(findCategoryById).toHaveBeenCalledWith(expect.anything(), 'cat-123');
    expect(findDefaultCategoryByUserId).not.toHaveBeenCalled();
  });

  test('categoryId가 존재하지 않으면 INVALID_CATEGORY 에러를 던진다', async () => {
    findCategoryById.mockResolvedValue(undefined);

    await expect(resolveCategoryId('user-1', 'nonexistent')).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_CATEGORY',
    });
  });

  test('categoryId가 타인 소유면 INVALID_CATEGORY 에러를 던진다', async () => {
    findCategoryById.mockResolvedValue({ id: 'cat-999', userId: 'other-user', name: '남의카테고리' });

    await expect(resolveCategoryId('user-1', 'cat-999')).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_CATEGORY',
    });
  });
});
