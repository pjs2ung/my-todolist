import { beforeEach, describe, expect, it } from 'vitest'
import { emitSessionExpired } from '../../../shared/lib/authEvents'
import { useAuthStore } from './authStore'

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, isAuthenticated: false, sessionExpired: false })
})

describe('authStore 세션만료', () => {
  it('emitSessionExpired 호출 시 sessionExpired가 true가 되고 토큰/인증상태가 초기화된다', () => {
    useAuthStore.setState({ accessToken: 'token-123', isAuthenticated: true })

    emitSessionExpired()

    const state = useAuthStore.getState()
    expect(state.sessionExpired).toBe(true)
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('sessionExpired가 true인 상태에서 setAccessToken으로 로그인하면 sessionExpired가 false로 리셋된다', () => {
    emitSessionExpired()
    expect(useAuthStore.getState().sessionExpired).toBe(true)

    useAuthStore.getState().setAccessToken('new-token')

    const state = useAuthStore.getState()
    expect(state.sessionExpired).toBe(false)
    expect(state.accessToken).toBe('new-token')
    expect(state.isAuthenticated).toBe(true)
  })

  it('sessionExpired가 true인 상태에서 setAccessToken(null)을 호출해도 sessionExpired는 유지된다', () => {
    emitSessionExpired()
    expect(useAuthStore.getState().sessionExpired).toBe(true)

    useAuthStore.getState().setAccessToken(null)

    const state = useAuthStore.getState()
    expect(state.sessionExpired).toBe(true)
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
