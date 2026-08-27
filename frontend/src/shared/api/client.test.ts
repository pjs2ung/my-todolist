import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiFetch } from './client'
import { setAccessToken } from './tokenStore'

function jsonResponse(body: unknown, status = 200, ok = status < 400) {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response
}

function emptyResponse(status = 204, ok = true) {
  return {
    ok,
    status,
    json: async () => {
      throw new Error('no body')
    },
  } as unknown as Response
}

beforeEach(() => {
  vi.resetAllMocks()
  setAccessToken(null)
})

describe('apiFetch', () => {
  it('토큰이 있으면 Authorization 헤더를 포함한다', async () => {
    setAccessToken('token-123')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/todos')

    const [, init] = fetchMock.mock.calls[0]
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-123')
  })

  it('skipAuth이면 토큰이 있어도 Authorization 헤더를 붙이지 않는다', async () => {
    setAccessToken('token-123')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/auth/login', { skipAuth: true })

    const [, init] = fetchMock.mock.calls[0]
    expect((init.headers as Record<string, string> | undefined)?.Authorization).toBeUndefined()
  })

  it('성공 시 JSON 바디를 파싱해 반환한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1, title: 'hello' }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiFetch<{ id: number; title: string }>('/todos/1')

    expect(result).toEqual({ id: 1, title: 'hello' })
  })

  it('204 응답은 에러 없이 처리된다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(emptyResponse())
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/todos/1', { method: 'DELETE' })).resolves.not.toThrow()
  })

  it('실패 응답의 {code, message}가 ApiError로 매핑된다', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ code: 'NOT_FOUND', message: '찾을 수 없음' }, 404, false))
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/todos/999')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: '찾을 수 없음',
    })
    await expect(apiFetch('/todos/999')).rejects.toBeInstanceOf(ApiError)
  })

  it('401이면 refresh 후 원 요청을 새 토큰으로 정확히 1회 재시도한다', async () => {
    setAccessToken('old-token')
    const fetchMock = vi
      .fn()
      // 1) 원 요청 -> 401
      .mockResolvedValueOnce(jsonResponse({ code: 'UNAUTHORIZED', message: '만료' }, 401, false))
      // 2) refresh -> 200
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'new' }, 200, true))
      // 3) 재시도 -> 200
      .mockResolvedValueOnce(jsonResponse({ ok: true }, 200, true))
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiFetch('/todos')

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(3)

    const [refreshUrl, refreshInit] = fetchMock.mock.calls[1]
    expect(String(refreshUrl)).toMatch(/\/auth\/refresh$/)
    expect(refreshInit.method).toBe('POST')
    expect(refreshInit.credentials).toBe('include')

    const [, retryInit] = fetchMock.mock.calls[2]
    expect((retryInit.headers as Record<string, string>).Authorization).toBe('Bearer new')
  })

  it('refresh 자체가 실패하면 무한루프 없이 ApiError를 던지고 fetch는 2회만 호출된다', async () => {
    setAccessToken('old-token')
    const fetchMock = vi
      .fn()
      // 1) 원 요청 -> 401
      .mockResolvedValueOnce(jsonResponse({ code: 'UNAUTHORIZED', message: '만료' }, 401, false))
      // 2) refresh -> 401
      .mockResolvedValueOnce(jsonResponse({ code: 'UNAUTHORIZED', message: '재로그인 필요' }, 401, false))
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/todos')).rejects.toBeInstanceOf(ApiError)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
