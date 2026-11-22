"""RaxeHub v1.2.1 Graphite. F12 copy lock. Home + APK + Web. Nav Home|APK|Web|Keluar."""
from pathlib import Path

OUT = Path(__file__).resolve().parent / "figcraft-svg"
OUT.mkdir(exist_ok=True)

PJS = "Plus Jakarta Sans"
JBM = "JetBrains Mono"

APPS = [
    (
        "KROMA",
        "Player musik pribadi",
        "Putar berkas lokal di HP.",
        "Antrian, sleep timer, tanpa akun.",
        "kroma",
    ),
    (
        "Tabungku",
        "Tabungan berdasar tujuan",
        "Satu tujuan, satu tabungan.",
        "Catat setoran, lihat sisa target.",
        "tabungku",
    ),
    (
        "GPS Tracker",
        "Pelacak lokasi",
        "Lacak posisi HP.",
        "Riwayat rute, tanpa toko.",
        "gps",
    ),
]

WEB = [
    (
        "Tahun Baru Countdown",
        "Callsign Radio",
        "Hitung mundur tahun baru.",
        "Angka live Firebase, bukan palsu.",
        ["Next.js", "Firebase"],
        True,
        False,
        "tny",
    ),
    (
        "Crypto Blog",
        "Catatan beranda",
        "Tulisan crypto di Vercel.",
        "Next 16. Bukan sinyal trading.",
        ["Next.js 16", "Vercel"],
        True,
        False,
        "blog",
    ),
]

G = {
    "bg": "#141415",
    "card": "#19191B",
    "raised": "#232325",
    "hair": "#2A2A2C",
    "hi": "#3A3A3D",
    "text": "#EDEDED",
    "sec": "#A1A1A6",
    "muted": "#9A9AA0",
    "ink": "#141415",
    "btn": "#EDEDED",
    "onbtn": "#171717",
}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def r(x, y, w, h, fill, rx=0, stroke=None, sw=1, op=None):
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"'
    if stroke:
        s += f' stroke="{stroke}" stroke-width="{sw}"'
    if op is not None:
        s += f' opacity="{op}"'
    return s + "/>"


def t(x, y, s, size=14, weight=500, color="#EDEDED", family=PJS, anchor="start"):
    return (
        f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{family}" '
        f'font-size="{size}" font-weight="{weight}" fill="{color}">{esc(s)}</text>'
    )


def line(x1, y1, x2, y2, col, sw=1, op=1):
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
        f'stroke="{col}" stroke-width="{sw}" opacity="{op}"/>'
    )


def mark(pid, x, y, size):
    s = size / 512
    return f'''<g id="{pid}-mark" transform="translate({x},{y}) scale({s:.6f})">
  <defs>
    <radialGradient id="{pid}-bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0c1626"/>
      <stop offset="55%" stop-color="#070c14"/>
      <stop offset="100%" stop-color="#030508"/>
    </radialGradient>
    <linearGradient id="{pid}-stem" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00D2FF"/>
      <stop offset="35%" stop-color="#0077FE"/>
      <stop offset="100%" stop-color="#0044B8"/>
    </linearGradient>
    <linearGradient id="{pid}-bowl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5DFBFF"/>
      <stop offset="40%" stop-color="#00E5FF"/>
      <stop offset="100%" stop-color="#0094D4"/>
    </linearGradient>
    <linearGradient id="{pid}-leg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E879F9"/>
      <stop offset="30%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#6B21A8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#{pid}-bg)"/>
  <circle cx="256" cy="256" r="212" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-opacity="0.95"/>
  <path d="M194 132 V332 L146 380 V180 L194 132 Z" fill="url(#{pid}-stem)"/>
  <polygon points="194,132 188,132 146,174 146,180 150,180 194,136" fill="#FFFFFF" opacity="0.95"/>
  <line x1="146" y1="180" x2="146" y2="380" stroke="#70B8FF" stroke-width="1.8" stroke-opacity="0.6"/>
  <line x1="146" y1="380" x2="194" y2="332" stroke="#93C5FD" stroke-width="2.5" stroke-opacity="0.9"/>
  <path fill-rule="evenodd" d="M210 132 H318 L360 174 V204 L318 246 H210 V132 Z M210 170 H298 L320 192 L298 214 H210 V170 Z" fill="url(#{pid}-bowl)"/>
  <path d="M210 132 H318 L360 174 L357 177 L316 136 H210 V132 Z" fill="#FFFFFF" opacity="0.95"/>
  <path d="M210 170 H298 L320 192 L317 194 L296 173 H210 V170 Z" fill="#E6FFFF" opacity="0.85"/>
  <line x1="360" y1="204" x2="318" y2="246" stroke="#004D73" stroke-width="2.5" stroke-opacity="0.8"/>
  <polygon points="210,254 262,254 356,348 330,374" fill="url(#{pid}-leg)"/>
  <line x1="262" y1="254" x2="356" y2="348" stroke="#00FFFF" stroke-width="2.5" stroke-opacity="0.95"/>
  <line x1="330" y1="374" x2="356" y2="348" stroke="#00E5FF" stroke-width="2.5" stroke-opacity="0.9"/>
  <line x1="210" y1="254" x2="262" y2="254" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.9"/>
  <line x1="210" y1="254" x2="330" y2="374" stroke="#F5D0FE" stroke-width="1.8" stroke-opacity="0.8"/>
</g>'''


