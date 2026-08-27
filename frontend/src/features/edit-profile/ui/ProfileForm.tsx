import { useState } from 'react'
import './ProfileForm.css'
import { useUpdateProfile } from '../model/useUpdateProfile'
import type { User } from '../../../entities/user/api/user.api'
import { useT } from '../../../shared/lib/localeStore'

export type ProfileFormProps = { user: User }

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useT()
  const [name, setName] = useState(user.name)
  const [saved, setSaved] = useState(false)
  const mutation = useUpdateProfile(() => setSaved(true))
  const errorMessage = mutation.error
    ? mutation.error.code === 'VALIDATION_ERROR'
      ? t.error_name_length
      : mutation.error.message
    : null

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
        <label htmlFor="profile-email">{t.field_email}</label>
        <input id="profile-email" type="email" value={user.email} readOnly />
      </div>
      <div className="auth-field">
        <label htmlFor="profile-name">{t.field_name}</label>
        <input id="profile-name" type="text" value={name} onChange={handleNameChange} required />
        {errorMessage && <p className="auth-field-error">{errorMessage}</p>}
      </div>
      <button type="submit" className="auth-submit-button" disabled={mutation.isPending}>
        {t.save}
      </button>
      {saved && <p className="profile-saved-message">{t.profile_saved}</p>}
    </form>
  )
}
