const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');

const uniqueEmail = () =>
  `be06-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

describe('Categories API (BE-06)', () => {
  let accessTokenA;
  let accessTokenB;
  let userIdA;

  beforeAll(async () => {
    const emailA = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ email: emailA, password: 'password123', name: '카테고리테스터A' });
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
      .send({ email: emailB, password: 'password123', name: '카테고리테스터B' });
    const loginResB = await request(app)
      .post('/api/auth/login')
      .send({ email: emailB, password: 'password123' });
    accessTokenB = loginResB.body.accessToken;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email LIKE 'be06-%@example.com'");
  });

  describe('GET /api/categories', () => {
    test('인증 헤더 없으면 401', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(401);
    });

    test('인증되면 200과 기본 카테고리 포함 배열', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((c) => c.name === '기본')).toBe(true);
    });
  });

  describe('POST /api/categories', () => {
    test('인증 헤더 없으면 401', async () => {
      const res = await request(app).post('/api/categories').send({ name: '업무' });
      expect(res.status).toBe(401);
    });

    test('name이 빈 문자열이면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('name이 31자 이상이면 400과 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ name: 'a'.repeat(31) });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('정상 name이면 201과 생성된 카테고리', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ name: '업무' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('업무');
      expect(res.body.userId).toBe(userIdA);
    });

    test('동일 name 재생성 시 400과 CATEGORY_NAME_TAKEN', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ name: '업무' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('CATEGORY_NAME_TAKEN');
    });

    test('타인이 만든 카테고리는 내 목록에 섞이지 않음', async () => {
      const bCategoryName = `B전용-${Date.now()}`;
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .send({ name: bCategoryName });

      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.some((c) => c.name === bCategoryName)).toBe(false);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    test('인증 헤더 없으면 401', async () => {
      const res = await request(app).delete(
        '/api/categories/00000000-0000-0000-0000-000000000000'
      );
      expect(res.status).toBe(401);
    });

    test('존재하지 않는 id면 404', async () => {
      const res = await request(app)
        .delete('/api/categories/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessTokenA}`);
      expect(res.status).toBe(404);
    });

    test('기본 카테고리 삭제 시도 시 400과 DEFAULT_CATEGORY_DELETE_FORBIDDEN', async () => {
      const listRes = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`);
      const defaultCategory = listRes.body.find((c) => c.name === '기본');

      const res = await request(app)
        .delete(`/api/categories/${defaultCategory.id}`)
        .set('Authorization', `Bearer ${accessTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('DEFAULT_CATEGORY_DELETE_FORBIDDEN');
    });

    test('타인 소유 카테고리 삭제 시도 시 403과 FORBIDDEN', async () => {
      const listRes = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`);
      const workCategory = listRes.body.find((c) => c.name === '업무');

      const res = await request(app)
        .delete(`/api/categories/${workCategory.id}`)
        .set('Authorization', `Bearer ${accessTokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    test('정상 삭제 시 204이고, 소속 Todo는 기본 카테고리로 재배정됨', async () => {
      const createRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ name: '업무2' });
      const workCategory2Id = createRes.body.id;

      const listResBefore = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`);
      const defaultCategoryId = listResBefore.body.find((c) => c.name === '기본').id;

      const todoResult = await pool.query(
        `INSERT INTO todos(user_id, category_id, title, start_date, end_date)
         VALUES ($1, $2, '테스트할일', '2026-08-27', '2026-08-28') RETURNING id`,
        [userIdA, workCategory2Id]
      );
      const todoId = todoResult.rows[0].id;

      const deleteRes = await request(app)
        .delete(`/api/categories/${workCategory2Id}`)
        .set('Authorization', `Bearer ${accessTokenA}`);
      expect(deleteRes.status).toBe(204);
      expect(deleteRes.body).toEqual({});

      const todoAfter = await pool.query('SELECT category_id FROM todos WHERE id = $1', [
        todoId,
      ]);
      expect(todoAfter.rows[0].category_id).toBe(defaultCategoryId);

      const listResAfter = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${accessTokenA}`);
      expect(listResAfter.body.some((c) => c.name === '업무2')).toBe(false);
    });
  });
});
