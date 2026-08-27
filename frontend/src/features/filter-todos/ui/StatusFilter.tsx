import './StatusFilter.css'
import type { TodoStatus } from '../../../entities/todo/model/todoStatus'
import { useT } from '../../../shared/lib/localeStore'

export type StatusFilterProps = {
  selectedStatus?: TodoStatus
  onSelect: (status: TodoStatus | undefined) => void
}

export function StatusFilter({ selectedStatus, onSelect }: StatusFilterProps) {
  const t = useT()
  const STATUS_OPTIONS: { value: TodoStatus | undefined; label: string; colorKey: string }[] = [
    { value: undefined, label: t.status_all, colorKey: 'all' },
    { value: 'not_started', label: t.status_not_started, colorKey: 'not_started' },
    { value: 'in_progress', label: t.status_in_progress, colorKey: 'in_progress' },
    { value: 'done', label: t.status_done, colorKey: 'done' },
    { value: 'overdue', label: t.status_overdue, colorKey: 'overdue' },
  ]

  return (
    <div className="status-filter">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          className={
            selectedStatus === option.value
              ? `status-filter-item status-filter-item--${option.colorKey} status-filter-item--active`
              : `status-filter-item status-filter-item--${option.colorKey}`
          }
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
