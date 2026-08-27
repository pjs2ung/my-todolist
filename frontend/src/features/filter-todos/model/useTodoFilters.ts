import { useState } from 'react'
import type { TodoStatus } from '../../../entities/todo/model/todoStatus'

export type TodoFilters = { categoryId?: string; status?: TodoStatus }

export function useTodoFilters() {
  const [filters, setFilters] = useState<TodoFilters>({})

  function setCategoryId(categoryId: string | undefined) {
    setFilters((prev) => ({ ...prev, categoryId }))
  }

  function setStatus(status: TodoStatus | undefined) {
    setFilters((prev) => ({ ...prev, status }))
  }

  function resetFilters() {
    setFilters({})
  }

  return { filters, setCategoryId, setStatus, resetFilters }
}
