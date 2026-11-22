import { json, route } from '../../../src/errors'

// Admin-only by middleware; used by /admin to lift the client-side curtain.
export const onRequest = route(({ data }) => json({ email: data.identity?.email ?? '' }))
