import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './AuthPage.css'
import { LoginForm } from '../../features/login/ui/LoginForm'
import { RegisterForm } from '../../features/register/ui/RegisterForm'
import { useAuthStore } from '../../entities/session/model/authStore'
import { useT } from '../../shared/lib/localeStore'

type Tab = 'login' | 'signup'

export function AuthPage() {
  const t = useT()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => (searchParams.get('tab') === 'signup' ? 'signup' : 'login'))
  const sessionExpired = useAuthStore((s) => s.sessionExpired)

  return (
    <div className="auth-page">
      <h1 className="auth-page-title">{t.appName}</h1>
      {sessionExpired && <div className="auth-session-banner">{t.session_expired_banner}</div>}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab-button ${tab === 'login' ? 'active' : ''}`}
          onClick={() => setTab('login')}
        >
          {t.login_tab}
        </button>
        <button
          type="button"
          className={`auth-tab-button ${tab === 'signup' ? 'active' : ''}`}
          onClick={() => setTab('signup')}
        >
          {t.register_tab}
        </button>
      </div>
      {tab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  )
}
