import { neon } from '@neondatabase/serverless'
import { isLocalTest } from './auth'
import { ApiError } from './errors'
import type { AppRow, AppSummary, Env, ScreenshotRow, VersionRow } from './types'

const TEST_APP_ID = '11111111-1111-4111-8111-111111111111'
const OTHER_APP_ID = '33333333-3333-4333-8333-333333333333'
const TEST_VERSION_ID = '22222222-2222-4222-8222-222222222222'
const FIXED_TIME = '2026-11-22T00:00:00.000Z'

const store: { apps: AppRow[]; versions: VersionRow[]; screenshots: ScreenshotRow[] } = {
  apps: [
    {
      id: TEST_APP_ID,
      slug: 'gps-tracker',
      name: 'GPS Tracker',
      tagline: 'Lacak armada real-time',
      description: 'APK tracking internal Raxe.',
      status: 'released',
      sort: 0,
      created_at: FIXED_TIME,
    },
    {
      id: OTHER_APP_ID,
      slug: 'kroma',
      name: 'KROMA',
      tagline: 'Belum rilis',
      description: null,
      status: 'coming-soon',
      sort: 1,
      created_at: FIXED_TIME,
    },
  ],
  versions: [
    {
      id: TEST_VERSION_ID,
      app_id: TEST_APP_ID,
      version_name: '2.0.1',
      version_code: 201,
      release_notes: 'Perbaikan GPS fix.',
      apk_key: 'apps/gps-tracker/gpstracker-2.0.1.apk',
      size_bytes: 12_345_678,
      sha256: 'a'.repeat(64),
      active: true,
      created_at: FIXED_TIME,
    },
  ],
  screenshots: [
    {
      id: '44444444-4444-4444-8444-444444444444',
      app_id: TEST_APP_ID,
      r2_key: 'apps/gps-tracker/screenshots/home.png',
      caption: 'Beranda',
      sort: 0,
    },
  ],
}

function db(env: Env) {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL missing')
  return neon(env.DATABASE_URL)
}

let schemaReady: Promise<void> | null = null

// Idempotent runtime migration so prod Neon gains icon_key/preview_key without a manual SQL step.
async function ensureSchema(env: Env): Promise<void> {
  if (isLocalTest(env)) return
  schemaReady ??= (async () => {
    const sql = db(env)
    await sql`ALTER TABLE apps ADD COLUMN IF NOT EXISTS icon_key text`
    await sql`ALTER TABLE apps ADD COLUMN IF NOT EXISTS preview_key text`
  })().catch((error) => {
    schemaReady = null
    throw error
  })
  await schemaReady
}

function latestVersion(appId: string): VersionRow | null {
  return store.versions.find((version) => version.app_id === appId && version.active) ?? null
}

function summary(app: AppRow): AppSummary {
  const version = latestVersion(app.id)
  return {
    ...app,
    latestVersion: version
      ? {
          versionName: version.version_name,
          versionCode: version.version_code,
          sizeBytes: version.size_bytes,
        }
      : null,
  }
}

export async function probeDb(env: Env): Promise<void> {
  if (isLocalTest(env)) return
  await db(env)`SELECT 1 AS ok`
}

export async function listApps(env: Env): Promise<AppSummary[]> {
  if (isLocalTest(env)) {
    return store.apps
      .slice()
      .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name))
      .map(summary)
  }

  type Row = AppRow & { versionName: string | null; versionCode: number | null; sizeBytes: string | number | null }
  await ensureSchema(env)
  const rows = (await db(env)`
    SELECT a.id, a.slug, a.name, a.tagline, a.description, a.status,
           a.type, a.live_url, a.repo_url, a.stack, a.icon_key, a.preview_key, a.sort, a.created_at,
           v.version_name AS "versionName", v.version_code AS "versionCode", v.size_bytes AS "sizeBytes"
    FROM apps a
    LEFT JOIN versions v ON v.id = (
      SELECT id FROM versions WHERE app_id = a.id AND active = true ORDER BY active DESC, version_code DESC, created_at DESC LIMIT 1
    )
    ORDER BY a.sort ASC, a.name ASC
  `) as unknown as Row[]

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    status: row.status,
    type: row.type,
    live_url: row.live_url,
    repo_url: row.repo_url,
    icon_key: row.icon_key ?? null,
    preview_key: row.preview_key ?? null,
    stack: Array.isArray(row.stack)
      ? row.stack
      : row.stack
        ? row.stack.split(',').map((item: string) => item.trim()).filter(Boolean)
        : [],
    sort: row.sort,
    created_at: row.created_at,
    latestVersion:
      row.versionName === null
        ? null
        : {
            versionName: row.versionName,
            versionCode: Number(row.versionCode),
            sizeBytes: Number(row.sizeBytes),
          },
  }))
}

