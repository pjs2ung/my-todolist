import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from './providers/QueryClientProvider'
import { AppRouter } from './router'
import { refreshAccessToken } from '../shared/api/client'
import { getAccessToken } from '../shared/api/tokenStore'
import { useAuthStore } from '../entities/session/model/authStore'

async function bootstrap() {
  await refreshAccessToken().catch(() => {})
  const token = getAccessToken()
  if (token) {
    useAuthStore.getState().setAccessToken(token)
    if (import.meta.env.DEV) {
      console.log('[app] 세션 복구 성공')
    }
  }

  if (import.meta.env.DEV) {
    console.log('[app] 초기화 완료')
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider>
        <AppRouter />
      </QueryClientProvider>
    </StrictMode>,
  )
}

bootstrap()
