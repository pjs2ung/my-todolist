import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './TodoListWidget.css'
import { useCategoriesQuery } from '../../../entities/category/api/category.api'
import { useTodosQuery } from '../../../entities/todo/api/todo.api'
import { TodoCard } from '../../../entities/todo/ui/TodoCard'
import { useTodoFilters } from '../../../features/filter-todos/model/useTodoFilters'
import { CategoryFilter } from '../../../features/filter-todos/ui/CategoryFilter'
import { StatusFilter } from '../../../features/filter-todos/ui/StatusFilter'
import { useDeleteTodo } from '../../../features/delete-todo/model/useDeleteTodo'
import { ConfirmDeleteDialog } from '../../../features/delete-todo/ui/ConfirmDeleteDialog'

export function TodoListWidget() {
  const { data: categories } = useCategoriesQuery()
  const { filters, setCategoryId, setStatus } = useTodoFilters()
  const { data: todos, isLoading, isError, error } = useTodosQuery(filters)
  const location = useLocation()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null
  )

  useEffect(() => {
    if ((location.state as { toast?: string } | null)?.toast) {
      navigate(location.pathname, { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteMutation = useDeleteTodo(
    () => {
      setToast('삭제되었습니다')
      setDeleteTarget(null)
    },
    (message) => {
      if (import.meta.env.DEV) {
        console.log('[delete-todo] 삭제 실패', message)
      }
    }
  )

  const categoryNameMap = useMemo(
    () => new Map(categories?.map((c) => [c.id, c.name]) ?? []),
    [categories]
  )

  function handleCategorySelect(categoryId: string | undefined) {
    if (import.meta.env.DEV) {
      console.log('[filter-todos] 카테고리 필터 변경', categoryId)
    }
    setCategoryId(categoryId)
  }

  return (
    <div className="todo-list-widget">
      <aside className="todo-list-sidebar">
        <CategoryFilter
          categories={categories ?? []}
          selectedCategoryId={filters.categoryId}
          onSelect={handleCategorySelect}
        />
      </aside>
      <div className="todo-list-main">
        <div className="todo-list-header">
          <h1 className="todo-list-title">할일 목록</h1>
          <Link to="/todos/new" className="todo-list-add-button">
            +<span className="todo-list-add-button-label"> 새 할일 등록</span>
          </Link>
        </div>
        {toast && <p className="todo-list-toast">{toast}</p>}
        <StatusFilter selectedStatus={filters.status} onSelect={setStatus} />
        {isLoading && <p>불러오는 중...</p>}
        {isError && <p className="todo-list-error">{error.message}</p>}
        {!isLoading && !isError && todos?.length === 0 && (
          <p className="todo-list-empty">할일이 없습니다</p>
        )}
        {!isLoading && !isError && todos && todos.length > 0 && (
          <div className="todo-list-cards">
            {todos.map((todo) => (
              <div className="todo-list-card-wrapper" key={todo.id}>
                <Link to={`/todos/${todo.id}/edit`} className="todo-list-card-link">
                  <TodoCard todo={todo} categoryName={categoryNameMap.get(todo.categoryId) ?? ''} />
                </Link>
                <button
                  type="button"
                  className="todo-list-card-delete-button"
                  onClick={() => setDeleteTarget({ id: todo.id, title: todo.title })}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {deleteTarget && (
        <ConfirmDeleteDialog
          todoTitle={deleteTarget.title}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
