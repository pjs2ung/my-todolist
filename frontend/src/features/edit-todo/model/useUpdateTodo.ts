import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { updateTodo } from '../api/updateTodo.api'
import type { UpdateTodoRequest } from '../api/updateTodo.api'
import type { ApiError } from '../../../shared/api/client'
import type { Todo } from '../../../entities/todo/model/todo.types'

export function useUpdateTodo(id: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<Todo, ApiError, UpdateTodoRequest>({
    mutationFn: (body) => updateTodo(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      if (import.meta.env.DEV) {
        console.log('[edit-todo] 수정 성공', data.id)
      }
      navigate('/todos')
    },
  })
}
