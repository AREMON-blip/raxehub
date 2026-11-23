import {
  APK_SEED, WEB_SEED, ApiFailure, PK, api, copyButton, esc,
  formatBytes, initLandingMotion, listApps, mergeCatalog, renderChrome, skeletonCards,
  wireCards, wireCopy,
} from './shared.js'

function versionLabel(app) {
  return app?.latestVersion?.versionName ? `v${app.latestVersion.versionName}` : 'Rilis'
}

const PREVIEW_SLUGS = new Set(['tahun-baru-countdown', 'crypto-blog'])
const STATIC_SHOTS = {
  kroma: [1, 2, 3].map((n) => ({ src: `/screenshots/kroma-${n}.png`, caption: `Tampilan ${n}` })),
  tabungku: [1, 2, 3].map((n) => ({ src: `/screenshots/tabungku-${n}.png`, caption: `Tampilan ${n}` })),
  'gps-tracker': [1, 2, 3].map((n) => ({ src: `/screenshots/gps-tracker-${n}.png`, caption: `Tampilan ${n}` })),
}

const ICON_FALLBACK_JS = "if(this.dataset.fallback&&!this.dataset.tried){this.dataset.tried='1';this.src=this.dataset.fallback}else{var p=this.parentNode;p.textContent=p.dataset.initials||'';p.removeAttribute('style')}"

// 3-tier icon: DB icon_key (/api/icon/<slug>) > static /icons/<slug>.png > initials.
function iconHtml(app, large = false) {
  const cls = `tile-icon${large ? ' detail-icon' : ''}`
  const initials = esc(app.name.slice(0, 2).toUpperCase())
  const size = large ? 96 : 64
  const slug = encodeURIComponent(app.slug)
  const primary = app.icon_key ? `/api/icon/${slug}` : `/icons/${slug}.png`
  const fallback = app.icon_key ? `/icons/${slug}.png` : ''
  return `<span class="${cls}" data-initials="${initials}" style="width:${size}px;height:${size}px;background:#19191B;border-color:#2A2A2C">
    <img src="${primary}" data-fallback="${fallback}" alt="${esc(app.name)}" width="${size}" height="${size}"
      loading="lazy" onerror="${ICON_FALLBACK_JS}" style="display:block;width:100%;height:100%;object-fit:contain">
  </span>`
}

function previewHtml(app) {
  if (!PREVIEW_SLUGS.has(app.slug)) return `WEB / ${esc(app.name.slice(0, 2).toUpperCase())}`
  const file = `/previews/${encodeURIComponent(app.slug)}`
  return `<picture style="display:block;width:100%;height:100%">
    <source media="(min-width:680px)" srcset="${file}-1080.png">
    <img src="${file}-360.png" alt="Pratinjau ${esc(app.name)}" loading="lazy"
      style="display:block;width:100%;height:100%;object-fit:cover">
  </picture>`
}

function tileHtml(app, featured = false) {
  const ready = app.latestVersion !== null
  return `<article class="card tile tilt-scene${featured ? ' card-featured' : ''}" data-tilt data-reveal>
    <div class="tile-top">${iconHtml(app)}<span class="badge">RILIS</span></div>
    <h3 class="h3">${esc(app.name)}</h3>
    <p class="tile-desc">${esc(app.description || app.tagline || '')}</p>
    <div class="tile-foot"><span class="label">${esc(versionLabel(app))}</span>
      <a class="btn btn-secondary" href="/app/${encodeURIComponent(app.slug)}" data-detail-link data-magnetic style="height:40px;padding:8px 14px">Buka detail</a>
    </div>
  </article>`
}

function downloadControl(slug, versionId = '', label = 'Unduh APK') {
  const target = `/api/download/${encodeURIComponent(slug)}${versionId ? `/${encodeURIComponent(versionId)}` : ''}`
  return `<a class="btn btn-primary" href="${target}">${label}</a>`
}

async function loadCatalog(type, seed) {
  try {
    return mergeCatalog(seed, await listApps(null, type))
  } catch {
    return seed
  }
}

async function bootHome() {
  renderChrome('home', [
    'APK dipasang dari luar toko aplikasi. Izinkan sumber tidak dikenal saat memasang.',
    'Web dibuka di tab baru. Tidak ada data pribadi yang dikumpulkan di sini.',
  ])
  const mount = document.getElementById('tiles')
  mount.innerHTML = skeletonCards(3)
  const apps = await loadCatalog('apk', APK_SEED)
  mount.innerHTML = apps.map((app, index) => tileHtml(app, index === 0)).join('')
  const webMount = document.getElementById('home-web')
  if (webMount) {
    webMount.innerHTML = skeletonCards(2)
    const webs = await loadCatalog('web', WEB_SEED)
    webMount.innerHTML = webs.map(webCard).join('')
  }
  wireCards()
  initLandingMotion()
}

