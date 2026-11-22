import { appExists, insertScreenshot } from '../../../src/db'
import { ApiError, json, num, optionalStr, readJson, route, str } from '../../../src/errors'
import { PRESIGN_TTL, objectKey, presign } from '../../../src/r2'
import type { Ctx } from '../../../src/types'

export const onRequest = route(async (ctx: Ctx) => {
  const body = await readJson(ctx.request)
  const appId =
    ctx.params.appId ??
    str(body.appId ?? new URL(ctx.request.url).searchParams.get('appId') ?? undefined, 'appId')

  if (!(await appExists(ctx.env, appId))) throw new ApiError(404, 'E-NOTFOUND', 'app not found')

  const fileName = str(body.fileName, 'fileName')
  const key = objectKey(['apps', appId, 'screenshots', fileName])
  const uploadUrl = await presign(ctx.env, key, 'PUT')

  await insertScreenshot(
    ctx.env,
    appId,
    key,
    optionalStr(body.caption, 'caption'),
    num(body.sort ?? 0, 'sort'),
  )

  return json({ uploadUrl, key, method: 'PUT', expiresIn: PRESIGN_TTL })
})
