import type { ApiError } from '../../../shared/api/client'

export type TodoFormFieldErrors = { title?: string; categoryId?: string; endDate?: string; form?: string }

export function mapTodoFormError(error: ApiError | null): TodoFormFieldErrors {
  if (!error) return {}

  if (error.code === 'INVALID_DATE_RANGE') return { endDate: error.message }
  if (error.code === 'INVALID_CATEGORY') return { categoryId: error.message }
  if (error.code === 'VALIDATION_ERROR' && error.message.includes('제목')) return { title: error.message }

  return { form: error.message }
}
