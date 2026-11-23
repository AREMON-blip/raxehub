export interface R2BucketLike {
  head(key: string): Promise<{ key: string } | null>
  list(options?: { limit?: number }): Promise<{ objects: Array<{ key: string }> }>
}

export interface Env {
  CLERK_SECRET_KEY?: string
  CLERK_PUBLISHABLE_KEY?: string
  DATABASE_URL?: string
  ADMIN_EMAIL: string
  R2_ACCOUNT_ID: string
  R2_BUCKET: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  RAXEHUB_BUCKET: R2BucketLike
  RAXEHUB_TEST_MODE?: string
}

export interface Identity {
  userId: string
  email: string
}

export interface AppRow {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  status: 'released' | 'coming-soon'
  type?: 'apk' | 'web'
  live_url?: string | null
  repo_url?: string | null
  stack?: string[] | string | null
  icon_key?: string | null
  sort: number
  created_at: string
}

export interface VersionRow {
  id: string
  app_id: string
  version_name: string
  version_code: number
  release_notes: string | null
  apk_key: string
  size_bytes: number
  sha256: string
  active: boolean
  created_at: string
}

export interface ScreenshotRow {
  id: string
  app_id: string
  r2_key: string
  caption: string | null
  sort: number
}

export interface AppSummary extends AppRow {
  latestVersion: {
    versionName: string
    versionCode: number
    sizeBytes: number
  } | null
}

export interface Ctx {
  request: Request
  env: Env
  params: Record<string, string>
  data: { identity?: Identity }
  next: () => Promise<Response>
}

export type OnRequest = (ctx: Ctx) => Response | Promise<Response>
