import { apiFetch } from '../../../shared/api/client'
import type { Todo } from '../../../entities/todo/model/todo.types'

export type CreateTodoRequest = { title: string; categoryId?: string; startDate: string; endDate: string }

export function createTodo(body: CreateTodoRequest): Promise<Todo> {
  return apiFetch<Todo>('/todos', { method: 'POST', body })
}
