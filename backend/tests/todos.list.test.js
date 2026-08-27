const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');

const uniqueEmail = () =>
  `be08-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

function dayOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

describe('GET /api/todos 목록 조회/필터링 (BE-08)', () => {
  let accessTokenA;
  let accessTokenB;
  let defaultCategoryIdA;
  let extraCategoryIdA;

  let doneTodoId;
  let notStartedTodoId;
  let inProgressTodoId;
  let overdueTodoId;
  let boundaryStartTodoId;
  let boundaryEndTodoId;

  beforeAll(async () => {
    const emailA = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ email: emailA, password: 'password123', name: '목록테스터A' });
    const loginResA = await request(app)
      .post('/api/auth/login')
      .send({ email: emailA, password: 'password123' });
    accessTokenA = loginResA.body.accessToken;

    const emailB = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ email: emailB, password: 'password123', name: '목록테스터B' });
    const loginResB = await request(app)
      .post('/api/auth/login')
      .send({ email: emailB, password: 'password123' });
    accessTokenB = loginResB.body.accessToken;

    const categoriesResA = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${accessTokenA}`);
    defaultCategoryIdA = categoriesResA.body.find((c) => c.name === '기본').id;

    const createCategoryResA = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessTokenA}`)
      .send({ name: `필터전용-${Date.now()}` });
    extraCategoryIdA = createCategoryResA.body.id;

    // 완료
    const doneRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessTokenA}`)
      .send({
        categoryId: defaultCategoryIdA,
        title: '완료할일',
        startDate: dayOffset(-10),
        endDate: dayOffset(-5),
      });
    doneTodoId = doneRes.body.id;
    await request(app)
      .patch(`/api/todos/${doneTodoId}`)
      .set('Authorization', `Bearer ${accessTokenA}`)
      .send({ isDone: true });

    // 시작전
    const notStartedRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessTokenA}`)
      .send({
        categoryId: defaultCategoryIdA,
        title: '시작전할일',
        startDate: dayOffset(5),
        endDate: dayOffset(10),
      });
    notStartedTodoId = notStartedRes.body.id;

    // 진행중(일반)
    const inProgressRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessTokenA}`)
      .send({
        categoryId: defaultCategoryIdA,
        title: '진행중할일',
        startDate: dayOffset(-3),
        endDate: dayOffset(3),
      });
    inProgressTodoId = inProgressRes.body.id;

    // 지연
    const overdueRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessTokenA}`)
      .send({
        categoryId: defaultCategoryIdA,
        title: '지연할일',
        startDate: dayOffset(-10),
        endDate: dayOffset(-1),
      });
    overdueTodoId = overdueRes.body.id;

    // 경계값(startDate == 오늘)
    const boundaryStartRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessTokenA}`)
      .send({
        categoryId: defaultCategoryIdA,
        title: '경계값시작할일',
        startDate: dayOffset(0),
        endDate: dayOffset(5),
      });
    boundaryStartTodoId = boundaryStartRes.body.id;

    // 경계값(endDate == 오늘, 별도 카테고리)
    const boundaryEndRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessTokenA}`)
      .send({
        categoryId: extraCategoryIdA,
        title: '경계값종료할일',
        startDate: dayOffset(-5),
        endDate: dayOffset(0),
      });
    boundaryEndTodoId = boundaryEndRes.body.id;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email LIKE 'be08-%@example.com'");
  });

  test('인증 헤더 없으면 401', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(401);
  });

  test('필터 없이 호출하면 200과 본인 소유 Todo 전체(status 필드 포함)', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${accessTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(6);
    res.body.forEach((todo) => {
      expect(todo.status).toBeDefined();
    });
  });

  test('categoryId 필터: 별도 카테고리 Todo만 반환', async () => {
    const res = await request(app)
      .get(`/api/todos?categoryId=${extraCategoryIdA}`)
      .set('Authorization', `Bearer ${accessTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(boundaryEndTodoId);
  });

  test('categoryId 형식 오류면 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .get('/api/todos?categoryId=not-a-uuid')
      .set('Authorization', `Bearer ${accessTokenA}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  test('status=done 필터', async () => {
    const res = await request(app)
      .get('/api/todos?status=done')
      .set('Authorization', `Bearer ${accessTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(doneTodoId);
    expect(res.body[0].status).toBe('done');
  });

  test('status=not_started 필터', async () => {
    const res = await request(app)
      .get('/api/todos?status=not_started')
      .set('Authorization', `Bearer ${accessTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(notStartedTodoId);
    expect(res.body[0].status).toBe('not_started');
  });

  test('status=overdue 필터', async () => {
    const res = await request(app)
      .get('/api/todos?status=overdue')
      .set('Authorization', `Bearer ${accessTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(overdueTodoId);
    expect(res.body[0].status).toBe('overdue');
  });

  test('status=in_progress 필터: 일반 진행중 + 경계값 2건', async () => {
    const res = await request(app)
      .get('/api/todos?status=in_progress')
      .set('Authorization', `Bearer ${accessTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    const ids = res.body.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining([inProgressTodoId, boundaryStartTodoId, boundaryEndTodoId])
    );
    res.body.forEach((todo) => {
      expect(todo.status).toBe('in_progress');
    });
  });

  test('허용되지 않은 status 값이면 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .get('/api/todos?status=foo')
      .set('Authorization', `Bearer ${accessTokenA}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  test('Todo가 없는 사용자(B)는 200과 빈 배열', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${accessTokenB}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('매칭되는 Todo가 없는 categoryId면 200과 빈 배열', async () => {
    const res = await request(app)
      .get('/api/todos?categoryId=00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessTokenA}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
