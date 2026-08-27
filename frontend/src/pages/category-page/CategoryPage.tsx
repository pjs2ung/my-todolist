import { useState } from 'react'
import { Link } from 'react-router-dom'
import './CategoryPage.css'
import { useCategoriesQuery } from '../../entities/category/api/category.api'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../features/manage-categories/model/useManageCategories'
import { useT } from '../../shared/lib/localeStore'

export function CategoryPage() {
  const t = useT()
  const { data: categories, isLoading, isError } = useCategoriesQuery()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory(editingId ?? '')
  const deleteMutation = useDeleteCategory()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate(
      { name: newName },
      { onSuccess: () => setNewName('') }
    )
  }

  function startEdit(id: string, name: string) {
    setEditingId(id)
    setEditName(name)
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    updateMutation.mutate({ name: editName }, { onSuccess: () => setEditingId(null) })
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(t.category_delete_confirm(name))) {
      return
    }
    deleteMutation.mutate(id)
  }

  return (
    <div className="category-page">
      <Link to="/todos" className="category-page-back-link">
        {t.backToList}
      </Link>
      <h1 className="category-page-title">{t.category_page_title}</h1>

      <form className="category-create-form" onSubmit={handleCreate}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t.category_new_placeholder}
          maxLength={30}
          required
        />
        <button type="submit" className="category-primary-button" disabled={createMutation.isPending}>
          {t.add}
        </button>
      </form>
      {createMutation.error && <p className="category-page-error">{createMutation.error.message}</p>}

      {isLoading && <p>{t.loading}</p>}
      {isError && <p className="category-page-error">{t.category_load_error}</p>}

      <ul className="category-list">
        {categories?.map((category) => {
          const isDefault = category.name === '기본'
          const isEditing = editingId === category.id

          if (isEditing) {
            return (
              <li key={category.id} className="category-list-item">
                <form className="category-edit-form" onSubmit={handleUpdate}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={30}
                    required
                    autoFocus
                  />
                  <button type="submit" className="category-primary-button" disabled={updateMutation.isPending}>
                    {t.save}
                  </button>
                  <button type="button" className="category-outline-button" onClick={() => setEditingId(null)}>
                    {t.cancel}
                  </button>
                </form>
                {updateMutation.error && <p className="category-page-error">{updateMutation.error.message}</p>}
              </li>
            )
          }

          return (
            <li key={category.id} className="category-list-item">
              <span className="category-name">{category.name}</span>
              {!isDefault && (
                <div className="category-item-actions">
                  <button
                    type="button"
                    className="category-outline-button"
                    onClick={() => startEdit(category.id, category.name)}
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="category-delete-button"
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    {t.delete}
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
