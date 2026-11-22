export const PK = window.RAXEHUB_CLERK_PUBLISHABLE_KEY || ''

export const APK_SEED = [
  {
    slug: 'kroma', name: 'KROMA', tagline: 'Player musik pribadi.',
    description: 'Putar berkas lokal di HP. Antrian, sleep timer, tanpa akun.', status: 'released',
  },
  {
    slug: 'tabungku', name: 'Tabungku', tagline: 'Tabungan berdasar tujuan.',
    description: 'Satu tujuan, satu tabungan. Catat setoran, lihat sisa target.', status: 'released',
  },
  {
    slug: 'gps-tracker', name: 'GPS Tracker', tagline: 'Pelacak lokasi.',
    description: 'Lacak posisi HP. Riwayat rute, tanpa toko.', status: 'released',
  },
]

export const WEB_SEED = [
  {
    slug: 'tahun-baru-countdown', name: 'Tahun Baru Countdown', tagline: 'Callsign Radio.',
    description: 'Hitung mundur tahun baru. Angka live Firebase, bukan palsu.',
    stack: ['Next.js', 'Firebase', 'Vercel'],
    live_url: 'https://tahun-baru-countdown-eosin.vercel.app/', repo_url: '',
  },
  {
    slug: 'crypto-blog', name: 'Crypto Blog', tagline: 'Catatan beranda.',
    description: 'Tulisan crypto di Vercel. Next 16. Bukan sinyal trading.',
    stack: ['Next.js 16', 'Vercel'],
    live_url: 'https://crypto-blog-ten.vercel.app/beranda', repo_url: '',
  },
]

export class ApiFailure extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const esc = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c])

export const isReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
const isLocalHost = () =>
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.hostname.endsWith('.localhost')

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script')
    tag.src = src
    tag.onload = resolve
    tag.onerror = () => reject(new Error(`load failed: ${src}`))
    document.head.appendChild(tag)
  })
}

export function fatal(message) {
  const main = document.getElementById('main')
  if (main) main.innerHTML = `<section class="section wrap"><div class="card"><h1 class="h2">RaxeHub</h1><p class="lead" style="margin-top:12px">${esc(message)}</p></div></section>`
}

let clerkLoad
function loadClerk() {
  if (!clerkLoad) {
    clerkLoad = (async () => {
      await loadScript('https://cdn.clerk.io/clerk.js')
      await window.Clerk.load({ publishableKey: PK })
      return window.Clerk
    })()
  }
  return clerkLoad
}

export async function ensureIdentity() {
  if (!PK && !isLocalHost()) {
    fatal('Publishable key Clerk belum dikonfigurasi. Hubungi admin.')
    return null
  }
  if (PK) {
    const clerk = await loadClerk()
    if (!clerk.user) {
      await clerk.redirectToSignIn()
      return null
    }
    return { email: clerk.user.primaryEmailAddress?.emailAddress || '', dev: false }
  }
  const requested = new URLSearchParams(location.search).get('as')
  if (requested) localStorage.setItem('raxehub_test_email', requested)
  if (localStorage.getItem('raxehub_signed_out') === '1') return null
  return { email: localStorage.getItem('raxehub_test_email') || 'circle@raxehub.test', dev: true }
}

export async function signOut() {
  if (PK) {
    const clerk = await loadClerk()
    await clerk.signOut()
    return
  }
  localStorage.setItem('raxehub_signed_out', '1')
  location.href = '/rejected?code=SIGNOUT'
}

export async function api(path, { identity, method = 'GET', body, headers = {} } = {}) {
  const requestHeaders = { ...headers }
  if (identity?.dev) requestHeaders.Authorization = `Bearer test:${identity.email}`
  else if (window.Clerk?.session) {
    const token = await window.Clerk.session.getToken()
    if (token) requestHeaders.Authorization = `Bearer ${token}`
  }
  if (body !== undefined) requestHeaders['content-type'] = 'application/json'
  const response = await fetch(path, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  })
  const raw = await response.text()
  let data = null
  try { data = JSON.parse(raw) } catch { /* non-JSON */ }
  if (!response.ok) {
    const code = data?.code || ''
    if (response.status === 403 && path.startsWith('/api/admin')) {
      location.replace('/rejected?code=E-NOTADMIN')
    }
    throw new ApiFailure(response.status, code, data?.error || raw || response.statusText)
  }
  return data
}