def app_icon(kind, x, y, s, p):
    o = [r(x, y, s, s, p["raised"], 8, p["hair"], 1)]
    m = s * 0.22
    if kind == "kroma":
        o.append(r(x + m, y + m, s * 0.16, s * 0.56, p["text"], 1))
        o.append(r(x + m + s * 0.16, y + m, s * 0.34, s * 0.12, p["text"], 1))
        o.append(r(x + m + s * 0.16, y + m + s * 0.44, s * 0.34, s * 0.12, p["text"], 1))
        o.append(
            f'<polygon points="{x+m+s*0.22},{y+m+s*0.22} {x+s-m},{y+m+s*0.12} {x+s-m},{y+m+s*0.28}" fill="{p["text"]}"/>'
        )
    elif kind == "tabungku":
        cx, cy, rr = x + s / 2, y + s / 2 + 2, s * 0.28
        o.append(
            f'<ellipse cx="{cx}" cy="{cy}" rx="{rr}" ry="{rr*1.15}" fill="none" stroke="{p["text"]}" stroke-width="2"/>'
        )
        o.append(
            f'<ellipse cx="{cx}" cy="{cy - rr*0.55}" rx="{rr*0.72}" ry="{rr*0.22}" fill="none" stroke="{p["text"]}" stroke-width="2"/>'
        )
    else:
        cx, cy = x + s / 2, y + s / 2
        o.append(
            f'<path d="M{cx} {y+m} L{x+s-m} {cy} L{cx} {y+s-m} L{x+m} {cy} Z" '
            f'fill="none" stroke="{p["text"]}" stroke-width="2"/>'
        )
        o.append(line(cx, y + m, cx, y + s - m, p["sec"], 1.5))
    return "".join(o)


def web_thumb(kind, x, y, w, h, p):
    o = [r(x, y, w, h, p["raised"], 8)]
    if kind == "tny":
        o.append(t(x + w / 2, y + h / 2 + 6, "00:00:00", 18, 500, p["text"], JBM, "middle"))
    else:
        bars = [(0.35, 28), (0.7, 44), (0.5, 36)]
        bx = x + 24
        for frac, bh in bars:
            o.append(r(bx, y + h - 16 - bh, 28, bh, p["text"], 2, op=frac))
            bx += 40
    return "".join(o)


def btn(x, y, w, h, label, p, primary=True, focus=False, disabled=False):
    rx = 8
    if disabled:
        o = [r(x, y, w, h, p["bg"], rx, p["hair"], 1, 0.9)]
        o.append(t(x + w / 2, y + h / 2 + 5, label, 14, 400, p["muted"], PJS, "middle"))
    elif primary:
        o = [r(x, y, w, h, p["btn"], rx)]
        o.append(line(x + 1, y + 1, x + w - 1, y + 1, "#FFFFFF", 1, 0.18))
        o.append(t(x + w / 2, y + h / 2 + 5, label, 14, 500, p["onbtn"], PJS, "middle"))
    else:
        o = [r(x, y, w, h, p["raised"], rx, p["hair"], 1)]
        o.append(t(x + w / 2, y + h / 2 + 5, label, 14, 500, p["text"], PJS, "middle"))
    if focus:
        o.append(r(x - 3, y - 3, w + 6, h + 6, "none", rx + 2, p["text"], 2))
    return "".join(o)


def plate(x, y, w, h, p, level=0, rx=12):
    fill = p["card"] if level == 0 else p["raised"]
    o = [r(x, y, w, h, fill, rx, p["hair"], 1)]
    if level >= 1:
        o.append(line(x + rx * 0.4, y + 1, x + w - rx * 0.4, y + 1, "#FFFFFF", 1, 0.12))
    return "".join(o)


