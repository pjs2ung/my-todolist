import { useUserQuery } from '../../entities/user/api/user.api'
import { ProfileForm } from '../../features/edit-profile/ui/ProfileForm'
import './ProfilePage.css'
import { useT } from '../../shared/lib/localeStore'

export function ProfilePage() {
  const t = useT()
  const { data: user, isLoading, isError } = useUserQuery()

  return (
    <div className="profile-page">
      <h1 className="profile-page-title">{t.profile_title}</h1>
      {isLoading && <p>{t.loading}</p>}
      {isError && <p className="profile-page-error">{t.profile_load_error}</p>}
      {user && <ProfileForm user={user} />}
    </div>
  )
}
