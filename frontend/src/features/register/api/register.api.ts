import { apiFetch } from '../../../shared/api/client'
import type { User } from '../../../entities/user/api/user.api'

export type RegisterRequest = { email: string; password: string; name: string }
export type RegisterResponse = User

export function register(body: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/auth/register', { method: 'POST', body, skipAuth: true })
}
