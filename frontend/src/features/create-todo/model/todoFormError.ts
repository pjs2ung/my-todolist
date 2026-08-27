import type { ApiError } from '../../../shared/api/client'
import type { Locale } from '../../../shared/lib/i18n'
import { getMessages } from '../../../shared/lib/i18n'

export type TodoFormFieldErrors = { title?: string; categoryId?: string; endDate?: string; form?: string }

export function mapTodoFormError(error: ApiError | null, locale: Locale = 'ko'): TodoFormFieldErrors {
  if (!error) return {}
  const t = getMessages(locale)

  if (error.code === 'INVALID_DATE_RANGE') return { endDate: t.error_date_range }
  if (error.code === 'INVALID_CATEGORY') return { categoryId: t.error_invalid_category }
  if (error.code === 'VALIDATION_ERROR' && error.message.includes('제목')) return { title: t.error_title_length }

  return { form: error.message }
}
