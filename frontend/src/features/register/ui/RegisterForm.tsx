import { useState } from 'react'
import './RegisterForm.css'
import { useRegister } from '../model/useRegister'
import { mapRegisterFieldError } from '../model/registerFieldError'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const mutation = useRegister()
  const fieldErrors = mapRegisterFieldError(mutation.error ?? null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ email, password, name })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="register-email">이메일</label>
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
        <label htmlFor="register-name">이름</label>
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
        <label htmlFor="register-password">비밀번호</label>
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
        가입하기
      </button>
    </form>
  )
}
