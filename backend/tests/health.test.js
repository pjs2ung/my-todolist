process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const request = require('supertest');

describe('GET /health', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('DB 쿼리 성공 시 200과 connected 상태를 반환한다', async () => {
    jest.resetModules();
    jest.doMock('../src/db/pool', () => ({
      query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
    }));
    const app = require('../src/app');

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });

  test('DB 쿼리 실패 시 500과 DB_UNAVAILABLE 코드를 반환한다', async () => {
    jest.resetModules();
    jest.doMock('../src/db/pool', () => ({
      query: jest.fn().mockRejectedValue(new Error('connection refused')),
    }));
    const app = require('../src/app');

    const res = await request(app).get('/health');

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('DB_UNAVAILABLE');
    expect(typeof res.body.message).toBe('string');
  });
});
