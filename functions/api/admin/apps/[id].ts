import { updateApp, type AppPatch } from '../../../../src/db'
import { ApiError, json, num, optionalStr, readJson, route, str } from '../../../../src/errors'
import type { AppRow } from '../../../../src/types'

export const onRequest = route(async ({ env, params, request }) => {
  const body = await readJson(request)
  const patch: AppPatch = {}

  if (body.name !== undefined) patch.name = str(body.name, 'name')
  if (body.tagline !== undefined) patch.tagline = optionalStr(body.tagline, 'tagline')
  if (body.description !== undefined) patch.description = optionalStr(body.description, 'description')
  if (body.status !== undefined) {
    const status = str(body.status, 'status')
    if (status !== 'released' && status !== 'coming-soon') {
      throw new ApiError(400, 'E-BODY', 'status must be released or coming-soon')
    }
    patch.status = status as AppRow['status']
  }
  if (body.sort !== undefined) patch.sort = num(body.sort, 'sort')
  const iconKey = body.icon_key ?? body.iconKey
  if (iconKey !== undefined) patch.icon_key = optionalStr(iconKey, 'icon_key')

  const app = await updateApp(env, params.id ?? '', patch)
  if (!app) throw new ApiError(404, 'E-NOTFOUND', 'app not found')
  return json({ app })
})
