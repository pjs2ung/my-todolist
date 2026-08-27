import type { ApiError } from '../../../shared/api/client'
import type { Locale } from '../../../shared/lib/i18n'
import { getMessages } from '../../../shared/lib/i18n'

export function mapDeleteTodoError(error: ApiError | null, locale: Locale = 'ko'): string | null {
  if (!error) return null
  const t = getMessages(locale)
  if (error.status === 403) return t.delete_forbidden
  if (error.status === 404) return t.delete_not_found
  return null
}
