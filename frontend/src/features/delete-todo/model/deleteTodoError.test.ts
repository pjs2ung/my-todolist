import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../shared/api/client'
import { mapDeleteTodoError } from './deleteTodoError'

describe('mapDeleteTodoError', () => {
  it('error가 null이면 null을 반환한다', () => {
    expect(mapDeleteTodoError(null)).toBeNull()
  })

  it('status 403이면 삭제 권한 없음 메시지를 반환한다', () => {
    const error = new ApiError(403, 'FORBIDDEN', '권한이 없습니다.')
    expect(mapDeleteTodoError(error)).toBe('삭제 권한이 없습니다')
  })

  it('status 404이면 이미 삭제됨 메시지를 반환한다', () => {
    const error = new ApiError(404, 'NOT_FOUND', '찾을 수 없습니다.')
    expect(mapDeleteTodoError(error)).toBe('이미 삭제된 할일입니다')
  })

  it('그 외 status는 null을 반환한다', () => {
    const error = new ApiError(500, 'UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다.')
    expect(mapDeleteTodoError(error)).toBeNull()
  })
})
