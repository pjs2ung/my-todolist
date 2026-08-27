import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/register.api'
import type { RegisterRequest, RegisterResponse } from '../api/register.api'
import { apiFetch } from '../../../shared/api/client'
import type { ApiError } from '../../../shared/api/client'
import { useAuthStore } from '../../../entities/session/model/authStore'
import type { User } from '../../../entities/user/api/user.api'

type LoginResponse = { accessToken: string; user: User }

export function useRegister() {
  const navigate = useNavigate()

  return useMutation<RegisterResponse, ApiError, RegisterRequest>({
    mutationFn: register,
    onSuccess: async (_data, variables) => {
      const loginResult = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email: variables.email, password: variables.password },
        skipAuth: true,
      })
      useAuthStore.getState().setAccessToken(loginResult.accessToken)
      if (import.meta.env.DEV) {
        console.log('[useRegister] 가입 후 자동 로그인 성공', loginResult.user.email)
      }
      navigate('/todos')
    },
  })
}
