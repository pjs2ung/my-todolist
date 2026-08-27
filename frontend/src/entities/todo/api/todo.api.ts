import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../../shared/api/client'
import type { Todo } from '../model/todo.types'
import type { TodoStatus } from '../model/todoStatus'

export type TodoListParams = {
  categoryId?: string
  status?: TodoStatus
}

export function useTodosQuery(params: TodoListParams = {}) {
  return useQuery({
    queryKey: ['todos', params.categoryId ?? null, params.status ?? null],
    queryFn: () => {
      const query = new URLSearchParams()
      if (params.categoryId) query.set('categoryId', params.categoryId)
      if (params.status) query.set('status', params.status)
      const queryString = query.toString()
      return apiFetch<Todo[]>(`/todos${queryString ? `?${queryString}` : ''}`)
    },
  })
}
