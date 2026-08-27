import { useState } from 'react'
import './TodoForm.css'
import { DatePicker } from '../../../shared/ui/DatePicker'
import { useCategoriesQuery } from '../../../entities/category/api/category.api'
import { mapTodoFormError } from '../model/todoFormError'
import type { ApiError } from '../../../shared/api/client'

export type TodoFormValues = {
  title: string
  categoryId: string
  startDate: string
  endDate: string
  isDone: boolean
}

export type TodoFormProps = {
  mode: 'create' | 'edit'
  initialValues?: TodoFormValues
  onSubmit: (values: TodoFormValues) => void
  isPending: boolean
  error: ApiError | null
}

const EMPTY_VALUES: TodoFormValues = { title: '', categoryId: '', startDate: '', endDate: '', isDone: false }

export function TodoForm({ mode, initialValues, onSubmit, isPending, error }: TodoFormProps) {
  const [values, setValues] = useState<TodoFormValues>(initialValues ?? EMPTY_VALUES)
  const { data: categories } = useCategoriesQuery()
  const fieldErrors = mapTodoFormError(error)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="todo-form-field">
        <label htmlFor="todo-title">제목</label>
        <input
          id="todo-title"
          type="text"
          value={values.title}
          onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
          maxLength={100}
          required
        />
        {fieldErrors.title && <p className="todo-form-field-error">{fieldErrors.title}</p>}
      </div>

      <div className="todo-form-field">
        <label htmlFor="todo-category">카테고리</label>
        <select
          id="todo-category"
          value={values.categoryId}
          onChange={(e) => setValues((prev) => ({ ...prev, categoryId: e.target.value }))}
        >
          <option value="">선택 안 함(기본 적용)</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="todo-form-hint">선택하지 않으면 '기본' 카테고리가 자동 적용됩니다</p>
        {fieldErrors.categoryId && <p className="todo-form-field-error">{fieldErrors.categoryId}</p>}
      </div>

      <div className="todo-form-row">
        <div className="todo-form-field">
          <label htmlFor="todo-start-date">시작일</label>
          <DatePicker
            id="todo-start-date"
            value={values.startDate}
            onChange={(value) => setValues((prev) => ({ ...prev, startDate: value }))}
          />
        </div>
        <div className="todo-form-field">
          <label htmlFor="todo-end-date">종료일</label>
          <DatePicker
            id="todo-end-date"
            value={values.endDate}
            onChange={(value) => setValues((prev) => ({ ...prev, endDate: value }))}
            min={values.startDate || undefined}
          />
          {fieldErrors.endDate && <p className="todo-form-field-error">{fieldErrors.endDate}</p>}
        </div>
      </div>

      {mode === 'edit' && (
        <div className="todo-form-field todo-form-checkbox">
          <label htmlFor="todo-is-done">
            <input
              id="todo-is-done"
              type="checkbox"
              checked={values.isDone}
              onChange={(e) => setValues((prev) => ({ ...prev, isDone: e.target.checked }))}
            />
            완료 처리
          </label>
        </div>
      )}

      {fieldErrors.form && <p className="todo-form-error">{fieldErrors.form}</p>}

      <button type="submit" className="todo-form-submit-button" disabled={isPending}>
        저장
      </button>
    </form>
  )
}
