import { apiFetch } from '../../../shared/api/client'

export function deleteTodo(id: string): Promise<void> {
  return apiFetch<void>(`/todos/${id}`, { method: 'DELETE' })
}
