import assert from 'node:assert/strict'

const BASE = process.env.BASE ?? 'http://127.0.0.1:8807'
const ADMIN = { authorization: 'Bearer test:admin@raxehub.test' }
const CIRCLE = { authorization: 'Bearer test:circle@raxehub.test' }
const OUTSIDER = { authorization: 'Bearer test:outsider@example.test' }
const SHA = 'b'.repeat(64)

async function req(path, { method = 'GET', headers = {}, body } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...headers,
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  })
  const raw = await response.text()
  let data = null
  try {
    data = JSON.parse(raw)
  } catch {
    // non-JSON response (302 has empty body)
  }
  return { status: response.status, headers: response.headers, data, raw }
}

function expect(result, status, code) {
  assert.equal(result.status, status, `${status} expected, got ${result.status}: ${result.raw}`)
  if (code) assert.equal(result.data?.code, code, `expected ${code}: ${result.raw}`)
}

let ready = false
for (let attempt = 0; attempt < 180; attempt += 1) {
  try {
    if ((await req('/api/health')).status === 200) {
      ready = true
      break
    }
  } catch {
    // dev server still booting
  }
  await new Promise((resolve) => setTimeout(resolve, 250))
}
assert.ok(ready, 'wrangler pages dev did not become ready')

const config = await req('/config')
expect(config, 200)
assert.match(config.headers.get('content-type') ?? '', /application\/javascript/)
assert.match(config.raw, /^window\.RAXEHUB_CLERK_PUBLISHABLE_KEY = /)

const meAnon = await req('/api/admin/me')
expect(meAnon, 401, 'E-AUTH')
const meAdmin = await req('/api/admin/me', { headers: ADMIN })
expect(meAdmin, 200)
assert.equal(meAdmin.data.email, 'admin@raxehub.test')

const health = await req('/api/health')
expect(health, 200)
assert.deepEqual(
  { status: health.data.status, neon: health.data.neon, r2: health.data.r2, clerk: health.data.clerk },
  { status: 'ok', neon: 'ok', r2: 'ok', clerk: 'local' },
)

const apps = await req('/api/apps')
expect(apps, 200)
assert.ok(Array.isArray(apps.data.apps) && apps.data.apps.length >= 2)
assert.equal(apps.data.apps[0].slug, 'gps-tracker')
assert.equal(apps.data.apps[0].latestVersion.versionCode, 201)

const detail = await req('/api/apps/gps-tracker')
expect(detail, 200)
assert.equal(detail.data.app.slug, 'gps-tracker')
assert.equal(detail.data.versions.length, 1)
assert.equal(detail.data.screenshots.length, 1)
assert.equal(detail.data.versions[0].sha256.length, 64)
expect(await req('/api/apps/does-not-exist'), 404, 'E-NOTFOUND')

const download = await req('/api/download/gps-tracker')
expect(download, 302)
const location = new URL(download.headers.get('location'))
assert.match(location.host, /\.r2\.cloudflarestorage\.com$/)
assert.doesNotMatch(location.host, /r2\.dev/)
assert.match(location.searchParams.get('response-content-disposition') ?? '', /^attachment; filename=/)
assert.match(location.pathname, /\/apps\/gps-tracker\/gpstracker-2\.0\.1\.apk$/)
assert.equal(location.searchParams.get('X-Amz-Expires'), '900')
assert.match(location.searchParams.get('response-content-disposition') ?? '', /^attachment; filename=/)

const versionDownload = await req('/api/download/gps-tracker/22222222-2222-4222-8222-222222222222')
expect(versionDownload, 302)
assert.equal(
  new URL(versionDownload.headers.get('location')).searchParams.get('X-Amz-Expires'),
  '900',
)
expect(await req('/api/download/does-not-exist'), 404, 'E-NOTFOUND')

expect(await req('/api/admin/presign-upload', { method: 'POST', body: {} }), 401, 'E-AUTH')
expect(
  await req('/api/admin/presign-upload', { headers: OUTSIDER, method: 'POST', body: {} }),
  403,
  'E-AUTH',
)
expect(
  await req('/api/admin/presign-upload', { headers: CIRCLE, method: 'POST', body: {} }),
  403,
  'E-AUTH',
)

