import { getPreviewTarget } from '../../../src/db'
import { ApiError, route } from '../../../src/errors'
import { ICON_PRESIGN_TTL, presign } from '../../../src/r2'

export const onRequest = route(async ({ env, params }) => {
  const slug = decodeURIComponent(params.slug ?? '').replace(/\.(png|jpe?g|webp)$/i, '').toLowerCase()
  const target = slug ? await getPreviewTarget(env, slug) : null
  if (!target) throw new ApiError(404, 'E-NOTFOUND', 'app not found')

  const location = await presign(env, target.previewKey, 'GET', '', ICON_PRESIGN_TTL)
  return new Response(null, {
    status: 302,
    headers: { Location: location, 'Cache-Control': 'public, max-age=300' },
  })
})
