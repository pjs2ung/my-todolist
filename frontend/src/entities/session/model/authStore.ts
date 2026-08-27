import { create } from 'zustand'
import { setAccessToken as setSharedAccessToken } from '../../../shared/api/tokenStore'
import { onSessionExpired } from '../../../shared/lib/authEvents'

type AuthState = {
  accessToken: string | null
  isAuthenticated: boolean
  sessionExpired: boolean
  setAccessToken: (token: string | null) => void
  clearAccessToken: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  sessionExpired: false,
  setAccessToken: (token) => {
    setSharedAccessToken(token)
    if (import.meta.env.DEV) {
      console.log('[authStore] accessToken 설정', token !== null)
    }
    if (token !== null) {
      set({ accessToken: token, isAuthenticated: true, sessionExpired: false })
    } else {
      set({ accessToken: null, isAuthenticated: false })
    }
  },
  clearAccessToken: () => {
    setSharedAccessToken(null)
    if (import.meta.env.DEV) {
      console.log('[authStore] accessToken 초기화')
    }
    set({ accessToken: null, isAuthenticated: false })
  },
}))

onSessionExpired(() => {
  useAuthStore.getState().clearAccessToken()
  useAuthStore.setState({ sessionExpired: true })
})
