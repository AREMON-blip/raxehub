import type { Ctx } from '../src/types'

// Publishable key is public by design; served from Worker env so no key is baked into the bundle.
export const onRequest = ({ env }: Ctx): Response =>
  new Response(
    `window.RAXEHUB_CLERK_PUBLISHABLE_KEY = ${JSON.stringify(env.CLERK_PUBLISHABLE_KEY ?? '')};\n`,
    {
      headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    },
  )
