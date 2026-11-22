import type { Ctx } from '../src/types'

const DEFAULT_CLERK_PK = 'pk_test_Y2VydGFpbi1maWxseS0xNzQxLmNsZXJrLmFjY291bnRzLmRldiQ'

// Publishable key is public by design; falls back to the public Clerk instance key if Pages env var is unset.
export const onRequest = ({ env }: Ctx): Response =>
  new Response(
    `window.RAXEHUB_CLERK_PUBLISHABLE_KEY = ${JSON.stringify(env.CLERK_PUBLISHABLE_KEY || DEFAULT_CLERK_PK)};\n`,
    {
      headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    },
  )
