import { getAppDetail } from '../../../../src/db'
import { ApiError, json, route } from '../../../../src/errors'

export const onRequest = route(async ({ env, params }) => {
  const slug = decodeURIComponent(params.slug ?? '')
  const detail = await getAppDetail(env, slug)
  if (!detail) throw new ApiError(404, 'E-NOTFOUND', 'app not found')
  return json(detail)
})
