import { getDownloadTarget } from './db'
import { ApiError } from './errors'
import { attachmentDisposition, presign } from './r2'
import type { Ctx } from './types'

export async function downloadResponse(ctx: Ctx, versionId?: string): Promise<Response> {
  const slug = decodeURIComponent(ctx.params.slug ?? '')
  if (!slug) throw new ApiError(404, 'E-NOTFOUND', 'app not found')

  const target = await getDownloadTarget(
    ctx.env,
    slug,
    versionId ? decodeURIComponent(versionId) : undefined,
  )
  if (!target) throw new ApiError(404, 'E-NOTFOUND', 'app or version not found')

  const location = await presign(ctx.env, target.apkKey, 'GET', attachmentDisposition(target.apkKey))
  return new Response(null, {
    status: 302,
    headers: { Location: location, 'Cache-Control': 'no-store' },
  })
}
