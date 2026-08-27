import { apiFetch } from '../../../shared/api/client'
import type { Category } from '../../../entities/category/api/category.api'

export type CategoryNameRequest = { name: string }

export function createCategory(body: CategoryNameRequest): Promise<Category> {
  return apiFetch<Category>('/categories', { method: 'POST', body })
}

export function updateCategory(id: string, body: CategoryNameRequest): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', body })
}

export function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, { method: 'DELETE' })
}
