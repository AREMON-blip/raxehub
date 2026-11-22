import { ApiError, json, num, readJson, route, sha256Hex, str } from '../../../src/errors'
import { MAX_UPLOAD_BYTES, PRESIGN_TTL, objectKey, presign, sanitize } from '../../../src/r2'

export const onRequest = route(async ({ env, request }) => {
  const body = await readJson(request)
  const fileName = str(body.fileName, 'fileName')
  const sizeBytes = num(body.sizeBytes, 'sizeBytes')
  sha256Hex(body.sha256) // client-side digest only; Worker never hashes bytes

  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) {
    throw new ApiError(400, 'E-BODY', 'sizeBytes must be between 1 and 80 MiB')
  }

  const slug = body.slug === undefined ? 'uploads' : str(body.slug, 'slug')
  const versionName = body.versionName === undefined ? 'draft' : str(body.versionName, 'versionName')
  const baseName = sanitize(fileName.replace(/\.apk$/i, ''))
  const key = objectKey(['apps', slug, `${baseName}-${versionName}.apk`])
  const uploadUrl = await presign(env, key, 'PUT')

  return json({ uploadUrl, key, method: 'PUT', expiresIn: PRESIGN_TTL })
})
