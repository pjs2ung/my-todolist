import './ConfirmDeleteDialog.css'

export type ConfirmDeleteDialogProps = {
  todoTitle: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

export function ConfirmDeleteDialog({ todoTitle, onConfirm, onCancel, isPending }: ConfirmDeleteDialogProps) {
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
          할일을 삭제할까요?
        </h2>
        <p className="confirm-delete-dialog-todo-title">"{todoTitle}"</p>
        <p className="confirm-delete-dialog-desc">삭제 후에는 되돌릴 수 없습니다.</p>
        <div className="confirm-delete-dialog-actions">
          <button type="button" className="confirm-delete-dialog-cancel-button" onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className="confirm-delete-dialog-confirm-button"
            onClick={onConfirm}
            disabled={isPending}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
