import { updateVersion } from '../../../../src/db'
import { ApiError, bool, json, num, optionalStr, readJson, route, sha256Hex, str } from '../../../../src/errors'

export const onRequestPatch = route(async ({ env, request, params }) => {
  const id = String(params.id || '').trim()
  if (!id) throw new ApiError(400, 'E-BODY', 'id is required')

  const body = await readJson(request)
  const hasReleaseNotes = Object.prototype.hasOwnProperty.call(body, 'releaseNotes')

  let sizeBytes: number | undefined
  if (body.sizeBytes !== undefined) {
    sizeBytes = num(body.sizeBytes, 'sizeBytes')
    if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) {
      throw new ApiError(400, 'E-BODY', 'sizeBytes must be a positive integer')
    }
  }

  const version = await updateVersion(env, id, {
    versionName: body.versionName !== undefined ? str(body.versionName, 'versionName') : undefined,
    versionCode: body.versionCode !== undefined ? num(body.versionCode, 'versionCode') : undefined,
    hasReleaseNotes,
    releaseNotes: hasReleaseNotes ? optionalStr(body.releaseNotes, 'releaseNotes') : undefined,
    apkKey: body.apkKey !== undefined ? str(body.apkKey, 'apkKey') : undefined,
    sizeBytes,
    sha256: body.sha256 !== undefined ? sha256Hex(body.sha256) : undefined,
    active: body.active !== undefined ? bool(body.active, 'active', true) : undefined,
  })

  if (!version) throw new ApiError(404, 'E-NOTFOUND', 'Version not found')
  return json({ version }, 200)
})
