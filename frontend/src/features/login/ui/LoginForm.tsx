import { useState } from 'react'
import './LoginForm.css'
import { useLogin } from '../model/useLogin'
import { useT } from '../../../shared/lib/localeStore'

export function LoginForm() {
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const mutation = useLogin()
  const errorMessage = mutation.error
    ? mutation.error.code === 'UNAUTHORIZED'
      ? t.error_unauthorized
      : mutation.error.message
    : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ email, password })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="login-email">{t.field_email}</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="auth-field">
        <label htmlFor="login-password">{t.field_password}</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {errorMessage && <p className="auth-form-error">{errorMessage}</p>}
      <button type="submit" className="auth-submit-button" disabled={mutation.isPending}>
        {t.login_submit}
      </button>
    </form>
  )
}
