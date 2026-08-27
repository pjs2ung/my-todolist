import { useState } from 'react'
import './ProfileForm.css'
import { useUpdateProfile } from '../model/useUpdateProfile'
import type { User } from '../../../entities/user/api/user.api'

export type ProfileFormProps = { user: User }

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name)
  const [saved, setSaved] = useState(false)
  const mutation = useUpdateProfile(() => setSaved(true))

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
    setSaved(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ name })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="profile-email">이메일</label>
        <input id="profile-email" type="email" value={user.email} readOnly />
      </div>
      <div className="auth-field">
        <label htmlFor="profile-name">이름</label>
        <input id="profile-name" type="text" value={name} onChange={handleNameChange} required />
        {mutation.error && <p className="auth-field-error">{mutation.error.message}</p>}
      </div>
      <button type="submit" className="auth-submit-button" disabled={mutation.isPending}>
        저장
      </button>
      {saved && <p className="profile-saved-message">✓ 저장되었습니다</p>}
    </form>
  )
}
