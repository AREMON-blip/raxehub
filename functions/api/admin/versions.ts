import { insertVersion } from '../../../src/db'
import { ApiError, bool, json, num, optionalStr, readJson, route, sha256Hex, str } from '../../../src/errors'

export const onRequest = route(async ({ env, request }) => {
  const body = await readJson(request)
  const sizeBytes = num(body.sizeBytes, 'sizeBytes')
  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) {
    throw new ApiError(400, 'E-BODY', 'sizeBytes must be a positive integer')
  }

  const version = await insertVersion(env, {
    appId: str(body.appId, 'appId'),
    versionName: str(body.versionName, 'versionName'),
    versionCode: num(body.versionCode, 'versionCode'),
    releaseNotes: optionalStr(body.releaseNotes, 'releaseNotes'),
    apkKey: str(body.apkKey, 'apkKey'),
    sizeBytes,
    sha256: sha256Hex(body.sha256),
    active: bool(body.active, 'active', true),
  })

  return json({ version }, 201)
})
