import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/logout.api'
import { useAuthStore } from '../../../entities/session/model/authStore'

export function useLogout() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // 서버 호출 성공/실패 여부와 무관하게 클라이언트 인증 상태는 항상 정리한다
      useAuthStore.getState().clearAccessToken()
      if (import.meta.env.DEV) {
        console.log('[useLogout] 로그아웃 처리 완료')
      }
      navigate('/')
    },
  })
}