export async function getAppDetail(
  env: Env,
  slug: string,
): Promise<{ app: AppRow; versions: VersionRow[]; screenshots: ScreenshotRow[] } | null> {
  if (isLocalTest(env)) {
    const app = store.apps.find((item) => item.slug === slug)
    if (!app) return null
    return {
      app,
      versions: store.versions
        .filter((version) => version.app_id === app.id)
        .sort((a, b) => Number(b.active) - Number(a.active) || b.version_code - a.version_code || b.created_at.localeCompare(a.created_at)),
      screenshots: store.screenshots
        .filter((shot) => shot.app_id === app.id)
        .sort((a, b) => a.sort - b.sort),
    }
  }

  const sql = db(env)
  await ensureSchema(env)
  const apps = (await sql`SELECT * FROM apps WHERE slug = ${slug} LIMIT 1`) as unknown as AppRow[]
  const app = apps[0]
  if (!app) return null

  const versions = (await sql`
    SELECT * FROM versions WHERE app_id = ${app.id} ORDER BY active DESC, version_code DESC, created_at DESC
  `) as unknown as VersionRow[]
  const screenshots = (await sql`
    SELECT * FROM screenshots WHERE app_id = ${app.id} ORDER BY sort ASC
  `) as unknown as ScreenshotRow[]

  return {
    app,
    versions: versions.map((version) => ({ ...version, size_bytes: Number(version.size_bytes) })),
    screenshots,
  }
}

export async function getDownloadTarget(
  env: Env,
  slug: string,
  versionId?: string,
): Promise<{ apkKey: string; versionName: string } | null> {
  if (isLocalTest(env)) {
    const app = store.apps.find((item) => item.slug === slug)
    if (!app) return null
    const version = versionId
      ? store.versions.find((item) => item.app_id === app.id && item.id === versionId)
      : latestVersion(app.id)
    return version ? { apkKey: version.apk_key, versionName: version.version_name } : null
  }

  const rows = (await db(env)`
    SELECT v.apk_key AS "apkKey", v.version_name AS "versionName"
    FROM versions v JOIN apps a ON a.id = v.app_id
    WHERE a.slug = ${slug}
      AND (${versionId ?? null}::text IS NULL OR v.id::text = ${versionId ?? null}::text)
      AND (${versionId ?? null}::text IS NOT NULL OR v.active = true)
    ORDER BY v.active DESC, v.version_code DESC, v.created_at DESC
    LIMIT 1
  `) as unknown as Array<{ apkKey: string; versionName: string }>

  return rows[0] ?? null
}

export async function getIconTarget(
  env: Env,
  slug: string,
): Promise<{ slug: string; iconKey: string } | null> {
  if (isLocalTest(env)) {
    const app = store.apps.find((item) => item.slug === slug)
    return app ? { slug: app.slug, iconKey: app.icon_key || `icons/${app.slug}.png` } : null
  }
  await ensureSchema(env)
  const rows = (await db(env)`
    SELECT slug, icon_key AS "iconKey" FROM apps WHERE slug = ${slug} LIMIT 1
  `) as unknown as Array<{ slug: string; iconKey: string | null }>
  const row = rows[0]
  return row ? { slug: row.slug, iconKey: row.iconKey || `icons/${row.slug}.png` } : null
}

export async function getPreviewTarget(
  env: Env,
  slug: string,
): Promise<{ slug: string; previewKey: string } | null> {
  if (isLocalTest(env)) {
    const app = store.apps.find((item) => item.slug === slug)
    return app ? { slug: app.slug, previewKey: app.preview_key || `previews/${app.slug}.png` } : null
  }
  await ensureSchema(env)
  const rows = (await db(env)`
    SELECT slug, preview_key AS "previewKey" FROM apps WHERE slug = ${slug} LIMIT 1
  `) as unknown as Array<{ slug: string; previewKey: string | null }>
  const row = rows[0]
  return row ? { slug: row.slug, previewKey: row.previewKey || `previews/${row.slug}.png` } : null
}

