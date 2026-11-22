import { authenticate, isAdmin } from '../../src/auth'
import { fail } from '../../src/errors'
import type { Ctx } from '../../src/types'

export const onRequest = async (ctx: Ctx): Promise<Response> => {
  const path = new URL(ctx.request.url).pathname.replace(/\/+$/, '')
  if (!path.startsWith('/api/admin')) return ctx.next()

  const identity = await authenticate(ctx.request, ctx.env)
  if (!identity) return fail(401, 'E-AUTH', 'missing or invalid session')
  if (!isAdmin(identity.email, ctx.env)) return fail(403, 'E-AUTH', 'admin only')

  ctx.data.identity = identity
  return ctx.next()
}
