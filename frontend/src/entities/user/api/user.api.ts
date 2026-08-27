import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../../shared/api/client'

export type User = {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export function useUserQuery() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiFetch<User>('/users/me'),
  })
}
