import type { TodoStatus } from './todoStatus'

export type Todo = {
  id: string
  userId: string
  categoryId: string
  title: string
  startDate: string
  endDate: string
  isDone: boolean
  status: TodoStatus
  createdAt: string
  updatedAt: string
}
