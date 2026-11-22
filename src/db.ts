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
  const rows = (await db(env)`
    SELECT a.id, a.slug, a.name, a.tagline, a.description, a.status,
           a.type, a.live_url, a.repo_url, a.stack, a.sort, a.created_at,
           v.version_name AS "versionName", v.version_code AS "versionCode", v.size_bytes AS "sizeBytes"
    FROM apps a
    LEFT JOIN versions v ON v.id = (
      SELECT id FROM versions WHERE app_id = a.id AND active = true ORDER BY created_at DESC LIMIT 1
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
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
      screenshots: store.screenshots
        .filter((shot) => shot.app_id === app.id)
        .sort((a, b) => a.sort - b.sort),
    }
  }

  const sql = db(env)
  const apps = (await sql`SELECT * FROM apps WHERE slug = ${slug} LIMIT 1`) as unknown as AppRow[]
  const app = apps[0]
  if (!app) return null

  const versions = (await sql`
    SELECT * FROM versions WHERE app_id = ${app.id} ORDER BY created_at DESC
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
      AND (${versionId ?? null}::text IS NULL OR v.id = ${versionId ?? null}::text)
      AND (${versionId ?? null}::text IS NOT NULL OR v.active = true)
    ORDER BY v.created_at DESC
    LIMIT 1
  `) as unknown as Array<{ apkKey: string; versionName: string }>

  return rows[0] ?? null
}

export interface NewApp {
  slug: string
  name: string
  tagline: string | null
  description: string | null
  status: AppRow['status']
  sort: number
}

export async function insertApp(env: Env, input: NewApp): Promise<AppRow> {
  if (isLocalTest(env)) {
    if (store.apps.some((app) => app.slug === input.slug)) {
      throw new ApiError(409, 'E-DB', 'slug already exists')
    }
    const app: AppRow = {
      id: crypto.randomUUID(),
      ...input,
      created_at: FIXED_TIME,
    }
    store.apps.push(app)
    return app
  }

  const rows = (await db(env)`
    INSERT INTO apps (slug, name, tagline, description, status, sort)
    VALUES (${input.slug}, ${input.name}, ${input.tagline}, ${input.description}, ${input.status}, ${input.sort})
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
  sort?: number
}

export async function updateApp(env: Env, id: string, patch: AppPatch): Promise<AppRow | null> {
  if (isLocalTest(env)) {
    const app = store.apps.find((item) => item.id === id)
    if (!app) return null
    Object.assign(app, patch)
    return app
  }

  const rows = (await db(env)`
    UPDATE apps SET
      name = COALESCE(${patch.name ?? null}, name),
      tagline = COALESCE(${patch.tagline ?? null}, tagline),
      description = COALESCE(${patch.description ?? null}, description),
      status = COALESCE(${patch.status ?? null}, status),
      sort = COALESCE(${patch.sort ?? null}, sort)
    WHERE id = ${id}
    RETURNING *
  `) as unknown as AppRow[]
  return rows[0] ?? null
}
