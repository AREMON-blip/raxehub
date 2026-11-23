import { ApiError, json, num, readJson, route, str } from '../../../src/errors'
import { MAX_ICON_BYTES, PRESIGN_TTL, objectKey, presign, sanitize } from '../../../src/r2'

export const onRequest = route(async ({ env, request }) => {
  const body = await readJson(request)
  const slug = sanitize(str(body.slug, 'slug').toLowerCase())
  const sizeBytes = num(body.sizeBytes, 'sizeBytes')

  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_ICON_BYTES) {
    throw new ApiError(400, 'E-BODY', 'sizeBytes must be between 1 byte and 2 MiB')
  }

  const key = objectKey(['icons', `${slug}.png`])
  const uploadUrl = await presign(env, key, 'PUT')
  return json({ uploadUrl, key, method: 'PUT', expiresIn: PRESIGN_TTL })
})
