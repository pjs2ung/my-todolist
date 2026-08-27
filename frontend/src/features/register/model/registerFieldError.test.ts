import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../shared/api/client'
import { mapRegisterFieldError } from './registerFieldError'

describe('mapRegisterFieldError', () => {
  it('error가 null이면 빈 객체를 반환한다', () => {
    expect(mapRegisterFieldError(null)).toEqual({})
  })

  it('EMAIL_TAKEN 코드는 email 필드 에러로 매핑한다', () => {
    const error = new ApiError(409, 'EMAIL_TAKEN', '이미 사용 중인 이메일입니다.')
    expect(mapRegisterFieldError(error)).toEqual({ email: '이미 사용 중인 이메일입니다.' })
  })

  it('이메일 형식 오류 메시지는 email 필드로 매핑한다', () => {
    const error = new ApiError(400, 'VALIDATION_ERROR', '올바른 이메일 형식이 아닙니다.')
    expect(mapRegisterFieldError(error)).toEqual({ email: '올바른 이메일 형식이 아닙니다.' })
  })

  it('비밀번호 길이 오류 메시지는 password 필드로 매핑한다', () => {
    const error = new ApiError(400, 'VALIDATION_ERROR', '비밀번호는 8자 이상이어야 합니다.')
    expect(mapRegisterFieldError(error)).toEqual({ password: '비밀번호는 8자 이상이어야 합니다.' })
  })

  it('이름 길이 오류 메시지는 name 필드로 매핑한다', () => {
    const error = new ApiError(400, 'VALIDATION_ERROR', '이름은 1~50자여야 합니다.')
    expect(mapRegisterFieldError(error)).toEqual({ name: '이름은 1~50자여야 합니다.' })
  })

  it('필드 매칭이 안 되는 메시지는 form 필드로 폴백한다', () => {
    const error = new ApiError(500, 'UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다.')
    expect(mapRegisterFieldError(error)).toEqual({ form: '알 수 없는 오류가 발생했습니다.' })
  })
})
