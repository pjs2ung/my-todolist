import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile } from '../api/updateProfile.api'
import type { UpdateProfileRequest, UpdateProfileResponse } from '../api/updateProfile.api'
import type { ApiError } from '../../../shared/api/client'

export function useUpdateProfile(onSuccess: () => void) {
  const queryClient = useQueryClient()

  return useMutation<UpdateProfileResponse, ApiError, UpdateProfileRequest>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data)
      if (import.meta.env.DEV) {
        console.log('[edit-profile] 저장 성공', data.id)
      }
      onSuccess()
    },
  })
}
