import { describe, expect, it } from 'vitest'
import { getTodoStatus } from './todoStatus'
import { formatDate } from '../../../shared/lib/formatDate'

describe('getTodoStatus', () => {
  const today = '2026-08-27'

  it('isDone true면 날짜와 무관하게 done', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-01', endDate: '2026-08-10', isDone: true },
        today
      )
    ).toBe('done')
  })

  it('startDate가 오늘보다 미래면 not_started', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-09-01', endDate: '2026-09-10', isDone: false },
        today
      )
    ).toBe('not_started')
  })

  it('오늘이 구간 내부면 in_progress', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-20', endDate: '2026-08-30', isDone: false },
        today
      )
    ).toBe('in_progress')
  })

  it('endDate가 오늘보다 과거면 overdue', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-01', endDate: '2026-08-10', isDone: false },
        today
      )
    ).toBe('overdue')
  })

  it('경계값: startDate === 오늘이면 in_progress', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-27', endDate: '2026-09-10', isDone: false },
        today
      )
    ).toBe('in_progress')
  })

  it('경계값: endDate === 오늘이면 in_progress', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-01', endDate: '2026-08-27', isDone: false },
        today
      )
    ).toBe('in_progress')
  })

  it('경계값: startDate === endDate === 오늘이면 in_progress', () => {
    expect(
      getTodoStatus(
        { startDate: '2026-08-27', endDate: '2026-08-27', isDone: false },
        today
      )
    ).toBe('in_progress')
  })

  it('today 인자 생략 시 기본값(new Date())으로 동작', () => {
    const todayStr = formatDate(new Date())
    const future = new Date()
    future.setDate(future.getDate() + 5)
    const endStr = formatDate(future)

    expect(
      getTodoStatus({ startDate: todayStr, endDate: endStr, isDone: false })
    ).toBe('in_progress')
  })

  it('today를 Date 객체로 줘도 문자열과 동일하게 동작한다', () => {
    const todayDate = new Date(2026, 7, 27) // 2026-08-27 (월은 0-indexed)

    expect(
      getTodoStatus(
        { startDate: '2026-08-20', endDate: '2026-08-30', isDone: false },
        todayDate
      )
    ).toBe('in_progress')

    expect(
      getTodoStatus(
        { startDate: '2026-08-01', endDate: '2026-08-10', isDone: false },
        todayDate
      )
    ).toBe('overdue')
  })
})