def chip(x, y, label, p):
    w = 12 + len(label) * 7
    o = [r(x, y, w, 22, p["card"], 6, p["hair"], 1)]
    o.append(t(x + w / 2, y + 16, label, 11, 400, p["muted"], JBM, "middle"))
    return "".join(o), w


def nav(w, p, current="apk", hair_op=1):
    o = [r(0, 0, w, 56, p["bg"])]
    tabs = [("home", "Home"), ("apk", "APK"), ("web", "Web"), ("out", "Keluar")]
    if w <= 360:
        gap = w / 4
        for i, (key, lab) in enumerate(tabs):
            cx = gap * i + gap / 2
            col = p["text"] if current == key else p["sec"]
            wt = 500 if current == key else 400
            o.append(t(cx, 35, lab, 14, wt, col, PJS, "middle"))
            if current == key:
                o.append(line(cx - 18, 50, cx + 18, 50, p["text"], 2))
    else:
        o.append(t(32, 35, "RaxeHub", 16, 600, p["text"]))
        xs = [("home", "Home", 140, 36), ("apk", "APK", 204, 28), ("web", "Web", 256, 28)]
        for key, lab, x, uw in xs:
            col = p["text"] if current == key else p["sec"]
            wt = 500 if current == key else 400
            o.append(t(x, 35, lab, 14, wt, col))
            if current == key:
                o.append(line(x, 50, x + uw, 50, p["text"], 2))
        o.append(t(w - 32, 35, "Keluar", 14, 400, p["sec"], PJS, "end"))
    o.append(line(0, 56, w, 56, p["hair"], 1, hair_op))
    return "".join(o)


def footer_apk(w, h, p):
    y = h - 56
    o = [line(16, y, w - 16, y, p["hair"], 1)]
    if w <= 360:
        o.append(t(16, y + 22, "APK belum terverifikasi Google Play.", 12, 400, p["muted"]))
        o.append(t(16, y + 40, "Aktifkan Install unknown apps.", 12, 400, p["muted"]))
    else:
        o.append(
            t(
                32,
                y + 32,
                "APK belum terverifikasi Google Play. Aktifkan Install unknown apps di HP.",
                12,
                400,
                p["muted"],
            )
        )
    return "".join(o)


def footer_web(w, h, p):
    y = h - 56
    o = [line(16, y, w - 16, y, p["hair"], 1)]
    msg = "Live buka tab baru. Source hanya jika repo ada."
    o.append(t(16 if w <= 360 else 32, y + 32, msg, 12, 400, p["muted"]))
    return "".join(o)


def wrap(w, h, bg, body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
        + r(0, 0, w, h, bg)
        + body
        + "</svg>"
    )


