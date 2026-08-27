import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory, updateCategory, deleteCategory } from '../api/categoryMutations.api'
import type { CategoryNameRequest } from '../api/categoryMutations.api'
import type { Category } from '../../../entities/category/api/category.api'
import type { ApiError } from '../../../shared/api/client'

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation<Category, ApiError, CategoryNameRequest>({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      if (import.meta.env.DEV) {
        console.log('[useCreateCategory] 카테고리 생성 성공')
      }
    },
  })
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Category, ApiError, CategoryNameRequest>({
    mutationFn: (body) => updateCategory(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      if (import.meta.env.DEV) {
        console.log('[useUpdateCategory] 카테고리 수정 성공', id)
      }
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      if (import.meta.env.DEV) {
        console.log('[useDeleteCategory] 카테고리 삭제 성공')
      }
    },
  })
}