const presign = await req('/api/admin/presign-upload', {
  headers: ADMIN,
  method: 'POST',
  body: {
    fileName: 'gpstracker-2.0.1.apk',
    sizeBytes: 12_345_678,
    sha256: SHA,
    slug: 'gps-tracker',
    versionName: '2.0.1',
  },
})
expect(presign, 200)
assert.match(presign.data.key, /^apps\/gps-tracker\//)
assert.equal(presign.data.method, 'PUT')
assert.equal(presign.data.expiresIn, 900)
assert.equal(new URL(presign.data.uploadUrl).searchParams.get('X-Amz-Expires'), '900')

expect(
  await req('/api/admin/presign-upload', {
    headers: ADMIN,
    method: 'POST',
    body: { fileName: 'bad.apk', sizeBytes: 10, sha256: 'not-a-hash' },
  }),
  400,
  'E-BODY',
)

const createdApp = await req('/api/admin/apps', {
  headers: ADMIN,
  method: 'POST',
  body: { slug: 'new-app', name: 'New App', tagline: 'fresh', status: 'released', sort: 2 },
})
expect(createdApp, 201)
assert.equal(createdApp.data.app.slug, 'new-app')

const createdVersion = await req('/api/admin/versions', {
  headers: ADMIN,
  method: 'POST',
  body: {
    appId: createdApp.data.app.id,
    versionName: '1.0.0',
    versionCode: 100,
    releaseNotes: 'first',
    apkKey: 'apps/new-app/new-app-1.0.0.apk',
    sizeBytes: 1000,
    sha256: SHA,
  },
})
expect(createdVersion, 201)
assert.equal(createdVersion.data.version.active, true)

const SHA2 = 'b'.repeat(64)
const patchedVersion = await req(`/api/admin/versions/${createdVersion.data.version.id}`, {
  headers: ADMIN,
  method: 'PATCH',
  body: {
    versionName: '1.0.1',
    releaseNotes: '- Perbaikan cepat\n- Ganti berkas APK',
    apkKey: 'apps/new-app/new-app-1.0.1.apk',
    sizeBytes: 2048,
    sha256: SHA2,
  },
})
expect(patchedVersion, 200)
assert.equal(patchedVersion.data.version.version_name, '1.0.1')
assert.equal(patchedVersion.data.version.apk_key, 'apps/new-app/new-app-1.0.1.apk')
assert.equal(patchedVersion.data.version.size_bytes, 2048)
assert.equal(patchedVersion.data.version.sha256, SHA2)
assert.match(patchedVersion.data.version.release_notes, /Perbaikan cepat/)
expect(
  await req('/api/admin/versions/00000000-0000-4000-8000-000000000000', {
    headers: ADMIN,
    method: 'PATCH',
    body: { releaseNotes: 'x' },
  }),
  404,
  'E-NOTFOUND',
)

const screenshot = await req(`/api/admin/upload-screenshot/${createdApp.data.app.id}`, {
  headers: ADMIN,
  method: 'POST',
  body: { fileName: 'home.png', caption: 'Beranda', sort: 0 },
})
expect(screenshot, 200)
assert.match(screenshot.data.key, /screenshots\/home\.png$/)
assert.equal(screenshot.data.expiresIn, 900)

const patched = await req(`/api/admin/apps/${createdApp.data.app.id}`, {
  headers: ADMIN,
  method: 'PATCH',
  body: { status: 'coming-soon' },
})
expect(patched, 200)
assert.equal(patched.data.app.status, 'coming-soon')

const iconPatch = await req(`/api/admin/apps/${createdApp.data.app.id}`, {
  headers: ADMIN,
  method: 'PATCH',
  body: { description: 'Deskripsi baru', tagline: 'Tagline baru', icon_key: 'icons/new-app.png' },
})
expect(iconPatch, 200)
assert.equal(iconPatch.data.app.description, 'Deskripsi baru')
assert.equal(iconPatch.data.app.tagline, 'Tagline baru')
assert.equal(iconPatch.data.app.icon_key, 'icons/new-app.png')

const iconRedirect = await req('/api/icon/gps-tracker')
expect(iconRedirect, 302)
const iconUrl = new URL(iconRedirect.headers.get('location'))
assert.match(iconUrl.host, /\.r2\.cloudflarestorage\.com$/)
assert.match(iconUrl.pathname, /\/icons\/gps-tracker\.png$/)
assert.equal(iconUrl.searchParams.get('X-Amz-Expires'), '3600')
assert.equal(iconUrl.searchParams.get('response-content-disposition'), null)
const iconDb = await req('/api/icon/new-app.png')
expect(iconDb, 302)
assert.match(new URL(iconDb.headers.get('location')).pathname, /\/icons\/new-app\.png$/)
expect(await req('/api/icon/does-not-exist'), 404, 'E-NOTFOUND')

const presignIcon = await req('/api/admin/presign-icon', {
  headers: ADMIN, method: 'POST', body: { slug: 'new-app', sizeBytes: 4180 },
})
expect(presignIcon, 200)
assert.match(presignIcon.data.key, /^icons\/new-app\.png$/)
assert.equal(presignIcon.data.method, 'PUT')
expect(
  await req('/api/admin/presign-icon', {
    headers: ADMIN, method: 'POST', body: { slug: 'new-app', sizeBytes: 3 * 1024 * 1024 },
  }),
  400,
  'E-BODY',
)
expect(await req('/api/admin/presign-icon', { method: 'POST', body: { slug: 'x', sizeBytes: 1 } }), 401, 'E-AUTH')
expect(
  await req('/api/admin/presign-icon', { headers: CIRCLE, method: 'POST', body: { slug: 'x', sizeBytes: 1 } }),
  403,
  'E-AUTH',
)

// Union catalog: DB-only app appears, live wins over seed, seed fills only when DB is down.
globalThis.window = {}
const { mergeCatalog, APK_SEED } = await import('./public/assets/shared.js')
const liveApps = (await req('/api/apps')).data.apps
const union = mergeCatalog(APK_SEED, liveApps)
assert.ok(union.some((app) => app.slug === 'new-app'), 'DB-only app must appear in union catalog')
assert.equal(union.find((app) => app.slug === 'new-app').icon_key, 'icons/new-app.png')
assert.equal(union.find((app) => app.slug === 'gps-tracker').name, 'GPS Tracker')
assert.deepEqual(mergeCatalog(APK_SEED, []).map((app) => app.slug), APK_SEED.map((app) => app.slug))

const createdWeb = await req('/api/admin/apps', {
  headers: ADMIN,
  method: 'POST',
  body: {
    slug: 'demo-web',
    name: 'Demo Web',
    tagline: 'Web baru dari admin',
    description: 'Testing web creation from admin',
    type: 'web',
    live_url: 'https://example.com',
    stack: 'Next.js, Vercel',
    sort: 30,
  },
})
expect(createdWeb, 201)
assert.equal(createdWeb.data.app.type, 'web')
assert.equal(createdWeb.data.app.live_url, 'https://example.com')

const presignPreview = await req('/api/admin/presign-preview', {
  headers: ADMIN,
  method: 'POST',
  body: { slug: 'demo-web', sizeBytes: 12345 },
})
expect(presignPreview, 200)
assert.equal(presignPreview.data.key, 'previews/demo-web.png')

const previewRedirect = await req('/api/preview/demo-web')
expect(previewRedirect, 302)
assert.match(new URL(previewRedirect.headers.get('location')).pathname, /\/previews\/demo-web\.png$/)
expect(await req('/api/preview/does-not-exist'), 404, 'E-NOTFOUND')

for (const path of [
  '/icons/kroma.png', '/icons/tabungku.png', '/icons/gps-tracker.png',
  '/previews/tahun-baru-countdown-360.png', '/previews/tahun-baru-countdown-1080.png',
  '/previews/crypto-blog-360.png', '/previews/crypto-blog-1080.png',
  '/screenshots/kroma-1.png', '/screenshots/kroma-2.png', '/screenshots/kroma-3.png',
  '/screenshots/gps-tracker-1.png', '/screenshots/gps-tracker-2.png', '/screenshots/gps-tracker-3.png',
]) {
  const asset = await req(path)
  expect(asset, 200)
  assert.match(asset.headers.get('content-type') ?? '', /image\/png/)
}

expect(await req('/api/health'), 200)
console.log('test-api: PASS (all routes)')
