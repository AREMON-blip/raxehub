import { insertApp } from '../../../src/db'
import { ApiError, json, num, optionalStr, readJson, route, str } from '../../../src/errors'
import type { AppRow } from '../../../src/types'

export const onRequest = route(async ({ env, request }) => {
  const body = await readJson(request)
  const status = body.status === undefined ? 'released' : str(body.status, 'status')
  if (status !== 'released' && status !== 'coming-soon') {
    throw new ApiError(400, 'E-BODY', 'status must be released or coming-soon')
  }

  const input = {
    slug: sanitizeSlug(str(body.slug, 'slug')),
    name: str(body.name, 'name'),
    tagline: optionalStr(body.tagline, 'tagline'),
    description: optionalStr(body.description, 'description'),
    status: status as AppRow['status'],
    sort: num(body.sort ?? 0, 'sort'),
  }

  return json({ app: await insertApp(env, input) }, 201)
})

function sanitizeSlug(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  if (!slug) throw new ApiError(400, 'E-BODY', 'invalid slug')
  return slug
}
