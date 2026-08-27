import { describe, expect, it } from 'vitest'
import { formatDate, parseDate } from './formatDate'

describe('formatDate', () => {
  it('한 자리 월/일을 zero-pad 한다', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('연초 경계(1/1)를 정확히 반환한다 (타임존 밀림 없음)', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('2026-01-01')
  })

  it('연말 경계(12/31)를 정확히 반환한다', () => {
    expect(formatDate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('parseDate', () => {
  it('YYYY-MM-DD 문자열을 로컬 자정 Date로 파싱한다', () => {
    const d = parseDate('2026-01-05')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(5)
  })
})

describe('formatDate <-> parseDate 왕복', () => {
  it.each(['2026-01-01', '2026-01-05', '2026-12-31', '2024-02-29'])(
    '%s 왕복 시 동일한 문자열을 반환한다',
    (value) => {
      expect(formatDate(parseDate(value))).toBe(value)
    },
  )
})
