import type { Ctx } from '../src/types'

// /admin renders an auth-gated shell (#admin-content hidden by default) and loads Clerk JS
// directly on raxehub.pages.dev so Clerk Development mode Dev Browser tokens work cleanly
// without hitting *.accounts.dev/default-redirect. All /api/admin/* endpoints remain
// strictly fail-closed in functions/api/_middleware.ts.
export const onRequest = async (ctx: Ctx): Promise<Response> => ctx.next()
