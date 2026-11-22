import type { OnRequest } from './types'

export type ErrorCode = 'E-AUTH' | 'E-NOTFOUND' | 'E-R2PRESIGN' | 'E-DB' | 'E-BODY'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message)
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export function fail(status: number, code: ErrorCode, message: string): Response {
  return json({ error: message, code }, status)
}

export function route(fn: OnRequest): OnRequest {
  return async (ctx) => {
    try {
      return await fn(ctx)
    } catch (error) {
      if (error instanceof ApiError) return fail(error.status, error.code, error.message)
      console.error('[raxehub]', error)
      return fail(500, 'E-DB', 'internal error')
    }
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get('content-length') ?? '0')
  if (declared > 4096) throw new ApiError(413, 'E-BODY', 'body exceeds 4 KB')

  const text = await request.text()
  if (text.length > 4096) throw new ApiError(413, 'E-BODY', 'body exceeds 4 KB')

  try {
    const parsed: unknown = JSON.parse(text)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('not an object')
    }
    return parsed as Record<string, unknown>
  } catch {
    throw new ApiError(400, 'E-BODY', 'invalid JSON body')
  }
}

export function str(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ApiError(400, 'E-BODY', `${field} must be a non-empty string`)
  }
  return value.trim()
}

export function optionalStr(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') return null
  return str(value, field)
}

export function num(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ApiError(400, 'E-BODY', `${field} must be a finite number`)
  }
  return value
}

export function optionalNum(value: unknown, field: string, fallback: number): number {
  return value === undefined ? fallback : num(value, field)
}

export function bool(value: unknown, field: string, fallback: boolean): boolean {
  if (value === undefined) return fallback
  if (typeof value !== 'boolean') throw new ApiError(400, 'E-BODY', `${field} must be boolean`)
  return value
}

export function sha256Hex(value: unknown): string {
  const hash = str(value, 'sha256')
  if (!/^[a-f0-9]{64}$/i.test(hash)) throw new ApiError(400, 'E-BODY', 'sha256 must be 64 hex chars')
  return hash.toLowerCase()
}
