import type { ApiError } from '../../../shared/api/client'

export function mapDeleteTodoError(error: ApiError | null): string | null {
  if (!error) return null
  if (error.status === 403) return '삭제 권한이 없습니다'
  if (error.status === 404) return '이미 삭제된 할일입니다'
  return null
}
