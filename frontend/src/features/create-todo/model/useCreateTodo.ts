import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createTodo } from '../api/createTodo.api'
import type { CreateTodoRequest } from '../api/createTodo.api'
import type { ApiError } from '../../../shared/api/client'
import type { Todo } from '../../../entities/todo/model/todo.types'

export function useCreateTodo() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<Todo, ApiError, CreateTodoRequest>({
    mutationFn: createTodo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      if (import.meta.env.DEV) {
        console.log('[create-todo] 등록 성공', data.id)
      }
      navigate('/todos')
    },
  })
}
