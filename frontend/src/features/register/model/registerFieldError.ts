import type { ApiError } from '../../../shared/api/client'

export type RegisterFieldErrors = { email?: string; name?: string; password?: string; form?: string }

export function mapRegisterFieldError(error: ApiError | null): RegisterFieldErrors {
  if (!error) return {}

  if (error.code === 'EMAIL_TAKEN') {
    return { email: error.message }
  }

  if (error.message.includes('이메일')) return { email: error.message }
  if (error.message.includes('비밀번호')) return { password: error.message }
  if (error.message.includes('이름')) return { name: error.message }

  return { form: error.message }
}