export interface NewApp {
  slug: string
  name: string
  tagline: string | null
  description: string | null
  status: AppRow['status']
  type?: 'apk' | 'web'
  live_url?: string | null
  repo_url?: string | null
  stack?: string | null
  sort: number
  icon_key?: string | null
  preview_key?: string | null
}

export async function insertApp(env: Env, input: NewApp): Promise<AppRow> {
  if (isLocalTest(env)) {
    if (store.apps.some((app) => app.slug === input.slug)) {
      throw new ApiError(409, 'E-DB', 'slug already exists')
    }
    const app: AppRow = {
      id: crypto.randomUUID(),
      ...input,
      type: input.type ?? 'apk',
      created_at: FIXED_TIME,
    }
    store.apps.push(app)
    return app
  }

  await ensureSchema(env)
  const rows = (await db(env)`
    INSERT INTO apps (slug, name, tagline, description, status, type, live_url, repo_url, stack, sort, icon_key, preview_key)
    VALUES (
      ${input.slug}, ${input.name}, ${input.tagline}, ${input.description}, ${input.status},
      ${input.type ?? 'apk'}, ${input.live_url ?? null}, ${input.repo_url ?? null}, ${input.stack ?? null},
      ${input.sort}, ${input.icon_key ?? null}, ${input.preview_key ?? null}
    )
    RETURNING *
  `) as unknown as AppRow[]
  return rows[0]
}

export interface NewVersion {
  appId: string
  versionName: string
  versionCode: number
  releaseNotes: string | null
  apkKey: string
  sizeBytes: number
  sha256: string
  active: boolean
}

export async function insertVersion(env: Env, input: NewVersion): Promise<VersionRow> {
  if (isLocalTest(env)) {
    if (!store.apps.some((app) => app.id === input.appId)) {
      throw new ApiError(404, 'E-NOTFOUND', 'app not found')
    }
    if (input.active) {
      for (const version of store.versions) {
        if (version.app_id === input.appId) version.active = false
      }
    }
    const version: VersionRow = {
      id: crypto.randomUUID(),
      app_id: input.appId,
      version_name: input.versionName,
      version_code: input.versionCode,
      release_notes: input.releaseNotes,
      apk_key: input.apkKey,
      size_bytes: input.sizeBytes,
      sha256: input.sha256,
      active: input.active,
      created_at: FIXED_TIME,
    }
    store.versions.push(version)
    return version
  }

  const sql = db(env)
  if (input.active) {
    await sql`UPDATE versions SET active = false WHERE app_id = ${input.appId} AND active = true`
  }
  const rows = (await sql`
    INSERT INTO versions (app_id, version_name, version_code, release_notes, apk_key, size_bytes, sha256, active)
    VALUES (${input.appId}, ${input.versionName}, ${input.versionCode}, ${input.releaseNotes},
            ${input.apkKey}, ${input.sizeBytes}, ${input.sha256}, ${input.active})
    RETURNING *
  `) as unknown as VersionRow[]
  return { ...rows[0], size_bytes: Number(rows[0].size_bytes) }
}

export interface VersionPatch {
  versionName?: string
  versionCode?: number
  releaseNotes?: string | null
  hasReleaseNotes?: boolean
  apkKey?: string
  sizeBytes?: number
  sha256?: string
  active?: boolean
}

