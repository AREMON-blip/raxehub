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
  if (body.type !== undefined) {
    const type = str(body.type, 'type')
    if (type !== 'apk' && type !== 'web') throw new ApiError(400, 'E-BODY', 'type must be apk or web')
    patch.type = type as 'apk' | 'web'
  }
  const liveUrl = body.live_url ?? body.liveUrl
  if (liveUrl !== undefined) patch.live_url = optionalStr(liveUrl, 'live_url')
  const repoUrl = body.repo_url ?? body.repoUrl
  if (repoUrl !== undefined) patch.repo_url = optionalStr(repoUrl, 'repo_url')
  if (body.stack !== undefined) patch.stack = optionalStr(body.stack, 'stack')
  if (body.sort !== undefined) patch.sort = num(body.sort, 'sort')
  const iconKey = body.icon_key ?? body.iconKey
  if (iconKey !== undefined) patch.icon_key = optionalStr(iconKey, 'icon_key')
  const previewKey = body.preview_key ?? body.previewKey
  if (previewKey !== undefined) patch.preview_key = optionalStr(previewKey, 'preview_key')

  const app = await updateApp(env, params.id ?? '', patch)
  if (!app) throw new ApiError(404, 'E-NOTFOUND', 'app not found')
  return json({ app })
})
