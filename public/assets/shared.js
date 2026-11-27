export const PK = window.RAXEHUB_CLERK_PUBLISHABLE_KEY || ''

export const APK_SEED = [
  {
    slug: 'kroma', name: 'KROMA', tagline: 'Pemutar musik lokal, tanpa akun',
    description: 'Pemutar musik buat berkas audio lokal di HP. Susun antrian sendiri, pasang sleep timer, putar offline. Gak ada akun, gak ada iklan, gak ngumpulin data.', status: 'released',
  },
  {
    slug: 'tabungku', name: 'Tabungku', tagline: 'Tabungan dengan tujuan',
    description: 'Satu tujuan, satu tabungan. Bikin target, catat setoran, sisa target kelihatan langsung di layar utama. Semua data disimpan di HP, gak ada cloud.', status: 'released',
  },
  {
    slug: 'gps-tracker', name: 'GPS Tracker', tagline: 'Catat jejak perjalanan HP',
    description: 'Lacak posisi HP otomatis: rute harian, jarak tempuh, riwayat bisa diputar ulang. Data 100% lokal, tanpa server, tanpa orang lain yang bisa lihat.', status: 'released',
  },
]

export const WEB_SEED = [
  {
    slug: 'tahun-baru-countdown', name: 'Tahun Baru Countdown', tagline: 'Hitung mundur tahun baru',
    description: 'Angka live tersinkron lewat Firebase — semua yang buka lihat hitungan yang sama persis. Dipakai buat countdown bareng grup.',
    stack: ['Next.js', 'Firebase', 'Vercel'],
    live_url: 'https://tahun-baru-countdown-eosin.vercel.app/', repo_url: '',
  },
  {
    slug: 'crypto-blog', name: 'Crypto Blog', tagline: 'Catatan tulisan crypto',
    description: 'Kumpulan analisis dan catatan teknis crypto yang gw pelajari. Bukan sinyal trading, bukan ajakan beli apa pun.',
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

export function loadScript(src, attributes = {}) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script')
    tag.src = src
    for (const [name, value] of Object.entries(attributes)) tag.setAttribute(name, value)
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
      const clerkDomain = atob(PK.split('_')[2]).slice(0, -1)
      await Promise.all([
        loadScript(`https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, {
          'data-clerk-publishable-key': PK,
          crossorigin: 'anonymous',
        }),
        loadScript(`https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`, {
          crossorigin: 'anonymous',
        }),
      ])
      await window.Clerk.load({
        ui: { ClerkUI: window.__internal_ClerkUICtor },
      })
      return window.Clerk
    })()
  }
  return clerkLoad
}

export async function ensureIdentity(mountEl = null) {
  if (!PK && !isLocalHost()) {
    fatal('Publishable key Clerk belum dikonfigurasi. Hubungi admin.')
    return null
  }
  if (PK) {
    const clerk = await loadClerk()
    if (!clerk.user) {
      if (mountEl) {
        mountEl.innerHTML = '<div id="clerk-signin" style="display:flex;justify-content:center;padding-block:24px"></div>'
        clerk.mountSignIn(mountEl.querySelector('#clerk-signin'), {
          forceRedirectUrl: '/admin',
          fallbackRedirectUrl: '/admin',
        })
      } else {
        await clerk.redirectToSignIn({
          signInFallbackRedirectUrl: '/admin',
          signInForceRedirectUrl: '/admin',
        })
      }
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
    </div></div><div class="scroll-progress" aria-hidden="true"></div></nav>`
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
  const data = await api(`/api/apps${type ? `?type=${encodeURIComponent(type)}` : ''}`, { identity })
  const rows = Array.isArray(data?.apps) ? data.apps : []
  return type ? rows.filter((item) => (item.type || 'apk') === type) : rows
}

// DB-first union: live rows win; seed only fills slugs missing from DB (or everything when DB is down/empty).
export function mergeCatalog(seed, live) {
  if (!Array.isArray(live) || !live.length) return seed
  const seedBySlug = new Map((seed || []).map((item) => [item.slug, item]))
  const merged = live.map((row) => {
    const base = seedBySlug.get(row.slug) || {}
    return {
      ...base,
      ...row,
      name: row.name || base.name,
      tagline: row.tagline || base.tagline || '',
      description: row.description || base.description || '',
      icon_key: row.icon_key || null,
      preview_key: row.preview_key || null,
      live_url: row.live_url || base.live_url || '',
      repo_url: row.repo_url ?? base.repo_url ?? '',
      stack: Array.isArray(row.stack) && row.stack.length ? row.stack : base.stack || [],
      latestVersion: row.latestVersion || null,
    }
  })
  const liveSlugs = new Set(live.map((row) => row.slug))
  return merged.concat((seed || []).filter((item) => !liveSlugs.has(item.slug)))
}

export function wireCards() {
  const pulseSelect = (el) => {
    if (!el) return
    el.classList.remove('is-picking')
    void el.offsetWidth
    el.classList.add('is-picking')
    window.setTimeout(() => el.classList.remove('is-picking'), 360)
  }
  document.querySelectorAll('[data-detail-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const card = link.closest('.card')
      pulseSelect(card)
      const icon = link.closest('.card')?.querySelector('.tile-icon') || link.querySelector('.tile-icon')
      if (icon && 'viewTransitionName' in icon.style) icon.style.viewTransitionName = 'app-icon'
    })
  })
  document.querySelectorAll('.web-card .btn, .nav-link').forEach((control) => {
    control.addEventListener('pointerdown', () => pulseSelect(control.closest('.card') || control))
  })
  document.querySelectorAll('select').forEach((sel) => {
    if (sel.dataset.pickWired) return
    sel.dataset.pickWired = '1'
    sel.addEventListener('change', () => pulseSelect(sel))
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
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`)
      card.style.setProperty('--my', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`)
    })
  })
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      card.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-4px)`
    })
    card.addEventListener('pointerleave', () => { card.style.transform = '' })
  })
}

function scrambleText(el, durationMs = 520) {
  if (!el || isReduced()) return
  const target = el.dataset.scrambleOrig || el.textContent || ''
  el.dataset.scrambleOrig = target
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+-'
  const start = performance.now()
  const step = (now) => {
    const progress = Math.min(1, (now - start) / durationMs)
    const lockCount = Math.floor(progress * target.length)
    let out = ''
    for (let i = 0; i < target.length; i += 1) {
      const ch = target[i]
      if (ch === ' ' || ch === '/' || i < lockCount) out += ch
      else out += glyphs[Math.floor(Math.random() * glyphs.length)]
    }
    el.textContent = out
    if (progress < 1) requestAnimationFrame(step)
    else el.textContent = target
  }
  requestAnimationFrame(step)
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
  const lenis = new Lenis({ lerp: 0.12 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // Editorial split-character mask reveal on hero word (keeps aria-label intact).
  const heroWord = document.querySelector('.hero-word')
  if (heroWord && !heroWord.dataset.split) {
    const raw = heroWord.textContent || ''
    heroWord.setAttribute('aria-label', raw)
    heroWord.dataset.split = '1'
    heroWord.innerHTML = [...raw]
      .map((ch) => `<span class="char-mask" aria-hidden="true"><span class="char-in">${ch === ' ' ? '&nbsp;' : esc(ch)}</span></span>`)
      .join('')
  }

  mark?.classList.add('is-in')
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
  if (document.querySelectorAll('.hero-word .char-in').length) {
    intro.from('.hero-word .char-in', { yPercent: 110, duration: 0.52, stagger: 0.035 })
  }
  intro.from('.hero-type .label, .hero-tagline, .hero-type .btn-row', {
    y: 14, duration: 0.42, stagger: 0.06,
  }, '-=0.34')

  // Scroll progress hairline: native CSS scroll-driven animation runs on the compositor;
  // only attach GSAP fallback in browsers without animation-timeline: scroll().
  if (!CSS.supports('animation-timeline', 'scroll()')) {
    gsap.to('.scroll-progress', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true },
    })
  }

  // Kinetic scrubbed parallax on hero mark, plates, and ghost typography.
  gsap.to('.hero-mark-host', {
    yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })
  gsap.to('.plate-a', {
    yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })
  gsap.to('.plate-b', {
    yPercent: -18, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })
  gsap.to('.ghost-a', {
    xPercent: -12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  })
  gsap.to('.ghost-b', {
    xPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  })

  // Snappy batch stagger for APK tiles & Web cards (never leaves cards stuck at opacity:0).
  ScrollTrigger.batch('.tile, .web-card', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch, { y: 22, scale: 0.98 }, {
        y: 0, scale: 1, duration: 0.42, stagger: 0.06, ease: 'power3.out', overwrite: 'auto',
      })
    },
  })

  // Curtain clip-path unmask on Web preview thumbnails.
  if (document.querySelectorAll('#home-web .web-thumb').length) {
    gsap.from('#home-web .web-thumb', {
      clipPath: 'inset(8% 0% 8% 0%)', duration: 0.52, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '#home-web', start: 'top 90%', once: true },
    })
  }

  // Ambient cursor glow & subtle mark depth using gsap.quickTo (compositor-only).
  const hero = document.querySelector('.hero')
  const glow = document.querySelector('.hero-glow')
  if (hero && glow && finePointer()) {
    const xGlow = gsap.quickTo(glow, 'x', { duration: 0.45, ease: 'power3' })
    const yGlow = gsap.quickTo(glow, 'y', { duration: 0.45, ease: 'power3' })
    const markEl = hero.querySelector('.hero-mark-host')
    const xMark = markEl ? gsap.quickTo(markEl, 'x', { duration: 0.5, ease: 'power3' }) : null
    const yMark = markEl ? gsap.quickTo(markEl, 'y', { duration: 0.5, ease: 'power3' }) : null
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect()
      const rx = event.clientX - rect.left
      const ry = event.clientY - rect.top
      xGlow(rx - 210)
      yGlow(ry - 210)
      if (xMark && yMark) {
        xMark(((rx / rect.width) - 0.5) * 14)
        yMark(((ry / rect.height) - 0.5) * 10)
      }
    })
    hero.addEventListener('pointerleave', () => { xMark?.(0); yMark?.(0) })
  }

  // Gentle ambient breath on background plates & floating hero mark (pure transform).
  gsap.to('.plate-a', { rotation: 16, y: -14, duration: 5.2, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  gsap.to('.plate-b', { rotation: -13, y: 14, duration: 5.8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  gsap.to('.hero-mark-host svg', { y: -6, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' })

  // Subtle idle drift on giant ghost typography so hero feels alive even before scroll.
  gsap.fromTo('.ghost-a', { xPercent: -2 }, { xPercent: 3, duration: 7.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  gsap.fromTo('.ghost-b', { xPercent: 2 }, { xPercent: -3, duration: 8.2, repeat: -1, yoyo: true, ease: 'sine.inOut' })

  // Floating micro-sparks particle field inside hero.
  const sparkHost = document.querySelector('.hero-sparks')
  if (sparkHost && !sparkHost.childElementCount) {
    for (let i = 0; i < 14; i += 1) {
      const dot = document.createElement('span')
      dot.className = 'hero-spark'
      dot.style.left = `${(i * 7.3 + 4) % 94}%`
      dot.style.top = `${(i * 19.7 + 10) % 86}%`
      sparkHost.appendChild(dot)
      gsap.fromTo(dot,
        { opacity: 0.12, scale: 0.65, y: 0, x: 0 },
        {
          opacity: 0.75, scale: 1.35,
          y: (i % 2 === 0 ? -1 : 1) * (18 + (i % 4) * 8),
          x: (i % 3 === 0 ? 1 : -1) * (10 + (i % 3) * 6),
          duration: 2.6 + (i % 5) * 0.65,
          delay: (i % 4) * 0.35,
          repeat: -1, yoyo: true, ease: 'sine.inOut',
        },
      )
    }
  }

  // Editorial text scramble on hero eyebrow & interactive hover scramble on RaxeHub wordmark.
  scrambleText(document.querySelector('.hero-type .label'), 640)
  const navWord = document.querySelector('.nav-word')
  if (navWord && !navWord.dataset.scrambleWired) {
    navWord.dataset.scrambleWired = '1'
    navWord.addEventListener('pointerenter', () => scrambleText(navWord, 360))
  }
  gsap.from('.nav-link', { y: -8, opacity: 0, duration: 0.36, stagger: 0.05, ease: 'power3.out' })

  const footer = document.querySelector('.footer-grid')
  if (footer) {
    gsap.from(footer.children, {
      y: 12, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: footer, start: 'top 96%', once: true },
    })
  }

  const about = document.querySelector('.tentang')
  if (about) {
    const aboutTl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: about, start: 'top 88%', once: true },
    })
    aboutTl
      .from(about.querySelectorAll('.label, .h2'), { y: 16, duration: 0.44, stagger: 0.06 })
      .from(about.querySelector('.tentang-line'), { scaleX: 0, duration: 0.46 }, '-=0.28')
      .from(about.querySelectorAll('p'), { y: 14, duration: 0.42, stagger: 0.08 }, '-=0.28')
  }
  gsap.utils.toArray('#rilis-title, #web-home-title').forEach((heading) => {
    gsap.from(heading, {
      y: 16, duration: 0.42, ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 92%', once: true },
    })
  })
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
}

export async function initDetailMotion() {
  if (isReduced()) return
  try {
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js'),
    ])
  } catch { return }

  const { gsap, ScrollTrigger, Lenis } = window
  gsap.registerPlugin(ScrollTrigger)
  const lenis = new Lenis({ lerp: 0.12 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  const head = document.querySelector('.detail-head')
  if (head) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from(head.querySelector('.detail-icon'), { scale: 0.9, y: 10, duration: 0.42 })
      .from(head.querySelectorAll('.badge, .h1, .lead'), { y: 14, duration: 0.4, stagger: 0.05 }, '<0.06')
  }
  ScrollTrigger.batch('.shot', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch, { y: 18, scale: 0.96 }, { y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out', overwrite: 'auto' })
    },
  })
  ScrollTrigger.batch('.version-row', {
    start: 'top 94%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch, { y: 14 }, { y: 0, duration: 0.36, stagger: 0.05, ease: 'power3.out', overwrite: 'auto' })
    },
  })
}

export async function initCatalogMotion() {
  if (isReduced()) return
  try {
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js'),
    ])
  } catch { return }

  const { gsap, ScrollTrigger, Lenis } = window
  gsap.registerPlugin(ScrollTrigger)
  const lenis = new Lenis({ lerp: 0.12 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  const title = document.querySelector('main h1.h1')
  if (title && !title.dataset.split) {
    const raw = title.textContent || ''
    title.setAttribute('aria-label', raw)
    title.dataset.split = '1'
    title.innerHTML = [...raw]
      .map((ch) => `<span class="char-mask" aria-hidden="true"><span class="char-in">${ch === ' ' ? '&nbsp;' : esc(ch)}</span></span>`)
      .join('')
    gsap.from('main h1.h1 .char-in', { yPercent: 110, duration: 0.48, stagger: 0.03, ease: 'power4.out' })
  }
  if (document.querySelector('main .lead')) {
    gsap.from('main .lead', { y: 12, duration: 0.4, delay: 0.12, ease: 'power3.out' })
  }
  ScrollTrigger.batch('#catalog .tile, #catalog .web-card', {
    start: 'top 94%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch, { y: 20, scale: 0.98 }, {
        y: 0, scale: 1, duration: 0.42, stagger: 0.06, ease: 'power3.out', overwrite: 'auto',
      })
    },
  })
  if (document.querySelectorAll('#catalog .web-thumb').length) {
    gsap.from('#catalog .web-thumb', {
      clipPath: 'inset(8% 0% 8% 0%)', duration: 0.5, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '#catalog', start: 'top 92%', once: true },
    })
  }
}

const HEADING_RE = /^(fitur baru|perbaikan(?: & penyempurnaan)?|penyempurnaan|perubahan|bug\s*fix(?:es)?|catatan|peningkatan|added|fixed|changed|improved|removed|update[sd]?|whats? new)$/i

export function formatChangelog(raw) {
  const input = String(raw || '').replace(/\r\n?/g, '\n').trim()
  if (!input) return ''
  let lines = input.split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean)
  if (lines.length === 1 && lines[0].includes(';')) {
    const parts = lines[0].split(/\s*;\s*/).map((s) => s.trim()).filter(Boolean)
    if (parts.length > 1) lines = parts
  }
  const out = []
  const bulletRe = /^(?:[-–—*•▪▸]+|\d+[.)])\s*/
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const hasBullet = bulletRe.test(line)
    const stripped = line.replace(bulletRe, '').trim()
    if (!stripped) continue
    const noColon = stripped.replace(/:$/, '').trim()
    const isHeading = !hasBullet && noColon.length <= 42 && (
      HEADING_RE.test(noColon) ||
      (stripped.endsWith(':') && !noColon.includes(':'))
    )
    if (isHeading) {
      if (out.length && out[out.length - 1] !== '') out.push('')
      out.push(`${noColon.charAt(0).toUpperCase()}${noColon.slice(1)}:`)
    } else {
      const cap = stripped.charAt(0).toUpperCase() + stripped.slice(1)
      out.push(`- ${cap}`)
    }
  }
  return out.join('\n')
}

export function renderChangelogHtml(raw) {
  const formatted = formatChangelog(raw)
  if (!formatted) return '<p class="body muted">Tanpa catatan rilis.</p>'
  const lines = formatted.split('\n')
  const blocks = []
  let items = []
  const flush = () => {
    if (!items.length) return
    blocks.push(`<ul class="changelog-list">${items.join('')}</ul>`)
    items = []
  }
  for (const line of lines) {
    if (!line.trim()) continue
    if (line.startsWith('- ')) {
      const body = line.slice(2).trim()
      const idx = body.indexOf(':')
      const hasLead = idx > 1 && idx <= 64 && body.slice(idx + 1).trim().length > 0 && !/^https?$/i.test(body.slice(0, idx))
      const content = hasLead
        ? `<strong class="changelog-lead">${esc(body.slice(0, idx))}</strong>: ${esc(body.slice(idx + 1).trim())}`
        : esc(body)
      items.push(`<li>${content}</li>`)
    } else {
      flush()
      blocks.push(`<h4 class="changelog-heading">${esc(line.replace(/:$/, ''))}</h4>`)
    }
  }
  flush()
  return `<div class="changelog-block">${blocks.join('')}</div>`
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
