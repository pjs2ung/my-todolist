import { apiFetch } from '../../../shared/api/client'

export function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST', skipAuth: true })
}
