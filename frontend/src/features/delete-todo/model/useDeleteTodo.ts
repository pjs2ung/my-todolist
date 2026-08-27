import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTodo } from '../api/deleteTodo.api'
import { mapDeleteTodoError } from './deleteTodoError'
import type { ApiError } from '../../../shared/api/client'
import { useLocaleStore } from '../../../shared/lib/localeStore'

export function useDeleteTodo(onSuccess: () => void, onError?: (message: string) => void) {
  const queryClient = useQueryClient()
  const locale = useLocaleStore((s) => s.locale)

  return useMutation<void, ApiError, string>({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      if (import.meta.env.DEV) {
        console.log('[delete-todo] 삭제 성공')
      }
      onSuccess()
    },
    onError: (error) => {
      if (error.status === 404) {
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }
      onError?.(mapDeleteTodoError(error, locale) ?? error.message)
    },
  })
}