async function bootApk() {
  renderChrome('apk', [
    'Unduh APK langsung dari penyimpanan Raxe, tanpa halaman perantara.',
    'Instal dari sumber tidak dikenal perlu diizinkan di pengaturan HP.',
  ])
  const mount = document.getElementById('catalog')
  mount.innerHTML = `<div class="tiles">${skeletonCards(3)}</div>`
  const apps = await loadCatalog('apk', APK_SEED)
  mount.innerHTML = `<div class="tiles">${apps.map((app, index) => tileHtml(app, index === 0)).join('')}</div>
    <div class="status-line" data-status style="margin-top:16px"></div>`
  wireCards()
}

function webCard(app) {
  const live = !!app.live_url
  const source = !!app.repo_url
  return `<article class="card web-card">
    <div class="web-thumb" style="overflow:hidden">${previewHtml(app)}</div>
    <div class="web-body">
      <div class="tile-top"><h3 class="h3">${esc(app.name)}</h3><span class="badge">WEB</span></div>
      <p class="lead">${esc(app.tagline || '')}</p>
      <p class="web-desc">${esc(app.description || '')}</p>
      <div class="chip-row">${(app.stack || []).map((chip) => `<span class="chip">${esc(chip)}</span>`).join('')}</div>
      <div class="btn-row" style="margin-top:auto">
        ${live
          ? `<a class="btn btn-primary" href="${esc(app.live_url)}" target="_blank" rel="noopener noreferrer">Buka live</a>`
          : '<button class="btn" disabled type="button">Buka live</button>'}
        ${source
          ? `<a class="btn btn-secondary" href="${esc(app.repo_url)}" target="_blank" rel="noopener noreferrer">Source</a>`
          : '<button class="btn btn-secondary" disabled type="button">Source</button>'}
      </div>
    </div>
  </article>`
}

async function bootWeb() {
  renderChrome('web', [
    'Tautan live dibuka di tab baru.',
    'Tombol Source aktif hanya bila repo publik tersedia.',
  ])
  const mount = document.getElementById('catalog')
  mount.innerHTML = `<div class="web-grid">${skeletonCards(2)}</div>`
  const apps = await loadCatalog('web', WEB_SEED)
  mount.innerHTML = `<div class="web-grid">${apps.map(webCard).join('')}</div>`
}

function seedFor(slug) {
  return [...APK_SEED, ...WEB_SEED].find((item) => item.slug === slug) || null
}

function webDetail(app) {
  return `<div class="detail-head">
      ${iconHtml(app, true)}
      <div><span class="badge">WEB</span><h1 class="h1" style="margin-top:12px">${esc(app.name)}</h1>
      <p class="lead" style="margin-top:8px">${esc(app.tagline || '')}</p></div>
    </div>
    <div class="web-thumb" style="overflow:hidden;aspect-ratio:9/16;max-height:560px">${previewHtml(app)}</div>
    <div class="stack">
      <p class="body secondary">${esc(app.description || '')}</p>
      <div class="chip-row">${(app.stack || []).map((chip) => `<span class="chip">${esc(chip)}</span>`).join('')}</div>
      <div class="btn-row">
        ${app.live_url ? `<a class="btn btn-primary" href="${esc(app.live_url)}" target="_blank" rel="noopener noreferrer">Buka live</a>` : '<button class="btn" disabled type="button">Buka live</button>'}
        ${app.repo_url ? `<a class="btn btn-secondary" href="${esc(app.repo_url)}" target="_blank" rel="noopener noreferrer">Source</a>` : '<button class="btn btn-secondary" disabled type="button">Source</button>'}
      </div>
    </div>`
}

function shotHtml(shot, app) {
  if (!shot.src) return `<div class="shot"><span>${esc(shot.caption || 'Tampilan')}</span></div>`
  return `<figure class="shot" style="padding:0;overflow:hidden;position:relative;margin:0"><img src="${esc(shot.src)}" alt="${esc(shot.caption || app.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">${shot.caption ? `<figcaption style="position:absolute;inset:auto 0 0 0;padding:8px 10px;background:linear-gradient(transparent,rgba(0,0,0,0.78));color:#EDEDED">${esc(shot.caption)}</figcaption>` : ''}</figure>`
}

