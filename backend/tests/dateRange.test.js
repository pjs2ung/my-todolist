const { isValidDateRange } = require('../src/services/todos.service');

describe('isValidDateRange (BE-09, BR-05)', () => {
  test('startDate < endDate면 true', () => {
    expect(isValidDateRange('2026-08-01', '2026-08-10')).toBe(true);
  });
  test('startDate === endDate면 true (경계값)', () => {
    expect(isValidDateRange('2026-08-27', '2026-08-27')).toBe(true);
  });
  test('startDate > endDate면 false (위반)', () => {
    expect(isValidDateRange('2026-08-10', '2026-08-01')).toBe(false);
  });
});
