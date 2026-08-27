import './LogoutButton.css'
import { useLogout } from '../model/useLogout'
import { useT } from '../../../shared/lib/localeStore'

export function LogoutButton() {
  const t = useT()
  const mutation = useLogout()

  return (
    <button
      type="button"
      className="logout-button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {t.logout}
    </button>
  )
}
