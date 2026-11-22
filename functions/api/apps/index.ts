import { listApps } from '../../../src/db'
import { json, route } from '../../../src/errors'

export const onRequest = route(async ({ env }) => json({ apps: await listApps(env) }))