export function renderChrome(active, footerCopy, { showSignOut = false } = {}) {
  const nav = document.getElementById('nav-mount')
  if (nav) {
    const tabs = [['home', '/', 'Home'], ['apk', '/apk', 'APK'], ['web', '/web', 'Web']]
    nav.innerHTML = `<nav class="nav" aria-label="Utama"><div class="nav-inner wrap"><span class="nav-word">RaxeHub</span><div class="nav-grid">
      ${tabs.map(([key, href, label]) => `<a class="nav-link" href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
      ${showSignOut ? '<button class="nav-link nav-signout" id="signout" type="button">Keluar</button>' : ''}
    </div></div></nav>`
    document.getElementById('signout')?.addEventListener('click', () => { signOut() })
  }
  const foot = document.getElementById('footer-mount')
  if (foot) {
    foot.innerHTML = `<footer class="footer"><div class="wrap"><div class="footer-grid">
      ${footerCopy.map((line) => `<span>${esc(line)}</span>`).join('')}
      <span class="label">© ${new Date().getFullYear()} Raxe Workshop</span>
    </div></div></footer>`
  }
  const update = () => document.querySelector('.nav')?.classList.toggle('is-scrolled', window.scrollY > 48)
  update()
  window.addEventListener('scroll', update, { passive: true })
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i += 1 }
  return `${value.toFixed(i ? 1 : 0)} ${units[i]}`
}

export function skeletonCards(count = 3) {
  return Array.from({ length: count }, () => '<div class="skeleton skeleton-card" aria-hidden="true"></div>').join('')
}

export async function listApps(identity, type) {
  const data = await api(`/api/apps?type=${encodeURIComponent(type)}`, { identity })
  return Array.isArray(data?.apps) ? data.apps : []
}

export function mergeCatalog(seed, live) {
  const bySlug = new Map((live || []).map((item) => [item.slug, item]))
  return seed.map((item) => {
    const row = bySlug.get(item.slug)
    if (!row) return item
    return {
      ...item,
      status: row.status || item.status,
      latestVersion: row.latestVersion || null,
      live_url: row.live_url || item.live_url || '',
      repo_url: row.repo_url ?? item.repo_url ?? '',
      stack: Array.isArray(row.stack) ? row.stack : item.stack || [],
    }
  })
}

export function wireCards() {
  document.querySelectorAll('[data-detail-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const icon = link.querySelector('.tile-icon')
      if (icon && 'viewTransitionName' in icon.style) icon.style.viewTransitionName = 'app-icon'
    })
  })
  if (!finePointer() || isReduced()) return
  document.querySelectorAll('[data-magnetic]').forEach((node) => {
    node.addEventListener('pointermove', (event) => {
      const rect = node.getBoundingClientRect()
      const x = Math.max(-8, Math.min(8, (event.clientX - rect.left - rect.width / 2) * 0.2))
      const y = Math.max(-8, Math.min(8, (event.clientY - rect.top - rect.height / 2) * 0.2))
      node.style.transform = `translate(${x}px, ${y}px)`
    })
    node.addEventListener('pointerleave', () => { node.style.transform = '' })
  })
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      card.style.transform = `rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) translateY(-4px)`
    })
    card.addEventListener('pointerleave', () => { card.style.transform = '' })
  })
}

export async function initLandingMotion() {
  const host = document.querySelector('[data-mark]')
  if (host) {
    try {
      const svg = await (await fetch('/assets/mark.svg')).text()
      host.innerHTML = svg
    } catch { /* mark missing: chrome still renders */ }
  }
  const mark = document.querySelector('.mark-in')
  if (isReduced()) {
    mark?.classList.add('is-in')
    return
  }
  try {
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js'),
    ])
  } catch {
    mark?.classList.add('is-in')
    return
  }

  const { gsap, ScrollTrigger, Lenis } = window
  gsap.registerPlugin(ScrollTrigger)
  const lenis = new Lenis({ lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  mark?.classList.add('is-in')
  gsap.to('.hero-mark-host', {
    yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })
  gsap.to('.plate-a', {
    yPercent: 20, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })
  gsap.to('.plate-b', {
    yPercent: -20, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })
  const groups = document.querySelectorAll('.tiles [data-reveal]')
  if (groups.length) {
    gsap.from(groups, {
      opacity: 0, y: 32, duration: 0.64, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.tiles', start: 'top 85%', toggleActions: 'play none none none' },
    })
  }
  const about = document.querySelector('.tentang')
  if (about) {
    gsap.from(about, {
      opacity: 0, y: 32, duration: 0.64, ease: 'power3.out',
      scrollTrigger: { trigger: about, start: 'top 85%', toggleActions: 'play none none none' },
    })
  }
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
}

export function copyButton(text) {
  return `<button class="btn btn-secondary" type="button" data-copy="${esc(text)}" style="height:36px;padding:6px 12px;font-size:0.8125rem">Salin</button>`
}

export function wireCopy() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy)
        const original = button.textContent
        button.textContent = 'Tersalin'
        setTimeout(() => { button.textContent = original }, 1200)
      } catch {
        button.textContent = 'Gagal'
      }
    })
  })
}
