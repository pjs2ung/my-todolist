import { apiFetch } from '../../../shared/api/client'
import type { User } from '../../../entities/user/api/user.api'

export type UpdateProfileRequest = { name: string }
export type UpdateProfileResponse = User

export function updateProfile(body: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  return apiFetch<UpdateProfileResponse>('/users/me', { method: 'PATCH', body })
}
