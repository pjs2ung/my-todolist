jest.resetModules();
process.env.CORS_ORIGIN = 'http://allowed-origin.com,http://another-allowed.com';
jest.doMock('../src/db/pool', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
}));

const request = require('supertest');
const app = require('../src/app');

describe('CORS', () => {
  test('allowlist에 있는 Origin은 정상 응답 + Access-Control-Allow-Origin 헤더를 포함한다', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://allowed-origin.com');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://allowed-origin.com');
  });

  test('allowlist에 없는 Origin은 403과 CORS_NOT_ALLOWED 코드를 반환한다', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://not-allowed.com');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      code: 'CORS_NOT_ALLOWED',
      message: expect.any(String),
    });
  });

  test('Origin 헤더가 없는 요청은 정상 허용된다', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
  });
});
