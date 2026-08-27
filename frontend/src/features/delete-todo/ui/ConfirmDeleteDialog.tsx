import './ConfirmDeleteDialog.css'
import { useT } from '../../../shared/lib/localeStore'

export type ConfirmDeleteDialogProps = {
  todoTitle: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

export function ConfirmDeleteDialog({ todoTitle, onConfirm, onCancel, isPending }: ConfirmDeleteDialogProps) {
  const t = useT()
  return (
    <div className="confirm-delete-dialog-overlay" role="presentation" onClick={onCancel}>
      <div
        className="confirm-delete-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-delete-dialog-title" className="confirm-delete-dialog-title">
          {t.confirm_delete_title}
        </h2>
        <p className="confirm-delete-dialog-todo-title">"{todoTitle}"</p>
        <p className="confirm-delete-dialog-desc">{t.confirm_delete_desc}</p>
        <div className="confirm-delete-dialog-actions">
          <button type="button" className="confirm-delete-dialog-cancel-button" onClick={onCancel}>
            {t.cancel}
          </button>
          <button
            type="button"
            className="confirm-delete-dialog-confirm-button"
            onClick={onConfirm}
            disabled={isPending}
          >
            {t.delete}
          </button>
        </div>
      </div>
    </div>
  )
}
