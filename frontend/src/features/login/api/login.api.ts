import { apiFetch } from '../../../shared/api/client'
import type { User } from '../../../entities/user/api/user.api'

export type LoginRequest = { email: string; password: string }
export type LoginResponse = { accessToken: string; user: User }

export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', { method: 'POST', body, skipAuth: true })
}
