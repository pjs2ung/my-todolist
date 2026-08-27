import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import './TodoFormPage.css'
import { useTodosQuery } from '../../entities/todo/api/todo.api'
import { TodoForm } from '../../features/create-todo/ui/TodoForm'
import { useCreateTodo } from '../../features/create-todo/model/useCreateTodo'
import { useUpdateTodo } from '../../features/edit-todo/model/useUpdateTodo'
import { useDeleteTodo } from '../../features/delete-todo/model/useDeleteTodo'
import { ConfirmDeleteDialog } from '../../features/delete-todo/ui/ConfirmDeleteDialog'
import { useT } from '../../shared/lib/localeStore'

export function TodoFormPage() {
  const { id } = useParams<{ id?: string }>()

  if (id) {
    return <EditTodoForm id={id} />
  }
  return <CreateTodoForm />
}

function CreateTodoForm() {
  const t = useT()
  const mutation = useCreateTodo()

  return (
    <div className="todo-form-page">
      <h1 className="todo-form-page-title">{t.todo_form_title_create}</h1>
      <TodoForm
        mode="create"
        onSubmit={(values) =>
          mutation.mutate({
            title: values.title,
            categoryId: values.categoryId || undefined,
            startDate: values.startDate,
            endDate: values.endDate,
          })
        }
        isPending={mutation.isPending}
        error={mutation.error}
      />
    </div>
  )
}

function EditTodoForm({ id }: { id: string }) {
  const t = useT()
  const { data: todos, isLoading } = useTodosQuery({})
  const todo = todos?.find((item) => item.id === id)
  const mutation = useUpdateTodo(id)
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const deleteMutation = useDeleteTodo(
    () => navigate('/todos', { state: { toast: t.toast_deleted } }),
    setDeleteError
  )

  if (isLoading) {
    return <p>{t.loading}</p>
  }

  if (!todo) {
    return <Navigate to="/todos" replace />
  }

  return (
    <div className="todo-form-page">
      <h1 className="todo-form-page-title">{t.todo_form_title_edit}</h1>
      <TodoForm
        mode="edit"
        initialValues={{
          title: todo.title,
          categoryId: todo.categoryId,
          startDate: todo.startDate,
          endDate: todo.endDate,
          isDone: todo.isDone,
        }}
        onSubmit={(values) =>
          mutation.mutate({
            title: values.title,
            categoryId: values.categoryId || undefined,
            startDate: values.startDate,
            endDate: values.endDate,
            isDone: values.isDone,
          })
        }
        isPending={mutation.isPending}
        error={mutation.error}
      />
      <div className="todo-form-page-actions">
        <button type="button" className="todo-form-page-list-button" onClick={() => navigate('/todos')}>
          {t.list_button}
        </button>
        <button type="button" className="todo-form-page-delete-button" onClick={() => setConfirmDelete(true)}>
          {t.delete}
        </button>
      </div>
      {deleteError && <p className="todo-form-page-delete-error">{deleteError}</p>}
      {confirmDelete && (
        <ConfirmDeleteDialog
          todoTitle={todo.title}
          onConfirm={() => deleteMutation.mutate(todo.id)}
          onCancel={() => setConfirmDelete(false)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