def home360():
    p, w, h = G, 360, 1760
    o = [nav(w, p, "home", 0.25)]
    o.append(r(24, 88, 200, 280, p["card"], 16, p["hair"], 1, 0.35))
    o.append(r(136, 64, 200, 200, p["raised"], 16, p["hair"], 1, 0.25))
    o.append(mark("h360", 100, 88, 160))
    o.append(t(180, 280, "RaxeHub", 40, 500, p["text"], PJS, "middle"))
    o.append(t(180, 312, "Bengkel APK pribadi", 15, 400, p["sec"], PJS, "middle"))
    o.append(t(180, 336, "Unduh dari sini, bukan toko.", 14, 400, p["muted"], PJS, "middle"))
    o.append(btn(80, 364, 200, 48, "Masuk library", p, True, True))
    o.append(t(16, 452, "Tentang", 12, 400, p["muted"], JBM))
    o.append(plate(16, 468, 328, 200, p, 0, 12))
    o.append(t(32, 500, "Raxe Workshop", 22, 500, p["text"]))
    o.append(t(32, 528, "Alias Raxe. Semua APK dan web", 13, 400, p["sec"]))
    o.append(t(32, 548, "di rak ini dirakit sendiri,", 13, 400, p["sec"]))
    o.append(t(32, 568, "dilepas buat teman-teman", 13, 400, p["sec"]))
    o.append(t(32, 588, "yang butuh. Kodenya masih", 13, 400, p["sec"]))
    o.append(t(32, 608, "berantakan di sana-sini,", 13, 400, p["sec"]))
    o.append(t(32, 628, "tapi semuanya jalan.", 13, 400, p["sec"]))
    o.append(t(16, 700, "Rilis terbaru", 12, 400, p["muted"], JBM))
    y = 716
    for i, (name, tag, d1, d2, kind) in enumerate(APPS):
        rot = (-4, 0, 4)[i]
        o.append(f'<g transform="rotate({rot} 180 {y + 110})">')
        o.append(plate(16, y, 328, 220, p, 1 if i == 0 else 0, 12))
        o.append(app_icon(kind, 32, y + 16, 48, p))
        o.append(t(92, y + 36, name, 16, 500, p["text"]))
        o.append(t(92, y + 56, tag, 13, 400, p["sec"]))
        o.append(t(300, y + 40, "Rilis", 11, 400, p["muted"], JBM, "end"))
        o.append(t(32, y + 88, d1, 13, 400, p["sec"]))
        o.append(t(32, y + 108, d2, 13, 400, p["sec"]))
        o.append("</g>")
        y += 248
    o.append(footer_apk(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def home1080():
    p, w, h = G, 1080, 1180
    o = [nav(w, p, "home", 0.25)]
    o.append(r(72, 80, 280, 360, p["card"], 16, p["hair"], 1, 0.28))
    o.append(mark("h1080", 80, 96, 160))
    o.append(t(280, 156, "RaxeHub", 56, 500, p["text"]))
    o.append(t(280, 200, "Bengkel APK pribadi", 20, 400, p["sec"]))
    o.append(t(280, 232, "Unduh dari sini, bukan toko.", 16, 400, p["muted"]))
    o.append(btn(280, 264, 200, 48, "Masuk library", p, True, True))
    o.append(t(32, 400, "Tentang", 12, 400, p["muted"], JBM))
    o.append(plate(32, 416, 1016, 168, p, 0, 12))
    o.append(t(56, 456, "Raxe Workshop", 28, 500, p["text"]))
    o.append(t(56, 492, "Alias Raxe. Semua APK dan web di rak ini dirakit sendiri,", 16, 400, p["sec"]))
    o.append(t(56, 516, "dilepas buat teman-teman yang butuh. Kodenya masih", 16, 400, p["sec"]))
    o.append(t(56, 540, "berantakan di sana-sini, tapi semuanya jalan.", 16, 400, p["sec"]))
    o.append(t(32, 620, "Rilis terbaru", 12, 400, p["muted"], JBM))
    x = 32
    tilts = (-5, 0, 5)
    for i, (name, tag, d1, d2, kind) in enumerate(APPS):
        o.append(f'<g transform="rotate({tilts[i]} {x + 164} 820)">')
        o.append(plate(x, 640, 328, 340, p, 1 if i == 0 else 0, 12))
        o.append(app_icon(kind, x + 24, 664, 48, p))
        o.append(t(x + 88, 688, name, 22, 500, p["text"]))
        o.append(t(x + 88, 714, tag, 14, 400, p["sec"]))
        o.append(t(x + 24, 748, "Rilis", 12, 400, p["muted"], JBM))
        o.append(t(x + 24, 784, d1, 14, 400, p["sec"]))
        o.append(t(x + 24, 808, d2, 14, 400, p["sec"]))
        o.append(btn(x + 24, 900, 148, 48, "Buka detail", p, True, i == 0))
        o.append("</g>")
        x += 344
    o.append(footer_apk(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def apk360():
    p, w, h = G, 360, 1180
    o = [nav(w, p, "apk", 1)]
    o.append(mark("apk360", 16, 72, 72))
    o.append(t(100, 104, "RaxeHub", 28, 500, p["text"]))
    o.append(t(100, 128, "Rak APK pribadi", 14, 400, p["sec"]))
    y = 164
    for i, (name, tag, d1, d2, kind) in enumerate(APPS):
        hh = 248 if i == 0 else 200
        o.append(plate(16, y, 328, hh, p, 1 if i == 0 else 0, 16 if i == 0 else 12))
        o.append(app_icon(kind, 36, y + 20, 48, p))
        o.append(t(96, y + 42, name, 18, 500, p["text"]))
        o.append(t(96, y + 64, tag, 13, 400, p["sec"]))
        o.append(t(36, y + 92, d1, 13, 400, p["sec"]))
        o.append(t(36, y + 112, d2, 13, 400, p["sec"]))
        o.append(t(328 - 16, y + 42, "Rilis", 11, 400, p["muted"], JBM, "end"))
        if i == 0:
            o.append(btn(36, y + 180, 140, 48, "Buka detail", p, True, True))
            o.append(btn(188, y + 180, 140, 48, "Unduh APK", p, False))
        y += hh + 12
    o.append(footer_apk(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def apk1080():
    p, w, h = G, 1080, 900
    o = [nav(w, p, "apk", 1)]
    o.append(mark("apk1080", 32, 80, 96))
    o.append(t(144, 118, "RaxeHub", 36, 500, p["text"]))
    o.append(t(144, 148, "Rak APK pribadi", 16, 400, p["sec"]))
    o.append(t(144, 176, "Tiga rilis. Unduh dari sini, bukan toko.", 14, 400, p["muted"]))
    name, tag, d1, d2, kind = APPS[0]
    o.append(plate(32, 208, 1016, 280, p, 1, 16))
    o.append(app_icon(kind, 56, 236, 64, p))
    o.append(t(140, 264, name, 28, 500, p["text"]))
    o.append(t(140, 292, tag, 16, 400, p["sec"]))
    o.append(t(140, 324, d1, 14, 400, p["sec"]))
    o.append(t(140, 348, d2, 14, 400, p["sec"]))
    o.append(t(140, 376, "Rilis", 12, 400, p["muted"], JBM))
    o.append(btn(56, 412, 160, 48, "Buka detail", p, True, True))
    o.append(btn(228, 412, 160, 48, "Unduh APK", p, False))
    x = 32
    for name, tag, d1, d2, kind in APPS[1:]:
        o.append(plate(x, 508, 500, 280, p, 0, 12))
        o.append(app_icon(kind, x + 24, 532, 48, p))
        o.append(t(x + 88, 556, name, 20, 500, p["text"]))
        o.append(t(x + 88, 580, tag, 14, 400, p["sec"]))
        o.append(t(x + 24, 612, d1, 14, 400, p["sec"]))
        o.append(t(x + 24, 636, d2, 14, 400, p["sec"]))
        o.append(t(x + 24, 664, "Rilis", 12, 400, p["muted"], JBM))
        o.append(btn(x + 24, 708, 148, 48, "Buka detail", p, True))
        x += 516
    o.append(footer_apk(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def web360():
    p, w, h = G, 360, 1040
    o = [nav(w, p, "web", 1)]
    o.append(t(16, 92, "Karya web", 28, 500, p["text"]))
    o.append(t(16, 118, "Live dulu. Source kalau ada repo.", 14, 400, p["sec"]))
    y = 140
    for name, tag, d1, d2, stacks, live, repo, kind in WEB:
        o.append(plate(16, y, 328, 360, p, 0, 12))
        o.append(web_thumb(kind, 32, y + 16, 296, 88, p))
        o.append(t(32, y + 128, name, 16, 500, p["text"]))
        o.append(t(32, y + 150, tag, 13, 400, p["sec"]))
        o.append(t(328, y + 128, "WEB", 11, 400, p["muted"], JBM, "end"))
        o.append(t(32, y + 176, d1, 13, 400, p["sec"]))
        o.append(t(32, y + 196, d2, 13, 400, p["sec"]))
        cx = 32
        for lab in stacks:
            svg, cw = chip(cx, y + 216, lab, p)
            o.append(svg)
            cx += cw + 8
        o.append(btn(32, y + 256, 148, 48, "Buka live", p, True, kind == "tny"))
        o.append(btn(192, y + 256, 132, 48, "Source", p, False, False, disabled=not repo))
        y += 376
    o.append(footer_web(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def web1080():
    p, w, h = G, 1080, 720
    o = [nav(w, p, "web", 1)]
    o.append(t(32, 96, "Karya web", 32, 500, p["text"]))
    o.append(t(32, 128, "Live dulu. Source kalau ada repo.", 16, 400, p["sec"]))
    x = 32
    for i, (name, tag, d1, d2, stacks, live, repo, kind) in enumerate(WEB):
        o.append(plate(x, 156, 500, 448, p, 0, 12))
        o.append(web_thumb(kind, x + 24, 180, 452, 120, p))
        o.append(t(x + 24, 328, name, 22, 500, p["text"]))
        o.append(t(x + 24, 356, tag, 14, 400, p["sec"]))
        o.append(t(x + 476, 328, "WEB", 12, 400, p["muted"], JBM, "end"))
        o.append(t(x + 24, 392, d1, 14, 400, p["sec"]))
        o.append(t(x + 24, 416, d2, 14, 400, p["sec"]))
        cx = x + 24
        for lab in stacks:
            svg, cw = chip(cx, 440, lab, p)
            o.append(svg)
            cx += cw + 8
        o.append(btn(x + 24, 528, 160, 48, "Buka live", p, True, i == 0))
        o.append(btn(x + 196, 528, 140, 48, "Source", p, False, False, disabled=not repo))
        x += 516
    o.append(footer_web(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def motion():
    p, w, h = G, 1080, 720
    o = [r(0, 0, w, h, p["bg"])]
    o.append(t(32, 40, "Motion v1.2 FULL CREATIVE", 22, 500, p["text"]))
    o.append(
        t(
            32,
            66,
            "Lenis lerp 0.1 + GSAP ScrollTrigger. Graphite. No glow. Reduce = color only.",
            13,
            400,
            p["muted"],
        )
    )
    cells = [
        (32, 88, "Mark 900ms", "Y24 + rotateX 8", "once, stagger 80"),
        (380, 88, "Parallax", "mark y% 12", "plate y% 20 scrub"),
        (728, 88, "Reveal", "Y32 stagger 100", "start top 85%"),
        (32, 360, "Magnetic", "CTA + tile 8px", "pointer only"),
        (380, 360, "Tilt 6deg", "persp 800", "pointer only"),
        (728, 360, "Reduced", "opacity only", "Lenis respect RM"),
    ]
    for i, (x, y, title, a, b) in enumerate(cells):
        o.append(plate(x, y, 320, 248, p, 1 if i == 0 else 0, 12))
        o.append(t(x + 20, y + 36, title, 16, 500, p["text"]))
        o.append(t(x + 20, y + 64, a, 13, 400, p["sec"], JBM))
        o.append(t(x + 20, y + 88, b, 13, 400, p["muted"], JBM))
        if i == 0:
            o.append(mark("m0", x + 112, y + 112, 96))
        elif i == 5:
            o.append(mark("m5", x + 112, y + 112, 96))
            o.append(r(x + 16, y + 108, 288, 120, p["bg"], 8, None, 1, 0.45))
            o.append(t(x + 160, y + 176, "no transform", 12, 400, p["muted"], JBM, "middle"))
        else:
            o.append(r(x + 20, y + 120, 280, 96, p["raised"], 8, p["hair"], 1))
            o.append(t(x + 160, y + 176, title, 13, 400, p["sec"], PJS, "middle"))
    o.append(
        t(
            32,
            640,
            "Hairline 0-48px. Hover 160ms rise. Press 0.97. cubic-bezier(0.22, 1, 0.36, 1).",
            12,
            400,
            p["muted"],
        )
    )
    o.append(
        t(
            32,
            664,
            "No loop mark. No glow. Magnetic/tilt off on touch. respectReducedMotion true.",
            12,
            400,
            p["muted"],
        )
    )
    o.append(t(32, 688, "View Transition: icon share-element. Tentang copy: Raxe Workshop generic.", 12, 400, p["muted"]))
    return wrap(w, h, p["bg"], "".join(o))


def rel_lum(hex_color):
    hx = hex_color.lstrip("#")
    r_, g_, b_ = int(hx[0:2], 16) / 255, int(hx[2:4], 16) / 255, int(hx[4:6], 16) / 255

    def f(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return 0.2126 * f(r_) + 0.7152 * f(g_) + 0.0722 * f(b_)


def contrast(a, b):
    l1, l2 = rel_lum(a), rel_lum(b)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def main():
    files = {
        "HOME-360.svg": home360(),
        "HOME-1080.svg": home1080(),
        "APK-360.svg": apk360(),
        "APK-1080.svg": apk1080(),
        "WEB-360.svg": web360(),
        "WEB-1080.svg": web1080(),
        "MOTION.svg": motion(),
    }
    for name, svg in files.items():
        path = OUT / name
        path.write_text(svg, encoding="utf-8")
        print(name, path.stat().st_size)
    pairs = [
        ("G text/bg", G["text"], G["bg"]),
        ("G sec/bg", G["sec"], G["bg"]),
        ("G muted/card", G["muted"], G["card"]),
        ("G onbtn/btn", G["onbtn"], G["btn"]),
        ("G muted/btn", G["muted"], G["card"]),
    ]
    fail = 0
    for name, a, b in pairs:
        c = contrast(a, b)
        gate = "AAA" if c >= 7 else ("AA" if c >= 4.5 else "FAIL")
        if gate == "FAIL":
            fail += 1
        print(f"{name} {a} on {b} = {c:.3f} {gate}")
    if fail:
        raise SystemExit(f"contrast FAIL count={fail}")


if __name__ == "__main__":
    main()
