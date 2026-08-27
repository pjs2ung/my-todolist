import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/login.api'
import type { LoginRequest, LoginResponse } from '../api/login.api'
import type { ApiError } from '../../../shared/api/client'
import { useAuthStore } from '../../../entities/session/model/authStore'

export function useLogin() {
  const navigate = useNavigate()

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      useAuthStore.getState().setAccessToken(data.accessToken)
      if (import.meta.env.DEV) {
        console.log('[useLogin] 로그인 성공', data.user.email)
      }
      navigate('/todos')
    },
  })
}
