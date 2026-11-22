import { verifyToken } from '@clerk/backend'
import type { Env, Identity } from './types'

export function isLocalTest(env: Env): boolean {
  return env.RAXEHUB_TEST_MODE === '1' && !env.CLERK_SECRET_KEY
}

function bearerOrCookie(request: Request): string | null {
  const header = request.headers.get('authorization') ?? ''
  const bearer = /^Bearer\s+(.+)$/i.exec(header)
  if (bearer) return bearer[1].trim()

  const cookies = request.headers.get('cookie') ?? ''
  const session = /(?:^|;\s*)__session=([^;]+)/.exec(cookies)
  return session ? decodeURIComponent(session[1]) : null
}

export async function authenticate(request: Request, env: Env): Promise<Identity | null> {
  const token = bearerOrCookie(request)
  if (!token) return null

  if (isLocalTest(env)) {
    const match = /^test:([^\s]+)$/i.exec(token)
    return match ? { userId: 'local-test-user', email: match[1].toLowerCase() } : null
  }

  if (!env.CLERK_SECRET_KEY) return null

  try {
    const claims = (await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY })) as unknown as Record<
      string,
      unknown
    >
    const userId = claims.sub
    const email = claims.email ?? claims.primary_email_address ?? claims.email_address
    if (typeof userId !== 'string' || typeof email !== 'string' || !email) return null
    return { userId, email: email.toLowerCase() }
  } catch {
    return null
  }
}

export function isAdmin(email: string, env: Env): boolean {
  return (env.ADMIN_EMAIL ?? '').trim().toLowerCase() === email.toLowerCase()
}
