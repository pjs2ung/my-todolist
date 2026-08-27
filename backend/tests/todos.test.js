const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');

const uniqueEmail = () =>
  `be07-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

describe('Todos API (BE-07)', () => {
  let accessTokenA;
  let accessTokenB;
  let userIdA;
  let defaultCategoryIdA;
  let categoryIdB;

  beforeAll(async () => {
    const emailA = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ email: emailA, password: 'password123', name: '할일테스터A' });
    const loginResA = await request(app)
      .post('/api/auth/login')
      .send({ email: emailA, password: 'password123' });
    accessTokenA = loginResA.body.accessToken;

    const meResA = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessTokenA}`);
    userIdA = meResA.body.id;

    const emailB = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ email: emailB, password: 'password123', name: '할일테스터B' });
    const loginResB = await request(app)
      .post('/api/auth/login')
      .send({ email: emailB, password: 'password123' });
    accessTokenB = loginResB.body.accessToken;

    const categoriesResA = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${accessTokenA}`);
    defaultCategoryIdA = categoriesResA.body.find((c) => c.name === '기본').id;

    const createCategoryResB = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessTokenB}`)
      .send({ name: `B전용-${Date.now()}` });
    categoryIdB = createCategoryResB.body.id;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email LIKE 'be07-%@example.com'");
  });

  describe('POST /api/todos', () => {
    test('인증 헤더 없으면 401', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: '할일', startDate: '2026-09-01', endDate: '2026-09-10' });
      expect(res.status).toBe(401);
    });

    test('categoryId 지정, 정상 입력이면 201과 생성된 Todo', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          categoryId: defaultCategoryIdA,
          title: '할일1',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        userId: userIdA,
        categoryId: defaultCategoryIdA,
        title: '할일1',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        isDone: false,
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    test('categoryId 미지정이면 기본 카테고리로 생성됨', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ title: '할일2', startDate: '2026-09-01', endDate: '2026-09-10' });

      expect(res.status).toBe(201);
      expect(res.body.categoryId).toBe(defaultCategoryIdA);
    });

    test('startDate가 endDate보다 이후면 400과 INVALID_DATE_RANGE', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ title: '할일', startDate: '2026-09-10', endDate: '2026-09-01' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_DATE_RANGE');
    });

    test('존재하지 않는 categoryId면 400과 INVALID_CATEGORY', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          categoryId: '00000000-0000-0000-0000-000000000000',
          title: '할일',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_CATEGORY');
    });

    test('타인 소유 categoryId면 400과 INVALID_CATEGORY', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          categoryId: categoryIdB,
          title: '할일',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_CATEGORY');
    });

    test('title 누락이면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ startDate: '2026-09-01', endDate: '2026-09-10' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('title이 빈 문자열이면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ title: '', startDate: '2026-09-01', endDate: '2026-09-10' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('title이 101자 이상이면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ title: 'a'.repeat(101), startDate: '2026-09-01', endDate: '2026-09-10' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('startDate 누락이면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ title: '할일', endDate: '2026-09-10' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('startDate 형식이 잘못되면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ title: '할일', startDate: '2026/09/01', endDate: '2026-09-10' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/todos/:id', () => {
    let todoId;
    let createdAt;
    let updatedAtBefore;

    beforeAll(async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          categoryId: defaultCategoryIdA,
          title: '수정대상할일',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        });
      todoId = createRes.body.id;
      createdAt = createRes.body.createdAt;
      updatedAtBefore = createRes.body.updatedAt;
    });

    test('인증 헤더 없으면 401', async () => {
      const res = await request(app).patch(`/api/todos/${todoId}`).send({ title: '변경' });
      expect(res.status).toBe(401);
    });

    test('title 정상 변경이면 200과 반영된 값, updatedAt 갱신', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      const res = await request(app)
        .patch(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ title: '수정된제목' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('수정된제목');
      expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(updatedAtBefore).getTime()
      );
    });

    test('startDate만 변경해 endDate보다 이후가 되면 400과 INVALID_DATE_RANGE', async () => {
      const res = await request(app)
        .patch(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ startDate: '2026-09-15' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_DATE_RANGE');
    });

    test('타인 소유 categoryId로 변경 시도하면 400과 INVALID_CATEGORY', async () => {
      const res = await request(app)
        .patch(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ categoryId: categoryIdB });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_CATEGORY');
    });

    test('타인(B)이 A의 Todo 수정 시도하면 403과 FORBIDDEN', async () => {
      const res = await request(app)
        .patch(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessTokenB}`)
        .send({ title: '해킹시도' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    test('존재하지 않는 todoId면 404와 NOT_FOUND', async () => {
      const res = await request(app)
        .patch('/api/todos/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ title: '없는할일' });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    test('isDone 변경이 반영됨', async () => {
      const res = await request(app)
        .patch(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ isDone: true });

      expect(res.status).toBe(200);
      expect(res.body.isDone).toBe(true);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todoId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          categoryId: defaultCategoryIdA,
          title: '삭제대상할일',
          startDate: '2026-09-01',
          endDate: '2026-09-10',
        });
      todoId = createRes.body.id;
    });

    test('인증 헤더 없으면 401', async () => {
      const res = await request(app).delete(`/api/todos/${todoId}`);
      expect(res.status).toBe(401);
    });

    test('타인(B)이 A의 Todo 삭제 시도하면 403과 FORBIDDEN', async () => {
      const res = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessTokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    test('존재하지 않는 todoId면 404와 NOT_FOUND', async () => {
      const res = await request(app)
        .delete('/api/todos/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessTokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    test('정상 삭제 시 204이고 DB에서 삭제됨', async () => {
      const res = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessTokenA}`);

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});

      const dbRes = await pool.query('SELECT * FROM todos WHERE id = $1', [todoId]);
      expect(dbRes.rows.length).toBe(0);
    });
  });
});
