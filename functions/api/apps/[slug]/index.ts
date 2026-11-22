import { getAppDetail } from '../../../../src/db'
import { ApiError, json, route } from '../../../../src/errors'
import { presign } from '../../../../src/r2'

export const onRequest = route(async ({ env, params }) => {
  const slug = decodeURIComponent(params.slug ?? '')
  const detail = await getAppDetail(env, slug)
  if (!detail) throw new ApiError(404, 'E-NOTFOUND', 'app not found')
  const screenshots = await Promise.all(
    detail.screenshots.map(async (shot) => ({
      ...shot,
      url: await presign(env, shot.r2_key, 'GET'),
    })),
  )
  return json({ ...detail, screenshots })
})
