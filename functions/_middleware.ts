import { authenticate, isAdmin, isLocalTest } from '../src/auth'
import type { Ctx } from '../src/types'

function clerkSignIn(publishableKey: string, request: Request): string | null {
  if (!/^pk_(test|live)_/.test(publishableKey)) return null
  const encoded = publishableKey.replace(/^pk_(test|live)_/, '').replace(/-/g, '+').replace(/_/g, '/')
  let host: string
  try {
    host = atob(encoded).replace(/\$$/, '')
  } catch {
    return null
  }
  if (!host.includes('.')) return null
  const url = new URL(`https://${host}/sign-in`)
  url.searchParams.set('redirect_url', new URL('/admin', request.url).toString())
  return url.toString()
}

export const onRequest = async (ctx: Ctx): Promise<Response> => {
  const path = new URL(ctx.request.url).pathname.replace(/\/+$/, '')
  if (!path.startsWith('/admin')) return ctx.next()
  // Dev identity lives in localStorage; the client verifies it via /api/admin/me.
  if (isLocalTest(ctx.env) && !ctx.env.CLERK_PUBLISHABLE_KEY) return ctx.next()

  const identity = await authenticate(ctx.request, ctx.env)
  if (!identity) {
    const signIn = clerkSignIn(ctx.env.CLERK_PUBLISHABLE_KEY ?? '', ctx.request)
    return Response.redirect(signIn ?? new URL('/rejected?code=E-AUTH', ctx.request.url).toString(), 302)
  }
  if (!isAdmin(identity.email, ctx.env)) {
    return Response.redirect(new URL('/rejected?code=E-NOTADMIN', ctx.request.url).toString(), 302)
  }
  ctx.data.identity = identity
  return ctx.next()
}
