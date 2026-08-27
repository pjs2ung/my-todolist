import { useUserQuery } from '../../entities/user/api/user.api'
import { ProfileForm } from '../../features/edit-profile/ui/ProfileForm'
import './ProfilePage.css'

export function ProfilePage() {
  const { data: user, isLoading, isError, error } = useUserQuery()

  return (
    <div className="profile-page">
      <h1 className="profile-page-title">내 정보</h1>
      {isLoading && <p>불러오는 중...</p>}
      {isError && <p className="profile-page-error">{error.message}</p>}
      {user && <ProfileForm user={user} />}
    </div>
  )
}
