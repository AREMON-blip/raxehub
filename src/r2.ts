import { AwsClient } from 'aws4fetch'
import { isLocalTest } from './auth'
import { ApiError } from './errors'
import type { Env } from './types'

export const PRESIGN_TTL = 900
export const ICON_PRESIGN_TTL = 3600
export const MAX_UPLOAD_BYTES = 80 * 1024 * 1024
export const MAX_ICON_BYTES = 2 * 1024 * 1024

export function sanitize(part: string): string {
  return part.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'file'
}

export function objectKey(parts: string[]): string {
  return parts.map(sanitize).join('/')
}

export function attachmentDisposition(key: string): string {
  return `attachment; filename="${sanitize(key.split('/').pop() ?? 'download.apk')}"`
}

// ponytail: env account ID is normalized here; drop if Vanguard guarantees canonical value.
function r2Host(accountId: string): string {
  const id = accountId.trim().replace(/^https?:\/\//i, '').split('/')[0]
    .replace(/\.r2\.(dev|cloudflarestorage\.com)$/i, '')
  return `${id}.r2.cloudflarestorage.com`
}

export async function presign(
  env: Env,
  key: string,
  method: 'GET' | 'PUT',
  disposition?: string,
  ttlSeconds: number = PRESIGN_TTL,
): Promise<string> {
  try {
    const encoded = key.split('/').map(encodeURIComponent).join('/')
    const url = new URL(
      `https://${r2Host(env.R2_ACCOUNT_ID)}/${env.R2_BUCKET}/${encoded}`,
    )
    // disposition === '' means inline (images); undefined keeps the APK attachment default.
    if (method === 'GET' && disposition !== '') {
      url.searchParams.set('response-content-disposition', disposition || attachmentDisposition(key))
    }
    url.searchParams.set('X-Amz-Expires', String(ttlSeconds))

    if (isLocalTest(env)) {
      url.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256')
      url.searchParams.set('X-Amz-Signature', 'local-test-signature')
      return url.toString()
    }

    const client = new AwsClient({
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      service: 's3',
      region: 'auto',
    })
    const signed = await client.sign(url.toString(), {
      method,
      aws: { signQuery: true },
    })
    return signed.url
  } catch {
    throw new ApiError(500, 'E-R2PRESIGN', 'R2 presign failed')
  }
}
