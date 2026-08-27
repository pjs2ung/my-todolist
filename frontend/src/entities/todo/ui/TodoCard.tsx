import './TodoCard.css'
import type { Todo } from '../model/todo.types'
import { StatusBadge } from './StatusBadge'

export type TodoCardProps = {
  todo: Todo
  categoryName: string
}

export function TodoCard({ todo, categoryName }: TodoCardProps) {
  return (
    <div className="todo-card">
      <div className="todo-card-header">
        <h3 className="todo-card-title">{todo.title}</h3>
        <StatusBadge status={todo.status} />
      </div>
      <p className="todo-card-meta">
        {categoryName} · {todo.startDate} ~ {todo.endDate}
      </p>
    </div>
  )
}
