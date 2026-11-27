import { insertApp } from '../../../src/db'
import { ApiError, json, num, optionalStr, readJson, route, str } from '../../../src/errors'
import type { AppRow } from '../../../src/types'

export const onRequest = route(async ({ env, request }) => {
  const body = await readJson(request)
  const status = body.status === undefined ? 'released' : str(body.status, 'status')
  if (status !== 'released' && status !== 'coming-soon') {
    throw new ApiError(400, 'E-BODY', 'status must be released or coming-soon')
  }

  const type = body.type === undefined ? 'apk' : str(body.type, 'type')
  if (type !== 'apk' && type !== 'web') {
    throw new ApiError(400, 'E-BODY', 'type must be apk or web')
  }

  const input = {
    slug: sanitizeSlug(str(body.slug, 'slug')),
    name: str(body.name, 'name'),
    tagline: optionalStr(body.tagline, 'tagline'),
    description: optionalStr(body.description, 'description'),
    status: status as AppRow['status'],
    type: type as 'apk' | 'web',
    live_url: optionalStr(body.live_url ?? body.liveUrl, 'live_url'),
    repo_url: optionalStr(body.repo_url ?? body.repoUrl, 'repo_url'),
    stack: optionalStr(body.stack, 'stack'),
    sort: num(body.sort ?? 0, 'sort'),
    icon_key: optionalStr(body.icon_key ?? body.iconKey, 'icon_key'),
    preview_key: optionalStr(body.preview_key ?? body.previewKey, 'preview_key'),
  }

  return json({ app: await insertApp(env, input) }, 201)
})

function sanitizeSlug(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  if (!slug) throw new ApiError(400, 'E-BODY', 'invalid slug')
  return slug
}
