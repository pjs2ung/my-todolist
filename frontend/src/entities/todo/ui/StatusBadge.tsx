import './StatusBadge.css'
import type { TodoStatus } from '../model/todoStatus'
import { useT } from '../../../shared/lib/localeStore'

export type StatusBadgeProps = {
  status: TodoStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useT()
  const STATUS_LABEL: Record<TodoStatus, string> = {
    not_started: t.status_not_started,
    in_progress: t.status_in_progress,
    done: t.status_done_badge,
    overdue: t.status_overdue,
  }

  return (
    <span className={`todo-status-badge todo-status-badge--${status}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
