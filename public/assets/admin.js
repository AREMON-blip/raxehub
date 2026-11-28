import { ApiFailure, api, esc, ensureIdentity, formatBytes, formatChangelog, listApps, renderChangelogHtml, renderChrome, signOut } from './shared.js'
import { sha256File } from './sha256.js'

const MAX_UPLOAD_BYTES = 80 * 1024 * 1024
const MAX_ICON_BYTES = 2 * 1024 * 1024
const MAX_PREVIEW_BYTES = 4 * 1024 * 1024
const $ = (selector) => document.querySelector(selector)
const status = (message) => { $('[data-status]').textContent = message }
const progress = (selector, ratio) => { $(selector).style.width = `${Math.round(ratio * 100)}%` }

function putFile(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', url)
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total)
    }
    request.onload = () => (request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`R2 PUT ${request.status}`)))
    request.onerror = () => reject(new Error('R2 PUT gagal'))
    request.send(file)
  })
}

const cleanSlug = (value) => value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')

function appFields(form, iconKey) {
  return {
    name: form.name.value.trim(),
    tagline: form.tagline.value.trim() || null,
    description: form.description.value.trim() || null,
    status: form.status.value,
    sort: Number(form.sort.value) || 0,
    ...(iconKey ? { icon_key: iconKey } : {}),
  }
}

// Existing app -> PATCH metadata so the form is never dead; unknown slug -> auto-create.
async function resolveAppId(identity, form, iconKey) {
  const slug = cleanSlug(form.slug.value)
  const existing = await listApps(identity, 'apk')
  const found = existing.find((app) => app.slug === slug)
  if (found) {
    await api(`/api/admin/apps/${encodeURIComponent(found.id)}`, {
      identity, method: 'PATCH', body: appFields(form, iconKey),
    })
    return found.id
  }
  try {
    const created = await api('/api/admin/apps', {
      identity, method: 'POST', body: { slug, ...appFields(form, iconKey) },
    })
    return created.app.id
  } catch (error) {
    const again = await listApps(identity, 'apk')
    const retry = again.find((app) => app.slug === slug)
    if (retry) return retry.id
    throw error
  }
}

const NEW_APP = '__new__'

async function refreshAppSelect(identity, form, selectedSlug = NEW_APP) {
  const select = form.appSelect
  const apps = await listApps(identity, 'apk')
  select.innerHTML = `<option value="${NEW_APP}">+ App baru (buat otomatis)</option>${apps
    .map((app) => `<option value="${esc(app.slug)}">${esc(app.name)} (${esc(app.slug)})</option>`)
    .join('')}`
  select.value = apps.some((app) => app.slug === selectedSlug) ? selectedSlug : NEW_APP
  applyAppSelection(form, apps)
  return apps
}

function applyAppSelection(form, apps) {
  const chosen = apps.find((app) => app.slug === form.appSelect.value)
  form.slug.readOnly = !!chosen
  if (chosen) {
    form.slug.value = chosen.slug
    form.name.value = chosen.name || ''
    form.tagline.value = chosen.tagline || ''
    form.description.value = chosen.description || ''
    form.status.value = chosen.status || 'released'
    form.sort.value = chosen.sort ?? 0
  } else {
    form.slug.value = ''
    form.name.value = ''
    form.tagline.value = ''
    form.description.value = ''
    form.status.value = 'released'
  }
}

async function uploadIcon(identity, form, slug) {
  const file = form.icon.files[0]
  if (!file) return null
  if (file.type !== 'image/png' && !/\.png$/i.test(file.name)) throw new Error('Logo harus berformat PNG.')
  if (file.size === 0 || file.size > MAX_ICON_BYTES) throw new Error('Ukuran logo harus antara 1 byte dan 2 MB.')
  status('Meminta presign logo…')
  const signed = await api('/api/admin/presign-icon', {
    identity, method: 'POST', body: { slug, sizeBytes: file.size },
  })
  status('Mengunggah logo ke R2…')
  await putFile(signed.uploadUrl, file, () => {})
  return signed.key
}

