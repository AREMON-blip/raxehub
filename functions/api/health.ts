import { isLocalTest } from '../../src/auth'
import { probeDb } from '../../src/db'
import { json, route } from '../../src/errors'

export const onRequest = route(async ({ env }) => {
  let neon = 'ok'
  try {
    await probeDb(env)
  } catch {
    neon = 'error'
  }

  let r2 = 'ok'
  try {
    await env.RAXEHUB_BUCKET.list({ limit: 1 })
  } catch {
    r2 = 'error'
  }

  const clerk = isLocalTest(env) ? 'local' : env.CLERK_SECRET_KEY ? 'ok' : 'error'
  const status = neon === 'ok' && r2 === 'ok' ? 'ok' : 'degraded'

  return json({ status, neon, r2, clerk }, status === 'ok' ? 200 : 503)
})
