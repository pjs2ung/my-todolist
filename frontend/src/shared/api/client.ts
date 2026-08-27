import { getAccessToken, setAccessToken } from './tokenStore'
import { emitSessionExpired } from '../lib/authEvents'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  skipAuth?: boolean
}

async function rawFetch(path: string, options: ApiFetchOptions): Promise<Response> {
  const headers: Record<string, string> = { ...options.headers }

  if (!options.skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  })
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await rawFetch('/auth/refresh', { method: 'POST', skipAuth: true })
    if (!response.ok) {
      setAccessToken(null)
      return false
    }
    const data = (await response.json()) as { accessToken: string }
    setAccessToken(data.accessToken)
    return true
  } catch {
    setAccessToken(null)
    return false
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const response = await rawFetch(path, options)

  if (response.ok) {
    return parseResponse<T>(response)
  }

  if (response.status === 401 && !options.skipAuth) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      if (import.meta.env.DEV) {
        console.log('[api] 401 발생, refresh 성공 후 재시도', path)
      }
      const retryResponse = await rawFetch(path, options)
      if (retryResponse.ok) {
        return parseResponse<T>(retryResponse)
      }
      const retryError = await retryResponse.json().catch(() => ({ code: 'UNKNOWN_ERROR', message: retryResponse.statusText }))
      throw new ApiError(retryResponse.status, retryError.code, retryError.message)
    }
    if (import.meta.env.DEV) {
      console.log('[api] refresh 실패, 세션 만료 처리', path)
    }
    emitSessionExpired()
  }

  const error = await response.json().catch(() => ({ code: 'UNKNOWN_ERROR', message: response.statusText }))
  if (import.meta.env.DEV) {
    console.log('[api] 요청 실패', path, response.status, error.code)
  }
  throw new ApiError(response.status, error.code, error.message)
}