function apkDetail(app, detail) {
  const versions = detail?.versions || []
  const dbShots = (detail?.screenshots || []).map((shot) => ({ src: shot.url, caption: shot.caption }))
  const screenshots = [...dbShots, ...(STATIC_SHOTS[app.slug] || [])]
  const latest = versions[0] || null
  const shots = screenshots.length
    ? screenshots.map((shot) => shotHtml(shot, app)).join('')
    : '<div class="shot"><span>Belum ada screenshot</span></div>'
  const changelog = versions.length
    ? versions.map((item) => `<div class="version-row">
        <div class="version-meta"><span class="label">v${esc(item.version_name)}</span><span class="chip">${esc(formatBytes(item.size_bytes))}</span></div>
        <p class="body secondary">${esc(item.release_notes || 'Tanpa catatan rilis.')}</p>
      </div>`).join('')
    : '<p class="body muted">Belum ada riwayat rilis.</p>'
  return `<div class="detail-head">
      ${iconHtml(app, true)}
      <div><span class="badge">RILIS</span><h1 class="h1" style="margin-top:12px">${esc(app.name)}</h1>
      <p class="lead" style="margin-top:8px">${esc(app.tagline || '')}</p></div>
    </div>
    <div class="detail-grid">
      <div class="stack">
        <p class="body secondary">${esc(app.description || '')}</p>
        <section class="stack"><h2 class="h2">Tampilan</h2><div class="shot-grid">${shots}</div></section>
        <section class="stack"><h2 class="h2">Changelog</h2>${changelog}</section>
      </div>
      <aside class="stack">
        <div class="field"${versions.length ? '' : ' style="display:none"'}><label class="label" for="version-select">Versi</label>
          <select id="version-select"><option value="">Terbaru</option>
            ${versions.map((item) => `<option value="${esc(item.id)}">v${esc(item.version_name)}</option>`).join('')}
          </select>
        </div>
        <div class="btn-row">${latest ? downloadControl(app.slug) : '<button class="btn btn-primary" disabled type="button">Belum ada rilis</button>'}</div>
        <div class="status-line" data-status></div>
        <div class="stack">
          <h3 class="h3">Integritas berkas</h3>
          <div class="sha-box"><span class="label">SHA256</span>
            <div class="sha-value">${esc(latest?.sha256 || 'Tersedia setelah versi dirilis.')}</div>
            ${latest ? copyButton(latest.sha256) : ''}
          </div>
        </div>
        <div class="info-box"><span class="label">INSTAL DARI SUMBER TIDAK DIKENAL</span>
          <span>Hp akan menampilkan peringatan saat memasang APK di luar toko aplikasi. Izinkan instal dari sumber tidak dikenal untuk aplikasi ini, lalu pasang seperti biasa.</span>
        </div>
      </aside>
    </div>`
}

async function bootDetail() {
  renderChrome('apk', [
    'Unduh APK langsung dari penyimpanan Raxe, tanpa halaman perantara.',
    'Instal dari sumber tidak dikenal perlu diizinkan di pengaturan HP.',
  ])
  const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '')
  const mount = document.getElementById('detail')
  mount.innerHTML = skeletonCards(2)
  let detail = null
  try {
    detail = await api(`/api/apps/${encodeURIComponent(slug)}`)
  } catch (error) {
    if (!(error instanceof ApiFailure && error.status === 404)) console.warn('[raxehub] detail', error)
  }
  const seed = seedFor(slug)
  if (!detail && !seed) {
    mount.innerHTML = '<div class="card"><h1 class="h2">App tidak ditemukan</h1><p class="lead" style="margin-top:12px">Slug tidak ada di rak ini.</p></div>'
    return
  }
  const live = detail?.app || null
  const app = live && seed
    ? {
        ...seed,
        ...live,
        name: live.name || seed.name,
        tagline: live.tagline || seed.tagline,
        description: live.description || seed.description,
        stack: Array.isArray(live.stack) && live.stack.length ? live.stack : seed.stack,
      }
    : live || seed
  const isWeb = (app.type || (WEB_SEED.some((item) => item.slug === slug) ? 'web' : 'apk')) === 'web'
  document.title = `${app.name} — RaxeHub`
  mount.innerHTML = `<div class="detail">${isWeb ? webDetail(app) : apkDetail(app, detail)}</div>`
  wireCopy()
  const select = document.getElementById('version-select')
  select?.addEventListener('change', () => {
    const link = mount.querySelector('.btn-primary[href^="/api/download/"]')
    if (link) link.href = `/api/download/${encodeURIComponent(slug)}${select.value ? `/${encodeURIComponent(select.value)}` : ''}`
  })
}

function bootRejected() {
  const code = new URLSearchParams(location.search).get('code') || 'E-AUTH'
  renderChrome('', ['Akses dibatasi untuk pengelola RaxeHub.'])
  const copy = {
    E_AUTH: ['Sesi belum masuk', 'Masuk dengan akun admin untuk membuka halaman pengelola.'],
    'E-NOTADMIN': ['Akses admin ditolak', 'Akun ini tidak punya akses admin.'],
    SIGNOUT: ['Kamu sudah keluar', 'Sesi admin diakhiri.'],
  }
  const [title, body] = copy[code] || copy.E_AUTH
  const dev = !PK
  document.getElementById('reject').innerHTML = `<div class="card">
    <span class="tile-icon">RH</span>
    <h1 class="h2" style="margin-top:20px">${title}</h1>
    <p class="lead" style="margin-top:12px">${body}</p>
    <p class="label" style="margin-top:20px">KODE: ${esc(code)}</p>
    <div class="btn-row" style="margin-top:24px">
      ${dev ? '<a class="btn btn-primary" href="/admin?as=admin%40raxehub.test">Masuk sebagai admin</a>' : ''}
      <a class="btn btn-secondary" href="/">Kembali ke beranda</a>
    </div></div>`
}

const page = document.body.dataset.page
if (page === 'rejected') bootRejected()
else if (page === 'home') await bootHome()
else if (page === 'apk') await bootApk()
else if (page === 'web') await bootWeb()
else if (page === 'detail') await bootDetail()
