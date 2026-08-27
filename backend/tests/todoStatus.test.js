const { getTodoStatus, toLocalDateStr } = require('../src/utils/todoStatus');

describe('getTodoStatus (BE-08)', () => {
  const today = '2026-08-27';

  test('isDone true면 날짜와 무관하게 done', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-01', endDate: '2026-08-10', isDone: true },
        today
      )
    ).toBe('done');
  });

  test('startDate가 오늘보다 미래면 not_started', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-09-01', endDate: '2026-09-10', isDone: false },
        today
      )
    ).toBe('not_started');
  });

  test('오늘이 구간 내부면 in_progress', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-20', endDate: '2026-08-30', isDone: false },
        today
      )
    ).toBe('in_progress');
  });

  test('endDate가 오늘보다 과거면 overdue', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-01', endDate: '2026-08-10', isDone: false },
        today
      )
    ).toBe('overdue');
  });

  test('경계값: startDate === 오늘이면 in_progress', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-27', endDate: '2026-09-10', isDone: false },
        today
      )
    ).toBe('in_progress');
  });

  test('경계값: endDate === 오늘이면 in_progress', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-01', endDate: '2026-08-27', isDone: false },
        today
      )
    ).toBe('in_progress');
  });

  test('경계값: startDate === endDate === 오늘이면 in_progress', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-27', endDate: '2026-08-27', isDone: false },
        today
      )
    ).toBe('in_progress');
  });

  test('today 인자 생략 시 기본값(new Date())으로 동작', () => {
    const todayStr = toLocalDateStr(new Date());
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const endStr = toLocalDateStr(future);

    expect(
      getTodoStatus({ startDate: todayStr, endDate: endStr, isDone: false })
    ).toBe('in_progress');
  });

  test('toLocalDateStr은 로컬 타임존 기준 YYYY-MM-DD 문자열을 반환', () => {
    const d = new Date(2026, 0, 5); // 2026-01-05 (월은 0-indexed)
    expect(toLocalDateStr(d)).toBe('2026-01-05');

    const d2 = new Date(2026, 11, 31); // 2026-12-31
    expect(toLocalDateStr(d2)).toBe('2026-12-31');
  });
});
