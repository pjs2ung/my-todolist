import { apiFetch } from '../../../shared/api/client'
import type { Todo } from '../../../entities/todo/model/todo.types'

export type UpdateTodoRequest = {
  title?: string
  categoryId?: string
  startDate?: string
  endDate?: string
  isDone?: boolean
}

export function updateTodo(id: string, body: UpdateTodoRequest): Promise<Todo> {
  return apiFetch<Todo>(`/todos/${id}`, { method: 'PATCH', body })
}
