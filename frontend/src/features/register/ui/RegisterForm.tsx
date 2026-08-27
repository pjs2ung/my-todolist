import { useState } from 'react'
import './RegisterForm.css'
import { useRegister } from '../model/useRegister'
import { mapRegisterFieldError } from '../model/registerFieldError'
import { useLocaleStore, useT } from '../../../shared/lib/localeStore'

export function RegisterForm() {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const mutation = useRegister()
  const fieldErrors = mapRegisterFieldError(mutation.error ?? null, locale)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ email, password, name })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="register-email">{t.field_email}</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {fieldErrors.email && <p className="auth-field-error">{fieldErrors.email}</p>}
      </div>
      <div className="auth-field">
        <label htmlFor="register-name">{t.field_name}</label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {fieldErrors.name && <p className="auth-field-error">{fieldErrors.name}</p>}
      </div>
      <div className="auth-field">
        <label htmlFor="register-password">{t.field_password}</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {fieldErrors.password && <p className="auth-field-error">{fieldErrors.password}</p>}
      </div>
      {fieldErrors.form && <p className="auth-form-error">{fieldErrors.form}</p>}
      <button type="submit" className="auth-submit-button" disabled={mutation.isPending}>
        {t.register_submit}
      </button>
    </form>
  )
}
