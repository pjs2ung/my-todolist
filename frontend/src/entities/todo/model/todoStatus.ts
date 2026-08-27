import { formatDate } from '../../../shared/lib/formatDate'

export type TodoStatus = 'not_started' | 'in_progress' | 'done' | 'overdue'

export function getTodoStatus(
  todo: { startDate: string; endDate: string; isDone: boolean },
  today: string | Date = new Date()
): TodoStatus {
  if (todo.isDone) return 'done'
  const todayStr = typeof today === 'string' ? today : formatDate(today)
  if (todayStr < todo.startDate) return 'not_started'
  if (todayStr <= todo.endDate) return 'in_progress'
  return 'overdue'
}