async function bootAdmin(identity) {
  renderChrome('', ['Unggah APK langsung dari HP ke penyimpanan Raxe.'], { showSignOut: true })
  const form = document.getElementById('admin-form')
  const submit = form.querySelector('button[type="submit"]')
  let appCache = await refreshAppSelect(identity, form)
  let versionCache = []
  let activeSlug = ''

  const releasesWrap = document.getElementById('existing-releases-wrap')
  const releasesList = document.getElementById('existing-releases-list')
  const releasesCount = document.getElementById('existing-releases-count')
  const drawer = document.getElementById('version-drawer')
  const editForm = document.getElementById('edit-version-form')
  const editNotesEl = document.getElementById('e-notes')
  const editNotesPreview = document.getElementById('e-notes-preview')
  const editStatus = (msg) => { const el = $('[data-edit-status]'); if (el) el.textContent = msg }

  const updateEditPreview = () => {
    if (!editNotesEl || !editNotesPreview) return
    const raw = editNotesEl.value.trim()
    editNotesPreview.hidden = !raw
    editNotesPreview.innerHTML = raw ? `<span class="label">PRATINJAU CHANGELOG</span>${renderChangelogHtml(raw)}` : ''
  }

  const closeDrawer = () => {
    if (!drawer) return
    drawer.classList.remove('is-open')
    drawer.setAttribute('aria-hidden', 'true')
    window.setTimeout(() => { if (!drawer.classList.contains('is-open')) drawer.hidden = true }, 240)
  }

  const openDrawer = (version) => {
    if (!drawer || !editForm || !version) return
    editForm.versionId.value = version.id
    editForm.slug.value = activeSlug
    editForm.versionName.value = version.version_name || ''
    editForm.versionCode.value = version.version_code ?? ''
    editForm.releaseNotes.value = version.release_notes || ''
    editForm.apk.value = ''
    const sub = document.getElementById('drawer-sub')
    const title = document.getElementById('drawer-title')
    const curFile = document.getElementById('e-current-file')
    if (sub) sub.textContent = `EDIT RILIS · ${activeSlug.toUpperCase()}`
    if (title) title.textContent = `v${version.version_name}`
    if (curFile) curFile.textContent = `Saat ini: ${version.apk_key} (${formatBytes(version.size_bytes)})`
    const progWrap = document.getElementById('e-progress-wrap')
    if (progWrap) progWrap.hidden = true
    progress('#e-hash-bar', 0)
    progress('#e-upload-bar', 0)
    editStatus('')
    updateEditPreview()
    drawer.hidden = false
    drawer.setAttribute('aria-hidden', 'false')
    requestAnimationFrame(() => drawer.classList.add('is-open'))
  }

  const loadExistingReleases = async (slug) => {
    activeSlug = slug && slug !== NEW_APP ? slug : ''
    if (!releasesWrap || !releasesList) return
    if (!activeSlug) {
      versionCache = []
      releasesWrap.hidden = true
      releasesList.innerHTML = ''
      return
    }
    releasesWrap.hidden = false
    releasesList.innerHTML = '<span class="status-line">Memuat daftar rilis…</span>'
    try {
      const detail = await api(`/api/apps/${encodeURIComponent(activeSlug)}`, { identity })
      versionCache = Array.isArray(detail?.versions) ? detail.versions : []
      if (releasesCount) releasesCount.textContent = `${versionCache.length} versi`
      if (!versionCache.length) {
        releasesList.innerHTML = '<span class="status-line">Belum ada versi yang diunggah.</span>'
        return
      }
      releasesList.innerHTML = versionCache.map((v) => `
        <div class="release-item">
          <div class="release-info">
            <span class="label">v${esc(v.version_name)}${v.active ? ' · Aktif' : ''}</span>
            <span class="chip">code ${esc(v.version_code)}</span>
            <span class="chip">${esc(formatBytes(v.size_bytes))}</span>
            <span class="release-snippet">${esc((v.release_notes || 'Tanpa catatan').replace(/\s+/g, ' ').slice(0, 72))}</span>
          </div>
          <div class="btn-row" style="gap:6px;flex-wrap:nowrap">
            ${v.active ? '' : `<button class="btn btn-secondary" type="button" data-rollback-version="${esc(v.id)}" style="height:34px;padding:4px 10px;font-size:0.75rem">Undo / Aktifkan</button>`}
            <button class="btn btn-secondary" type="button" data-edit-version="${esc(v.id)}" style="height:34px;padding:4px 12px;font-size:0.75rem">Edit</button>
          </div>
        </div>
      `).join('')
    } catch {
      releasesList.innerHTML = '<span class="status-line">Gagal memuat daftar rilis.</span>'
    }
  }

  releasesList?.addEventListener('click', async (event) => {
    const target = event.target instanceof Element ? event.target : null
    const rollbackBtn = target?.closest('[data-rollback-version]')
    if (rollbackBtn) {
      const id = rollbackBtn.dataset.rollbackVersion
      rollbackBtn.disabled = true
      rollbackBtn.textContent = 'Mengaktifkan…'
      try {
        await api(`/api/admin/versions/${encodeURIComponent(id)}`, {
          identity, method: 'PATCH', body: { active: true },
        })
        await loadExistingReleases(activeSlug)
        status(`Versi aktif berhasil dikembalikan (rollback).`)
      } catch (error) {
        status(error.message || 'Gagal mengaktifkan versi.')
        rollbackBtn.disabled = false
        rollbackBtn.textContent = 'Undo / Aktifkan'
      }
      return
    }
    const btn = target?.closest('[data-edit-version]')
    if (!btn) return
    const v = versionCache.find((item) => item.id === btn.dataset.editVersion)
    if (v) openDrawer(v)
  })
  document.getElementById('drawer-close')?.addEventListener('click', closeDrawer)
  document.getElementById('drawer-cancel')?.addEventListener('click', closeDrawer)
  drawer?.addEventListener('click', (event) => { if (event.target === drawer) closeDrawer() })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer?.classList.contains('is-open')) closeDrawer()
  })
  editNotesEl?.addEventListener('input', updateEditPreview)
  document.getElementById('e-tidy-notes')?.addEventListener('click', () => {
    if (!editNotesEl) return
    editNotesEl.value = formatChangelog(editNotesEl.value)
    editNotesEl.classList.remove('is-picking')
    void editNotesEl.offsetWidth
    editNotesEl.classList.add('is-picking')
    window.setTimeout(() => editNotesEl.classList.remove('is-picking'), 360)
    updateEditPreview()
  })
  editForm?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const versionId = editForm.versionId.value
    const slug = editForm.slug.value
    const versionName = editForm.versionName.value.trim()
    const versionCode = Number(editForm.versionCode.value)
    const releaseNotes = formatChangelog(editForm.releaseNotes.value) || null
    const file = editForm.apk.files[0]
    if (file) {
      if (!/\.apk$/i.test(file.name)) return editStatus('Berkas pengganti harus berekstensi .apk.')
      if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return editStatus('Ukuran APK harus antara 1 byte dan 80 MB.')
    }
    const saveBtn = editForm.querySelector('button[type="submit"]')
    const progWrap = document.getElementById('e-progress-wrap')
    saveBtn.disabled = true
    editStatus('')
    try {
      const patch = { versionName, versionCode, releaseNotes }
      if (file) {
        if (progWrap) progWrap.hidden = false
        progress('#e-hash-bar', 0)
        progress('#e-upload-bar', 0)
        editStatus('Menghitung SHA256 APK pengganti…')
        const sha256 = await sha256File(file, (ratio) => progress('#e-hash-bar', ratio))
        editStatus('Meminta presign R2…')
        const signed = await api('/api/admin/presign-upload', {
          identity, method: 'POST',
          body: { fileName: file.name, sizeBytes: file.size, sha256, slug, versionName },
        })
        editStatus('Mengunggah APK pengganti ke R2…')
        await putFile(signed.uploadUrl, file, (ratio) => progress('#e-upload-bar', ratio))
        patch.apkKey = signed.key
        patch.sizeBytes = file.size
        patch.sha256 = sha256
      }
      editStatus('Menyimpan perubahan…')
      await api(`/api/admin/versions/${encodeURIComponent(versionId)}`, {
        identity, method: 'PATCH', body: patch,
      })
      editStatus('Perubahan tersimpan.')
      await loadExistingReleases(slug)
      window.setTimeout(closeDrawer, 420)
    } catch (error) {
      editStatus(error.message || 'Gagal menyimpan perubahan.')
    } finally {
      saveBtn.disabled = false
    }
  })

  form.appSelect.addEventListener('change', () => {
    applyAppSelection(form, appCache)
    loadExistingReleases(form.appSelect.value)
  })
  loadExistingReleases(form.appSelect.value)
  const notesEl = document.getElementById('f-notes')
  const notesPreview = document.getElementById('notes-preview')
  const updateNotesPreview = () => {
    if (!notesEl || !notesPreview) return
    const raw = notesEl.value.trim()
    notesPreview.hidden = !raw
    notesPreview.innerHTML = raw ? `<span class="label">PRATINJAU CHANGELOG</span>${renderChangelogHtml(raw)}` : ''
  }
  notesEl?.addEventListener('input', updateNotesPreview)
  document.getElementById('btn-tidy-notes')?.addEventListener('click', () => {
    if (!notesEl) return
    notesEl.value = formatChangelog(notesEl.value)
    notesEl.classList.remove('is-picking')
    void notesEl.offsetWidth
    notesEl.classList.add('is-picking')
    window.setTimeout(() => notesEl.classList.remove('is-picking'), 360)
    updateNotesPreview()
  })
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    status('')
    progress('#hash-bar', 0)
    progress('#upload-bar', 0)
    const file = form.apk.files[0]
    if (!file) return status('Pilih berkas APK terlebih dahulu.')
    if (!/\.apk$/i.test(file.name)) return status('Berkas harus berekstensi .apk.')
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return status('Ukuran APK harus antara 1 byte dan 80 MB.')
    }
    const slug = cleanSlug(form.slug.value)
    if (!slug) return status('Slug tidak valid.')
    submit.disabled = true
    try {
      const iconKey = await uploadIcon(identity, form, slug)
      status('Menghitung SHA256…')
      const sha256 = await sha256File(file, (ratio) => progress('#hash-bar', ratio))
      status('Meminta presign R2…')
      const signed = await api('/api/admin/presign-upload', {
        identity, method: 'POST',
        body: {
          fileName: file.name,
          sizeBytes: file.size,
          sha256,
          slug,
          versionName: form.versionName.value.trim(),
        },
      })
      status('Mengunggah ke R2…')
      await putFile(signed.uploadUrl, file, (ratio) => progress('#upload-bar', ratio))
      status('Menyimpan metadata…')
      const appId = await resolveAppId(identity, form, iconKey)
      await api('/api/admin/versions', {
        identity, method: 'POST',
        body: {
          appId,
          versionName: form.versionName.value.trim(),
          versionCode: Number(form.versionCode.value),
          releaseNotes: formatChangelog(form.releaseNotes.value) || null,
          apkKey: signed.key,
          sizeBytes: file.size,
          sha256,
          active: true,
        },
      })
      status(`Selesai. ${signed.key}`)
      $('#admin-result').innerHTML = `<a class="btn btn-secondary" href="/app/${esc(slug)}" style="margin-top:16px">Lihat detail app</a>`
      appCache = await refreshAppSelect(identity, form, slug)
      await loadExistingReleases(slug)
    } catch (error) {
      if (error instanceof ApiFailure && error.status === 403) {
        status('Akses admin ditolak. Masuk sebagai admin untuk mengunggah.')
      } else {
        status(error.message || 'Upload gagal.')
      }
    } finally {
      submit.disabled = false
    }
  })

  const webForm = document.getElementById('web-form')
  const webStatus = (msg) => { const el = $('[data-web-status]'); if (el) el.textContent = msg }
  if (webForm) {
    const webSubmit = webForm.querySelector('button[type="submit"]')
    const applyWeb = (webs) => {
      const chosen = webs.find((w) => w.slug === webForm.webSelect.value)
      webForm.slug.readOnly = !!chosen
      webForm.slug.value = chosen?.slug || ''
      webForm.name.value = chosen?.name || ''
      webForm.tagline.value = chosen?.tagline || ''
      webForm.description.value = chosen?.description || ''
      webForm.liveUrl.value = chosen?.live_url || ''
      webForm.repoUrl.value = chosen?.repo_url || ''
      webForm.stack.value = Array.isArray(chosen?.stack) ? chosen.stack.join(', ') : (chosen?.stack || '')
      webForm.sort.value = chosen?.sort ?? 30
    }
    const refreshWebs = async (selected = NEW_APP) => {
      const webs = await listApps(identity, 'web')
      webForm.webSelect.innerHTML = `<option value="${NEW_APP}">+ Web baru</option>${webs
        .map((w) => `<option value="${esc(w.slug)}">${esc(w.name)} (${esc(w.slug)})</option>`)
        .join('')}`
      webForm.webSelect.value = webs.some((w) => w.slug === selected) ? selected : NEW_APP
      applyWeb(webs)
      return webs
    }
    let webCache = await refreshWebs()
    webForm.webSelect.addEventListener('change', () => applyWeb(webCache))
    webForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      webStatus('')
      const slug = cleanSlug(webForm.slug.value)
      if (!slug) return webStatus('Slug web tidak valid.')
      const previewFile = webForm.preview.files[0]
      if (previewFile && (previewFile.size === 0 || previewFile.size > MAX_PREVIEW_BYTES)) {
        return webStatus('Ukuran preview maksimal 4 MB.')
      }
      webSubmit.disabled = true
      try {
        let previewKey = null
        if (previewFile) {
          webStatus('Meminta presign preview…')
          const signed = await api('/api/admin/presign-preview', {
            identity, method: 'POST', body: { slug, sizeBytes: previewFile.size },
          })
          webStatus('Mengunggah preview ke R2…')
          await putFile(signed.uploadUrl, previewFile, () => {})
          previewKey = signed.key
        }
        webStatus('Menyimpan karya web…')
        const payload = {
          name: webForm.name.value.trim(),
          tagline: webForm.tagline.value.trim() || null,
          description: webForm.description.value.trim() || null,
          status: 'released',
          type: 'web',
          live_url: webForm.liveUrl.value.trim() || null,
          repo_url: webForm.repoUrl.value.trim() || null,
          stack: webForm.stack.value.trim() || null,
          sort: Number(webForm.sort.value) || 0,
          ...(previewKey ? { preview_key: previewKey } : {}),
        }
        const existing = webCache.find((w) => w.slug === slug)
        if (existing) {
          await api(`/api/admin/apps/${encodeURIComponent(existing.id)}`, { identity, method: 'PATCH', body: payload })
        } else {
          await api('/api/admin/apps', { identity, method: 'POST', body: { slug, ...payload } })
        }
        webStatus(`Karya web tersimpan: ${slug}`)
        $('#web-result').innerHTML = '<a class="btn btn-secondary" href="/web" style="margin-top:8px">Lihat di Galeri Web</a>'
        webCache = await refreshWebs(slug)
      } catch (error) {
        webStatus(error.message || 'Gagal menyimpan karya web.')
      } finally {
        webSubmit.disabled = false
      }
    })
  }

  const shotForm = document.getElementById('shot-form')
  const shotStatus = (msg) => { const el = $('[data-shot-status]'); if (el) el.textContent = msg }
  if (shotForm) {
    const shotSubmit = shotForm.querySelector('button[type="submit"]')
    shotForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      const file = shotForm.image.files[0]
      if (!file) return shotStatus('Pilih gambar screenshot terlebih dahulu.')
      const slug = shotForm.slug.value.trim().toLowerCase()
      shotSubmit.disabled = true
      try {
        shotStatus('Mencari app…')
        const existing = await listApps(identity, 'apk')
        const found = existing.find((app) => app.slug === slug)
        if (!found) throw new Error(`Slug "${slug}" tidak ditemukan.`)
        shotStatus('Meminta presign R2…')
        const signed = await api(`/api/admin/upload-screenshot/${encodeURIComponent(found.id)}`, {
          identity, method: 'POST',
          body: {
            fileName: file.name,
            caption: shotForm.caption.value.trim() || null,
            sort: Number(shotForm.sort.value) || 0,
          },
        })
        shotStatus('Mengunggah gambar ke R2…')
        await putFile(signed.uploadUrl, file, () => {})
        shotStatus(`Screenshot tersimpan: ${signed.key}`)
        shotForm.reset()
      } catch (error) {
        shotStatus(error.message || 'Gagal mengunggah screenshot.')
      } finally {
        shotSubmit.disabled = false
      }
    })
  }
}

const gate = document.getElementById('admin-gate')
const content = document.getElementById('admin-content')

try {
  const identity = await ensureIdentity(gate)
  if (identity) {
    await api('/api/admin/me', { identity })
    gate.hidden = true
    content.hidden = false
    await bootAdmin(identity)
  }
} catch (error) {
  gate.innerHTML = `<div class="card"><h1 class="h2">Akses admin ditolak</h1>
    <p class="lead" style="margin-top:12px">${esc(error.message || 'Verifikasi akun gagal.')}</p>
    <div class="btn-row" style="margin-top:20px">
      <button class="btn btn-primary" id="admin-relogin" type="button">Ganti akun</button>
      <a class="btn btn-secondary" href="/">Kembali ke beranda</a>
    </div></div>`
  document.getElementById('admin-relogin')?.addEventListener('click', async () => {
    await signOut()
    location.reload()
  })
}
