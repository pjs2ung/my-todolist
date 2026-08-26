const errorHandler = require('../src/middlewares/errorHandler');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('err.status와 err.code가 있으면 그대로 사용한다', () => {
    const err = Object.assign(new Error('forbidden'), { status: 403, code: 'CORS_NOT_ALLOWED' });
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ code: 'CORS_NOT_ALLOWED', message: 'forbidden' });
  });

  test('err.statusCode만 있으면 statusCode를 사용한다', () => {
    const err = Object.assign(new Error('not found'), { statusCode: 404 });
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ code: 'UNKNOWN_ERROR', message: 'not found' });
  });

  test('status/code가 없으면 500과 INTERNAL_SERVER_ERROR를 반환한다', () => {
    const err = new Error('boom');
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ code: 'INTERNAL_SERVER_ERROR', message: 'boom' });
  });

  test('500 에러는 콘솔에 로깅하고 스택트레이스를 응답 body에 노출하지 않는다', () => {
    const err = new Error('secret stack trace');
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(consoleErrorSpy).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body).toEqual({ code: 'INTERNAL_SERVER_ERROR', message: 'secret stack trace' });
    expect(body.stack).toBeUndefined();
  });

  test('500이 아닌 에러는 콘솔에 로깅하지 않는다', () => {
    const err = Object.assign(new Error('bad request'), { status: 400, code: 'VALIDATION_ERROR' });
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
