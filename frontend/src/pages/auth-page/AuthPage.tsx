import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './AuthPage.css'
import { LoginForm } from '../../features/login/ui/LoginForm'
import { RegisterForm } from '../../features/register/ui/RegisterForm'
import { useAuthStore } from '../../entities/session/model/authStore'

type Tab = 'login' | 'signup'

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => (searchParams.get('tab') === 'signup' ? 'signup' : 'login'))
  const sessionExpired = useAuthStore((s) => s.sessionExpired)

  return (
    <div className="auth-page">
      <h1 className="auth-page-title">TodoList</h1>
      {sessionExpired && <div className="auth-session-banner">세션이 만료되어 다시 로그인해주세요</div>}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab-button ${tab === 'login' ? 'active' : ''}`}
          onClick={() => setTab('login')}
        >
          로그인
        </button>
        <button
          type="button"
          className={`auth-tab-button ${tab === 'signup' ? 'active' : ''}`}
          onClick={() => setTab('signup')}
        >
          회원가입
        </button>
      </div>
      {tab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  )
}
