import './CategoryFilter.css'
import type { Category } from '../../../entities/category/api/category.api'

export type CategoryFilterProps = {
  categories: Category[]
  selectedCategoryId?: string
  onSelect: (categoryId: string | undefined) => void
}

export function CategoryFilter({ categories, selectedCategoryId, onSelect }: CategoryFilterProps) {
  return (
    <>
      <ul className="category-sidebar">
        <li>
          <button
            type="button"
            className={selectedCategoryId === undefined ? 'category-sidebar-item category-sidebar-item--active' : 'category-sidebar-item'}
            onClick={() => onSelect(undefined)}
          >
            전체
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              className={selectedCategoryId === category.id ? 'category-sidebar-item category-sidebar-item--active' : 'category-sidebar-item'}
              onClick={() => onSelect(category.id)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
      <select
        className="category-dropdown"
        value={selectedCategoryId ?? ''}
        onChange={(e) => onSelect(e.target.value || undefined)}
      >
        <option value="">전체 카테고리</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </>
  )
}
