import './StatusBadge.css'
import type { TodoStatus } from '../model/todoStatus'

export type StatusBadgeProps = {
  status: TodoStatus
}

const STATUS_LABEL: Record<TodoStatus, string> = {
  not_started: '시작전',
  in_progress: '진행중',
  done: '완료 ✓',
  overdue: '지연',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`todo-status-badge todo-status-badge--${status}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
