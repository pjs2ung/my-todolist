import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../../shared/api/client'

export type Category = {
  id: string
  userId: string
  name: string
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/categories'),
  })
}
