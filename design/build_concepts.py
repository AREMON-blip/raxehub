"""RaxeHub concept boards. Authentic mecha-R copied, not redrawn."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'assets'
FONTS = ROOT / 'fonts'

APPS = [
    {'name': 'GPS Tracker', 'tag': 'APK rilis di library', 'ver': 'v2.0.1', 'status': 'ready', 'teaser': ''},
    {'name': 'KROMA', 'tag': 'Musik dan video pribadi', 'ver': '', 'status': 'soon', 'teaser': 'Player musik fork Metrolist. APK belum diunggah.'},
    {'name': 'Agent Virtual Studio', 'tag': 'Workspace agen 2D/3D', 'ver': '', 'status': 'soon', 'teaser': 'Studio pixel. APK belum diunggah.'},
]


def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(fg, bg):
    a, b = sorted((lum(fg), lum(bg)))
    return (b + 0.05) / (a + 0.05)


CONTRAST = {
    '#F4F7FB/#0A0D12': ratio('#F4F7FB', '#0A0D12'),
    '#B7C2D0/#0A0D12': ratio('#B7C2D0', '#0A0D12'),
    '#F4F7FB/#12161D': ratio('#F4F7FB', '#12161D'),
    '#B7C2D0/#12161D': ratio('#B7C2D0', '#12161D'),
    '#22D3EE/#0A0D12': ratio('#22D3EE', '#0A0D12'),
    '#A78BFA/#0A0D12': ratio('#A78BFA', '#0A0D12'),
    '#041016/#22D3EE': ratio('#041016', '#22D3EE'),
}
for k, v in CONTRAST.items():
    assert v >= 4.5, (k, v)


def cards():
    out = []
    for a in APPS:
        if a['status'] == 'ready':
            badge = '<span class="badge ready">Siap unduh</span>'
            extra = f'<span class="ver">{a["ver"]}</span>'
            action = f'<button class="open" type="button" data-app="{a["name"]}">Buka detail</button>'
            art = '<div class="icon ready-icon" aria-hidden="true"></div>'
        else:
            badge = '<span class="badge soon">Coming soon</span>'
            extra = ''
            action = f'<button class="open" type="button" data-teaser="{a["teaser"]}" data-app="{a["name"]}">Lihat teaser</button>'
            art = '<div class="icon phone" aria-hidden="true"></div>'
        out.append(
            f'<article class="card {a["status"]}"><div class="art">{art}</div>'
            f'<h2>{a["name"]}</h2><p>{a["tag"]}</p><div class="meta">{badge}{extra}</div>{action}</article>'
        )
    return ''.join(out)


CSS = r'''
/* hallmark: RaxeHub concept boards / dark workshop library / waive purple-cyan: brand mark */
html,body{overflow-x:clip}
:root{
  --bg:#0A0D12; --surface:#12161D; --text:#F4F7FB; --muted:#B7C2D0;
  --cyan:#22D3EE; --purple:#A78BFA; --ink:#041016; --line:#2A3340;
  --focus:#22D3EE; --space:16px; --radius:10px;
  --font:PlusJakarta,Segoe UI,sans-serif; --mono:JetBrainsMono,ui-monospace,monospace;
}
@font-face{font-family:PlusJakarta;src:url('fonts/PlusJakartaSans.ttf');font-weight:200 800}
@font-face{font-family:JetBrainsMono;src:url('fonts/JetBrainsMono-Regular.ttf');font-weight:400}
@font-face{font-family:JetBrainsMono;src:url('fonts/JetBrainsMono-Bold.ttf');font-weight:700}
*{box-sizing:border-box}
html{background:var(--bg);color:var(--text);font-family:var(--font)}
body{margin:0}
::selection{background:var(--cyan);color:var(--ink)}
a,button,summary,select,label{cursor:pointer}
button:disabled{cursor:not-allowed}
button:focus-visible,a:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.wrap{max-width:1080px;margin:0 auto;padding:0 16px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none;font-weight:700}
.brand img{width:36px;height:36px}
nav{display:flex;gap:8px;flex-wrap:wrap}
.ghost, .open, .primary, .chip{
  min-height:44px;min-width:44px;padding:10px 14px;border-radius:8px;border:1px solid var(--line);
  background:var(--surface);color:var(--text);font:600 14px var(--font)
}
.ghost:hover,.open:hover{border-color:var(--muted)}
.ghost:active,.open:active,.primary:active{transform:translateY(1px)}
.primary{background:var(--cyan);color:var(--ink);border-color:var(--cyan)}
.hero{display:grid;gap:16px;padding:24px 16px 32px;align-items:center}
.hero img{width:120px;height:120px}
.hero h1{margin:0;font-size:clamp(28px,6vw,48px);line-height:1.1;max-width:18ch}
.hero p{margin:8px 0 0;color:var(--muted);max-width:42ch}
.grid{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;padding:0 0 48px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px;min-width:0;display:grid;gap:8px}
.card h2{margin:0;font-size:20px;overflow-wrap:anywhere;min-width:0}
.card p{margin:0;color:var(--muted)}
.meta{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.badge,.ver{font:700 12px/1.2 var(--mono);padding:6px 8px;border-radius:6px}
.badge.ready{background:var(--cyan);color:var(--ink)}
.badge.soon{border:1px solid var(--muted);color:var(--muted)}
.ver{color:var(--cyan)}
.art{height:88px;display:grid;place-items:center}
.icon{width:56px;height:88px;border:2px solid var(--muted);border-radius:10px;position:relative}
.icon:before{content:'';position:absolute;top:8px;left:50%;width:16px;height:4px;margin-left:-8px;background:var(--muted);border-radius:2px}
.ready-icon{width:56px;height:56px;border-radius:12px;background:var(--cyan)}
.ready-icon:before{display:none}
.states{display:flex;gap:8px;flex-wrap:wrap;padding:8px 0 16px}
.panel{display:none;padding:24px;border:1px dashed var(--line);color:var(--muted)}
.panel.show{display:block}
dialog{border:1px solid var(--line);background:var(--surface);color:var(--text);border-radius:12px;padding:24px;max-width:min(420px,90vw)}
dialog::backdrop{background:#0009}
footer{padding:24px 16px;color:var(--muted);border-top:1px solid var(--line);font-size:14px}
body.a .hero{grid-template-columns:120px minmax(0,1fr)}
body.a .hero img{filter:none}
body.b{background:
  linear-gradient(var(--line) 1px,transparent 1px) 0 0/24px 24px,
  linear-gradient(90deg,var(--line) 1px,transparent 1px) 0 0/24px 24px,
  var(--bg)}
body.b .hero{border:1px solid var(--cyan);padding:20px;margin:16px;grid-template-columns:140px minmax(0,1fr)}
body.b .card{border-color:var(--cyan);box-shadow:inset 0 0 0 1px #22d3ee22}
body.b .card h2{font-family:var(--mono);font-size:16px}
body.c .hero{min-height:280px;justify-items:center;text-align:center;background:radial-gradient(60% 80% at 50% 30%, #22d3ee22, transparent 70%)}
body.c .hero img{width:168px;height:168px;filter:drop-shadow(0 0 24px #22D3EE88) drop-shadow(0 12px 28px #A78BFA66)}
body.c .card.ready{box-shadow:0 0 24px #22d3ee33}
body.c .badge.soon{animation:glitch 1.6s steps(2,end) infinite}
@keyframes glitch{50%{opacity:.55;transform:translateX(1px)}}
@media (min-width:720px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1080px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))} .wrap{padding:0 24px}}
@media (max-width:719px){body.a .hero,body.b .hero{grid-template-columns:minmax(0,1fr)} .hero img{width:96px;height:96px} body.c .hero img{width:128px;height:128px}}
@media (prefers-reduced-motion:reduce){body.c .badge.soon{animation:none} button:active{transform:none}}
'''

SCRIPT = r'''
const grid=document.getElementById('grid');
const panels={ok:grid,empty:document.getElementById('empty'),load:document.getElementById('load'),err:document.getElementById('err')};
function show(id){Object.entries(panels).forEach(([k,el])=>el.classList.toggle('show',k===id||(id==='ok'&&k==='ok')));grid.style.display=id==='ok'?'grid':'none'}
document.querySelectorAll('[data-state]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.state)));
const dlg=document.getElementById('teaser');
document.querySelectorAll('[data-teaser]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('teaser-title').textContent=b.dataset.app;document.getElementById('teaser-body').textContent=b.dataset.teaser;dlg.showModal()}));
document.getElementById('close').addEventListener('click',()=>dlg.close());
dlg.addEventListener('cancel',()=>dlg.close());
document.querySelectorAll('.open:not([data-teaser])').forEach(b=>b.addEventListener('click',()=>{document.getElementById('status').textContent='Studi visual. Halaman detail belum di-build Forge.'}));
document.getElementById('out').addEventListener('click',()=>{document.getElementById('status').textContent='Studi visual. Logout asli milik Clerk.'});
'''


def page(key, title, blurb):
    return f'''<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{title}</title><style>{CSS}</style></head>
<body class="{key}">
<header class="wrap">
  <a class="brand" href="#grid"><img src="assets/raxe-authentic-v2-nocore.svg" width="36" height="36" alt="">RaxeHub</a>
  <nav><button class="ghost" type="button" id="out">Keluar</button></nav>
</header>
<section class="hero wrap">
  <img src="assets/raxe-authentic-v2-nocore.svg" width="120" height="120" alt="RAXE mecha R" fetchpriority="high">
  <div><h1>RaxeHub</h1><p>{blurb}</p></div>
</section>
<main class="wrap">
  <div class="states">
    <button class="chip" type="button" data-state="ok">Katalog</button>
    <button class="chip" type="button" data-state="empty">Kosong</button>
    <button class="chip" type="button" data-state="load">Memuat</button>
    <button class="chip" type="button" data-state="err">Gagal</button>
  </div>
  <div id="grid" class="grid show">{cards()}</div>
  <p id="empty" class="panel">Belum ada app. Admin unggah APK lewat /admin.</p>
  <p id="load" class="panel">Memuat katalog...</p>
  <p id="err" class="panel">Katalog gagal dimuat. Coba lagi.</p>
  <p id="status" role="status"></p>
</main>
<footer class="wrap">Library pribadi Raxe. Bukan toko. APK belum terverifikasi Google Play.</footer>
<dialog id="teaser"><h2 id="teaser-title"></h2><p id="teaser-body"></p><button class="primary" id="close" type="button">Tutup</button></dialog>
<script>{SCRIPT}</script>
</body></html>'''


PAGES = {
    'A': ('A Minimal Dark', 'Workshop gelap, mark RAXE, katalog APK pribadi.'),
    'B': ('B Blueprint', 'Lembar kerja engineering. Grid dan title block, mark RAXE tetap asli.'),
    'C': ('C Neon Maximal', 'Mark RAXE jadi lampu bengkel. Glow hanya di hero dan kartu siap unduh.'),
}

for key, (title, blurb) in PAGES.items():
    (ROOT / f'{key}.html').write_text(page(key.lower(), title, blurb), encoding='utf-8')

checks = {'contrast': CONTRAST}
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    broken = []
    page.on('requestfailed', lambda r: broken.append(r.url))
    for key in PAGES:
        url = (ROOT / f'{key}.html').as_uri()
        for w, h, label in [(360, 800, '360'), (1080, 800, '1080')]:
            page.set_viewport_size({'width': w, 'height': h})
            page.goto(url)
            page.evaluate('document.fonts.ready')
            page.screenshot(path=str(ROOT / f'{key}-{label}.png'), full_page=True)
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        page.set_viewport_size({'width': 1080, 'height': 800})
        page.locator('[data-teaser]').first.click()
        assert page.locator('dialog').evaluate('e=>e.open')
        page.keyboard.press('Escape')
        assert page.locator('dialog').evaluate('e=>!e.open')
        page.locator('[data-state="empty"]').click()
        assert page.locator('#empty').evaluate("e=>e.classList.contains('show')")
        page.locator('#out').evaluate("e=>e.focus()")
        page.keyboard.press('Tab')
        page.keyboard.press('Shift+Tab')
        ow = page.locator('#out').evaluate("(e)=>getComputedStyle(e).outlineWidth")
        os_ = page.locator('#out').evaluate("(e)=>getComputedStyle(e).outlineStyle")
        assert os_ != 'none' and float(ow.replace('px','')) >= 2, (ow, os_)
    assert not errors, errors
    local_fail = [u for u in broken if 'raxehub' in u or u.endswith('.svg') or u.endswith('.ttf')]
    assert not local_fail, local_fail
    browser.close()
checks['interaction'] = 'PASS: modal click/Escape, catalog states, 2px focus, 360/1080 no overflow, no pageerror'
(ROOT / 'contrast.json').write_text(json.dumps(checks, indent=2), encoding='utf-8')
print(json.dumps(checks, indent=2))
