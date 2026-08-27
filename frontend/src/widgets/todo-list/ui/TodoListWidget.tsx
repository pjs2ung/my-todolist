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
import { DatePicker } from '../../../shared/ui/DatePicker'
import { ThemeToggle } from '../../../shared/ui/ThemeToggle'
import { LocaleToggle } from '../../../shared/ui/LocaleToggle'
import { LogoutButton } from '../../../features/logout/ui/LogoutButton'
import { useT } from '../../../shared/lib/localeStore'

export function TodoListWidget() {
  const t = useT()
  const { data: categories } = useCategoriesQuery()
  const { filters, setCategoryId, setStatus, resetFilters } = useTodoFilters()
  const { data: todos, isLoading, isError, error } = useTodosQuery(filters)
  const location = useLocation()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [titleQuery, setTitleQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
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
      setToast(t.toast_deleted)
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

  const visibleTodos = useMemo(
    () =>
      todos?.filter((todo) => {
        const matchesTitle = todo.title.toLowerCase().includes(titleQuery.trim().toLowerCase())
        const matchesFrom = !dateFrom || todo.endDate >= dateFrom
        const matchesTo = !dateTo || todo.startDate <= dateTo
        return matchesTitle && matchesFrom && matchesTo
      }),
    [todos, titleQuery, dateFrom, dateTo]
  )

  function handleCategorySelect(categoryId: string | undefined) {
    if (import.meta.env.DEV) {
      console.log('[filter-todos] 카테고리 필터 변경', categoryId)
    }
    setCategoryId(categoryId)
  }

  const hasActiveFilters =
    filters.categoryId !== undefined ||
    filters.status !== undefined ||
    titleQuery.trim() !== '' ||
    dateFrom !== '' ||
    dateTo !== ''

  function handleResetFilters() {
    resetFilters()
    setTitleQuery('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="todo-list-widget">
      <aside className="todo-list-sidebar">
        <div className="todo-list-sidebar-sticky">
          <div className="todo-list-sidebar-inner">
            <CategoryFilter
              categories={categories ?? []}
              selectedCategoryId={filters.categoryId}
              onSelect={handleCategorySelect}
            />
            <div className="todo-list-sidebar-mascot">
              <img src="/sidebar-mascot.svg" alt="" />
            </div>
            <div className="todo-list-sidebar-footer">
              <ThemeToggle />
              <LocaleToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>
      <div className="todo-list-main">
        <div className="todo-list-sticky-toolbar">
          <div className="todo-list-header">
            <h1 className="todo-list-title">{t.todo_list_title}</h1>
            <div className="todo-list-header-actions">
              <Link to="/categories" className="todo-list-manage-categories-button">
                {t.manage_categories}
              </Link>
              <Link to="/todos/new" className="todo-list-add-button">
                +<span className="todo-list-add-button-label"> {t.new_todo}</span>
              </Link>
            </div>
          </div>
          {toast && <p className="todo-list-toast">{toast}</p>}
          <div className="todo-list-filter-row">
            <div className="todo-list-status-group">
              <StatusFilter selectedStatus={filters.status} onSelect={setStatus} />
              {hasActiveFilters && (
                <button type="button" className="todo-list-reset-button" onClick={handleResetFilters}>
                  {t.reset_filters}
                </button>
              )}
            </div>
            <div className="todo-list-search-group">
              <input
                type="text"
                className="todo-list-search-input"
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
                placeholder={t.search_placeholder}
                aria-label={t.search_placeholder}
              />
              <div className="todo-list-date-range">
                <DatePicker
                  value={dateFrom || null}
                  onChange={setDateFrom}
                  max={dateTo || undefined}
                  aria-label={t.date_from_label}
                />
                <span className="todo-list-date-range-separator">~</span>
                <DatePicker
                  value={dateTo || null}
                  onChange={setDateTo}
                  min={dateFrom || undefined}
                  aria-label={t.date_to_label}
                />
              </div>
            </div>
          </div>
        </div>
        {isLoading && <p>{t.loading}</p>}
        {isError && <p className="todo-list-error">{error.message}</p>}
        {!isLoading && !isError && visibleTodos?.length === 0 && (
          <p className="todo-list-empty">{t.empty_todos}</p>
        )}
        {!isLoading && !isError && visibleTodos && visibleTodos.length > 0 && (
          <div className="todo-list-cards">
            {visibleTodos.map((todo) => (
              <div className="todo-list-card-wrapper" key={todo.id}>
                <Link to={`/todos/${todo.id}/edit`} className="todo-list-card-link">
                  <TodoCard todo={todo} categoryName={categoryNameMap.get(todo.categoryId) ?? ''} />
                </Link>
                <button
                  type="button"
                  className="todo-list-card-delete-button"
                  onClick={() => setDeleteTarget({ id: todo.id, title: todo.title })}
                >
                  {t.delete}
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
