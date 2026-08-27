import { useState } from 'react'
import './TodoForm.css'
import { DatePicker } from '../../../shared/ui/DatePicker'
import { useCategoriesQuery } from '../../../entities/category/api/category.api'
import { mapTodoFormError } from '../model/todoFormError'
import type { ApiError } from '../../../shared/api/client'
import { useLocaleStore, useT } from '../../../shared/lib/localeStore'

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
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const [values, setValues] = useState<TodoFormValues>(initialValues ?? EMPTY_VALUES)
  const { data: categories } = useCategoriesQuery()
  const fieldErrors = mapTodoFormError(error, locale)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="todo-form-field">
        <label htmlFor="todo-title">{t.field_title}</label>
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
        <label htmlFor="todo-category">{t.field_category}</label>
        <select
          id="todo-category"
          value={values.categoryId}
          onChange={(e) => setValues((prev) => ({ ...prev, categoryId: e.target.value }))}
        >
          <option value="">{t.category_none_option}</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="todo-form-hint">{t.category_default_hint}</p>
        {fieldErrors.categoryId && <p className="todo-form-field-error">{fieldErrors.categoryId}</p>}
      </div>

      <div className="todo-form-row">
        <div className="todo-form-field">
          <label htmlFor="todo-start-date">{t.field_start_date}</label>
          <DatePicker
            id="todo-start-date"
            value={values.startDate}
            onChange={(value) => setValues((prev) => ({ ...prev, startDate: value }))}
          />
        </div>
        <div className="todo-form-field">
          <label htmlFor="todo-end-date">{t.field_end_date}</label>
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
            {t.field_done}
          </label>
        </div>
      )}

      {fieldErrors.form && <p className="todo-form-error">{fieldErrors.form}</p>}

      <button type="submit" className="todo-form-submit-button" disabled={isPending}>
        {t.save}
      </button>
    </form>
  )
}
