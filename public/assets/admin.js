import { ApiFailure, api, esc, ensureIdentity, listApps, renderChrome, signOut } from './shared.js'
import { sha256File } from './sha256.js'

const MAX_UPLOAD_BYTES = 80 * 1024 * 1024
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

async function resolveAppId(identity, form) {
  const slug = form.slug.value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  const existing = await listApps(identity, 'apk')
  const found = existing.find((app) => app.slug === slug)
  if (found) return found.id
  try {
    const created = await api('/api/admin/apps', {
      identity, method: 'POST',
      body: {
        slug,
        name: form.name.value.trim(),
        tagline: form.tagline.value.trim() || null,
        description: form.description.value.trim() || null,
        status: form.status.value,
        sort: Number(form.sort.value) || 0,
      },
    })
    return created.app.id
  } catch (error) {
    const again = await listApps(identity, 'apk')
    const retry = again.find((app) => app.slug === slug)
    if (retry) return retry.id
    throw error
  }
}

async function bootAdmin(identity) {
  renderChrome('', ['Unggah APK langsung dari HP ke penyimpanan Raxe.'], { showSignOut: true })
  const form = document.getElementById('admin-form')
  const submit = form.querySelector('button[type="submit"]')
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
    submit.disabled = true
    try {
      status('Menghitung SHA256…')
      const sha256 = await sha256File(file, (ratio) => progress('#hash-bar', ratio))
      status('Meminta presign R2…')
      const signed = await api('/api/admin/presign-upload', {
        identity, method: 'POST',
        body: {
          fileName: file.name,
          sizeBytes: file.size,
          sha256,
          slug: form.slug.value.trim(),
          versionName: form.versionName.value.trim(),
        },
      })
      status('Mengunggah ke R2…')
      await putFile(signed.uploadUrl, file, (ratio) => progress('#upload-bar', ratio))
      status('Menyimpan metadata…')
      const appId = await resolveAppId(identity, form)
      await api('/api/admin/versions', {
        identity, method: 'POST',
        body: {
          appId,
          versionName: form.versionName.value.trim(),
          versionCode: Number(form.versionCode.value),
          releaseNotes: form.releaseNotes.value.trim() || null,
          apkKey: signed.key,
          sizeBytes: file.size,
          sha256,
          active: true,
        },
      })
      status(`Selesai. ${signed.key}`)
      $('#admin-result').innerHTML = `<a class="btn btn-secondary" href="/app/${esc(form.slug.value.trim().toLowerCase())}" style="margin-top:16px">Lihat detail app</a>`
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
