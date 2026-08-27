import type { ApiError } from '../../../shared/api/client'
import type { Locale } from '../../../shared/lib/i18n'
import { getMessages } from '../../../shared/lib/i18n'

export type RegisterFieldErrors = { email?: string; name?: string; password?: string; form?: string }

export function mapRegisterFieldError(error: ApiError | null, locale: Locale = 'ko'): RegisterFieldErrors {
  if (!error) return {}
  const t = getMessages(locale)

  // 서버 메시지는 항상 한국어로 내려오므로, 필드 분류는 한국어 부분 문자열로 판별하고
  // 화면에 보여줄 문구만 현재 언어로 치환한다.
  if (error.code === 'EMAIL_TAKEN') return { email: t.error_email_taken }
  if (error.message.includes('이메일')) return { email: t.error_email_format }
  if (error.message.includes('비밀번호')) return { password: t.error_password_length }
  if (error.message.includes('이름')) return { name: t.error_name_length }

  return { form: error.message }
}
