import './StatusFilter.css'
import type { TodoStatus } from '../../../entities/todo/model/todoStatus'

export type StatusFilterProps = {
  selectedStatus?: TodoStatus
  onSelect: (status: TodoStatus | undefined) => void
}

const STATUS_OPTIONS: { value: TodoStatus | undefined; label: string }[] = [
  { value: undefined, label: '전체' },
  { value: 'not_started', label: '시작전' },
  { value: 'in_progress', label: '진행중' },
  { value: 'done', label: '완료' },
  { value: 'overdue', label: '지연' },
]

export function StatusFilter({ selectedStatus, onSelect }: StatusFilterProps) {
  return (
    <div className="status-filter">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          className={selectedStatus === option.value ? 'status-filter-item status-filter-item--active' : 'status-filter-item'}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