export async function updateVersion(
  env: Env,
  id: string,
  patch: VersionPatch,
): Promise<VersionRow | null> {
  if (isLocalTest(env)) {
    const version = store.versions.find((item) => item.id === id)
    if (!version) return null
    if (patch.active) {
      store.versions.forEach((item) => {
        if (item.app_id === version.app_id && item.id !== id) item.active = false
      })
    }
    if (patch.versionName !== undefined) version.version_name = patch.versionName
    if (patch.versionCode !== undefined) version.version_code = patch.versionCode
    if (patch.hasReleaseNotes) version.release_notes = patch.releaseNotes ?? null
    if (patch.apkKey !== undefined) version.apk_key = patch.apkKey
    if (patch.sizeBytes !== undefined) version.size_bytes = patch.sizeBytes
    if (patch.sha256 !== undefined) version.sha256 = patch.sha256
    if (patch.active !== undefined) version.active = patch.active
    return version
  }

  const sql = db(env)
  await ensureSchema(env)
  const existing = (await sql`SELECT * FROM versions WHERE id::text = ${id}::text LIMIT 1`) as unknown as VersionRow[]
  const current = existing[0]
  if (!current) return null
  if (patch.active) {
    await sql`UPDATE versions SET active = false WHERE app_id = ${current.app_id} AND id::text <> ${id}::text AND active = true`
  }
  const nextNotes = patch.hasReleaseNotes ? (patch.releaseNotes ?? null) : current.release_notes
  const rows = (await sql`
    UPDATE versions SET
      version_name = COALESCE(${patch.versionName ?? null}, version_name),
      version_code = COALESCE(${patch.versionCode ?? null}, version_code),
      release_notes = ${nextNotes},
      apk_key = COALESCE(${patch.apkKey ?? null}, apk_key),
      size_bytes = COALESCE(${patch.sizeBytes ?? null}, size_bytes),
      sha256 = COALESCE(${patch.sha256 ?? null}, sha256),
      active = COALESCE(${patch.active ?? null}, active)
    WHERE id::text = ${id}::text
    RETURNING *
  `) as unknown as VersionRow[]
  return rows[0] ? { ...rows[0], size_bytes: Number(rows[0].size_bytes) } : null
}

export async function appExists(env: Env, appId: string): Promise<boolean> {
  if (isLocalTest(env)) return store.apps.some((app) => app.id === appId)
  const rows = (await db(env)`SELECT 1 AS ok FROM apps WHERE id = ${appId} LIMIT 1`) as unknown as unknown[]
  return rows.length > 0
}

export async function insertScreenshot(
  env: Env,
  appId: string,
  r2Key: string,
  caption: string | null,
  sort: number,
): Promise<ScreenshotRow> {
  if (isLocalTest(env)) {
    const shot: ScreenshotRow = {
      id: crypto.randomUUID(),
      app_id: appId,
      r2_key: r2Key,
      caption,
      sort,
    }
    store.screenshots.push(shot)
    return shot
  }

  const rows = (await db(env)`
    INSERT INTO screenshots (app_id, r2_key, caption, sort)
    VALUES (${appId}, ${r2Key}, ${caption}, ${sort})
    RETURNING *
  `) as unknown as ScreenshotRow[]
  return rows[0]
}

export interface AppPatch {
  name?: string
  tagline?: string | null
  description?: string | null
  status?: AppRow['status']
  type?: 'apk' | 'web'
  live_url?: string | null
  repo_url?: string | null
  stack?: string | null
  sort?: number
  icon_key?: string | null
  preview_key?: string | null
}

export async function updateApp(env: Env, id: string, patch: AppPatch): Promise<AppRow | null> {
  if (isLocalTest(env)) {
    const app = store.apps.find((item) => item.id === id)
    if (!app) return null
    Object.assign(app, patch)
    return app
  }

  await ensureSchema(env)
  const rows = (await db(env)`
    UPDATE apps SET
      name = COALESCE(${patch.name ?? null}, name),
      tagline = COALESCE(${patch.tagline ?? null}, tagline),
      description = COALESCE(${patch.description ?? null}, description),
      status = COALESCE(${patch.status ?? null}, status),
      type = COALESCE(${patch.type ?? null}, type),
      live_url = COALESCE(${patch.live_url ?? null}, live_url),
      repo_url = COALESCE(${patch.repo_url ?? null}, repo_url),
      stack = COALESCE(${patch.stack ?? null}, stack),
      sort = COALESCE(${patch.sort ?? null}, sort),
      icon_key = COALESCE(${patch.icon_key ?? null}, icon_key),
      preview_key = COALESCE(${patch.preview_key ?? null}, preview_key)
    WHERE id = ${id}
    RETURNING *
  `) as unknown as AppRow[]
  return rows[0] ?? null
}
