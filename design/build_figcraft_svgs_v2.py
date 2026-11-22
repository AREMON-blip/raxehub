"""RaxeHub v2 FigCraft SVGs. Elevation dark, no chrome glow. Catalog: KROMA, Tabungku, GPS Tracker."""
from pathlib import Path

OUT = Path(__file__).resolve().parent / "figcraft-svg"
OUT.mkdir(exist_ok=True)

PJS = "Plus Jakarta Sans"
JBM = "JetBrains Mono"

APPS = [
    ("KROMA", "Player musik pribadi", "kroma"),
    ("Tabungku", "Tabungan berdasar tujuan", "tabungku"),
    ("GPS Tracker", "Pelacak lokasi", "gps"),
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
I = {
    "bg": "#0B0D14",
    "card": "#11141C",
    "raised": "#1A1E28",
    "hair": "#2A3140",
    "hi": "#3A4454",
    "text": "#EEF0F5",
    "sec": "#A3A9B8",
    "muted": "#8B93A6",
    "ink": "#07080D",
    "btn": "#EEF0F5",
    "onbtn": "#111827",
    "steel": "#8BA3C7",
}
W = {
    "bg": "#161513",
    "card": "#1C1A18",
    "raised": "#262421",
    "hair": "#3A3732",
    "hi": "#4A453E",
    "text": "#EFE9DE",
    "sec": "#AAA398",
    "muted": "#9A9488",
    "ink": "#12110F",
    "btn": "#EFE9DE",
    "onbtn": "#1F1B16",
    "brass": "#C4A574",
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
        o.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rr}" ry="{rr*1.15}" fill="none" stroke="{p["text"]}" stroke-width="2"/>')
        o.append(f'<ellipse cx="{cx}" cy="{cy - rr*0.55}" rx="{rr*0.72}" ry="{rr*0.22}" fill="none" stroke="{p["text"]}" stroke-width="2"/>')
    else:
        cx, cy = x + s / 2, y + s / 2
        o.append(
            f'<path d="M{cx} {y+m} L{x+s-m} {cy} L{cx} {y+s-m} L{x+m} {cy} Z" '
            f'fill="none" stroke="{p["text"]}" stroke-width="2"/>'
        )
        o.append(line(cx, y + m, cx, y + s - m, p["sec"], 1.5))
    return "".join(o)


def btn(x, y, w, h, label, p, primary=True, focus=False):
    rx = 8
    if primary:
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


def nav(w, p, current="library"):
    o = [r(0, 0, w, 56, p["bg"])]
    home_c = p["text"] if current == "home" else p["sec"]
    lib_c = p["text"] if current == "library" else p["sec"]
    if w <= 360:
        o.append(t(16, 35, "RaxeHub", 16, 600, p["text"]))
        o.append(t(118, 35, "Home", 14, 500, home_c))
        o.append(t(172, 35, "Library", 14, 500, lib_c))
        o.append(t(w - 16, 35, "Keluar", 14, 400, p["sec"], PJS, "end"))
        if current == "home":
            o.append(line(118, 50, 154, 50, p["text"], 2))
        else:
            o.append(line(172, 50, 222, 50, p["text"], 2))
    else:
        o.append(t(32, 35, "RaxeHub", 16, 600, p["text"]))
        o.append(t(140, 35, "Home", 14, 500, home_c))
        o.append(t(204, 35, "Library", 14, 500, lib_c))
        o.append(t(w - 32, 35, "Keluar", 14, 400, p["sec"], PJS, "end"))
        if current == "home":
            o.append(line(140, 50, 176, 50, p["text"], 2))
        else:
            o.append(line(204, 50, 254, 50, p["text"], 2))
    o.append(line(0, 56, w, 56, p["hair"], 1))
    return "".join(o)


def footer(w, h, p):
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


def wrap(w, h, bg, body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
        + r(0, 0, w, h, bg)
        + body
        + "</svg>"
    )


def a360():
    p, w, h = G, 360, 860
    o = [nav(w, p)]
    o.append(mark("a360", 16, 72, 72))
    o.append(t(100, 104, "RaxeHub", 28, 500, p["text"]))
    o.append(t(100, 128, "Library APK pribadi", 14, 400, p["sec"]))
    o.append(plate(16, 164, 328, 220, p, 1, 16))
    o.append(app_icon("kroma", 36, 184, 48, p))
    o.append(t(96, 206, "KROMA", 20, 500, p["text"]))
    o.append(t(96, 228, "Player musik pribadi", 13, 400, p["sec"]))
    o.append(t(36, 256, "Rilis", 12, 400, p["muted"], JBM))
    o.append(btn(36, 316, 140, 48, "Buka detail", p, True, True))
    o.append(btn(188, 316, 140, 48, "Unduh APK", p, False))
    y = 400
    for name, tag, kind in APPS[1:]:
        o.append(plate(16, y, 328, 96, p, 0, 12))
        o.append(app_icon(kind, 32, y + 24, 48, p))
        o.append(t(96, y + 44, name, 16, 500, p["text"]))
        o.append(t(96, y + 66, tag, 13, 400, p["sec"]))
        o.append(t(328, y + 54, "Rilis", 12, 400, p["muted"], JBM, "end"))
        y += 108
    o.append(footer(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def a1080():
    p, w, h = G, 1080, 800
    o = [nav(w, p)]
    o.append(mark("a1080", 32, 80, 96))
    o.append(t(144, 118, "RaxeHub", 36, 500, p["text"]))
    o.append(t(144, 148, "Library APK pribadi", 16, 400, p["sec"]))
    o.append(t(144, 176, "Tiga rilis. Unduh dari sini, bukan toko.", 14, 400, p["muted"]))
    o.append(plate(32, 208, 1016, 232, p, 1, 16))
    o.append(app_icon("kroma", 56, 236, 64, p))
    o.append(t(140, 264, "KROMA", 28, 500, p["text"]))
    o.append(t(140, 292, "Player musik pribadi", 16, 400, p["sec"]))
    o.append(t(140, 316, "Rilis", 12, 400, p["muted"], JBM))
    o.append(btn(56, 368, 160, 48, "Buka detail", p, True, True))
    o.append(btn(228, 368, 160, 48, "Unduh APK", p, False))
    o.append(plate(32, 460, 500, 200, p, 0, 12))
    o.append(app_icon("tabungku", 56, 484, 48, p))
    o.append(t(120, 506, "Tabungku", 20, 500, p["text"]))
    o.append(t(120, 530, "Tabungan berdasar tujuan", 14, 400, p["sec"]))
    o.append(t(120, 552, "Rilis", 12, 400, p["muted"], JBM))
    o.append(btn(56, 588, 148, 48, "Buka detail", p, True))
    o.append(plate(548, 460, 500, 200, p, 0, 12))
    o.append(app_icon("gps", 572, 484, 48, p))
    o.append(t(636, 506, "GPS Tracker", 20, 500, p["text"]))
    o.append(t(636, 530, "Pelacak lokasi", 14, 400, p["sec"]))
    o.append(t(636, 552, "Rilis", 12, 400, p["muted"], JBM))
    o.append(btn(572, 588, 148, 48, "Buka detail", p, True))
    o.append(footer(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def shelf_row(x, y, w, h, name, tag, kind, idx, p, active=False, compact=False):
    o = [r(x, y, w, h, p["raised"] if active else p["card"], 0, p["hair"], 1)]
    spine = p.get("steel", p["hi"])
    o.append(r(x, y, 6, h, spine if active else p["hair"]))
    o.append(t(x + 20, y + 28, f"{idx:02d}", 12, 400, p["muted"], JBM))
    o.append(app_icon(kind, x + 52, y + 16, 48, p))
    o.append(t(x + 112, y + 36, name, 16 if compact else 18, 500, p["text"]))
    o.append(t(x + 112, y + 58, tag, 13, 400, p["sec"]))
    if not compact:
        o.append(btn(x + w - 164, y + 16, 140, 48, "Buka detail", p, primary=active))
    else:
        o.append(t(x + w - 16, y + 46, "Rilis", 12, 400, p["muted"], JBM, "end"))
    return "".join(o)


def b360():
    p, w, h = I, 360, 860
    o = [nav(w, p)]
    o.append(r(0, 56, w, 4, p["ink"]))
    o.append(t(16, 92, "CRATE-RH", 12, 400, p["steel"], JBM))
    o.append(t(16, 124, "Isi rak", 28, 500, p["text"]))
    o.append(t(16, 148, "Tiga APK rilis, satu rak.", 14, 400, p["sec"]))
    y = 172
    for i, (name, tag, kind) in enumerate(APPS, 1):
        o.append(shelf_row(0, y, w, 80, name, tag, kind, i, p, active=(i == 1), compact=True))
        y += 80
    o.append(t(16, y + 36, "Slot aktif naik satu step permukaan.", 12, 400, p["muted"]))
    o.append(footer(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def b1080():
    p, w, h = I, 1080, 800
    o = [nav(w, p)]
    o.append(r(0, 56, 240, h - 112, p["ink"]))
    o.append(t(32, 100, "CRATE-RH", 12, 400, p["steel"], JBM))
    o.append(t(32, 140, "Isi rak", 32, 500, p["text"]))
    o.append(t(32, 172, "Tiga APK rilis.", 14, 400, p["sec"]))
    o.append(mark("b1080", 32, 220, 80))
    o.append(t(32, 330, "RaxeHub", 16, 600, p["text"]))
    o.append(line(32, 348, 208, 348, p["hair"], 1))
    o.append(t(32, 376, "Workshop crate.", 13, 400, p["muted"]))
    o.append(t(32, 396, "Bukan etalase toko.", 13, 400, p["muted"]))
    y = 80
    for i, (name, tag, kind) in enumerate(APPS, 1):
        o.append(shelf_row(240, y, 808, 88, name, tag, kind, i, p, active=(i == 1)))
        y += 88
    o.append(t(264, y + 28, "Baris aktif: surface +1, spine steel, tombol off-white.", 12, 400, p["muted"]))
    o.append(footer(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def c360():
    p, w, h = W, 360, 900
    o = [nav(w, p)]
    o.append(mark("c360", 16, 72, 64))
    o.append(t(92, 100, "RaxeHub", 22, 500, p["text"]))
    o.append(t(92, 122, "Manifest rilis", 13, 400, p["sec"]))
    o.append(t(16, 160, "Unduh dari bengkel,", 22, 400, p["text"]))
    o.append(t(16, 188, "bukan dari toko.", 22, 400, p["text"]))
    y = 216
    for i, (name, tag, kind) in enumerate(APPS, 1):
        well = 168 if i == 1 else 120
        o.append(r(16, y, 328, well, p["ink"], 16))
        o.append(r(17, y + 1, 326, well - 2, p["card"] if i > 1 else p["raised"], 15, p["hair"], 1))
        o.append(t(32, y + 28, f"{i:02d}", 12, 400, p["brass"], JBM))
        o.append(app_icon(kind, 32, y + 40, 48, p))
        o.append(t(96, y + 60, name, 18, 500, p["text"]))
        o.append(t(96, y + 82, tag, 13, 400, p["sec"]))
        if i == 1:
            o.append(btn(32, y + 108, 148, 48, "Buka detail", p, True, True))
        y += well + 12
    o.append(footer(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def c1080():
    p, w, h = W, 1080, 800
    o = [nav(w, p)]
    o.append(r(0, 56, 420, h - 112, p["ink"]))
    o.append(mark("c1080", 48, 96, 120))
    o.append(t(48, 244, "RaxeHub", 36, 500, p["text"]))
    o.append(t(48, 280, "Unduh dari bengkel,", 20, 400, p["sec"]))
    o.append(t(48, 308, "bukan dari toko.", 20, 400, p["sec"]))
    o.append(line(48, 332, 372, 332, p["hair"], 1))
    o.append(t(48, 360, "Tiga rilis. Satu manifest.", 14, 400, p["muted"]))
    y = 80
    for i, (name, tag, kind) in enumerate(APPS, 1):
        hh = 168 if i == 1 else 128
        o.append(r(452, y, 596, hh, p["card"], 16, p["hair"], 1))
        if i == 1:
            o.append(line(468, y + 1, 1024, y + 1, "#FFFFFF", 1, 0.12))
        o.append(t(476, y + 32, f"{i:02d}", 12, 400, p["brass"], JBM))
        o.append(app_icon(kind, 476, y + 48, 48, p))
        o.append(t(540, y + 70, name, 22, 500, p["text"]))
        o.append(t(540, y + 96, tag, 14, 400, p["sec"]))
        if i == 1:
            o.append(btn(476, y + 108, 160, 48, "Buka detail", p, True, True))
            o.append(btn(648, y + 108, 160, 48, "Unduh APK", p, False))
        else:
            o.append(btn(880, y + 40, 140, 48, "Buka detail", p, True))
        y += hh + 16
    o.append(footer(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def motion():
    p, w, h = G, 1080, 400
    o = [r(0, 0, w, h, p["bg"])]
    o.append(t(32, 40, "Motion", 20, 500, p["text"]))
    o.append(t(32, 64, "160ms hover. 120ms press. cubic-bezier(0.22, 1, 0.36, 1). Reduce = color only.", 13, 400, p["muted"]))
    states = [
        (32, "Rest", 0, False),
        (368, "Hover", 1, True),
        (704, "Press", 1, False),
    ]
    for x, label, level, lifted in states:
        o.append(t(x, 96, label, 13, 400, p["sec"], JBM))
        yy = 112 - (4 if lifted else 0)
        scale_note = 0.98 if label == "Press" else 1
        ww, hh = int(300 * scale_note), int(200 * scale_note)
        xx = x + 6 if label == "Press" else x
        if label == "Press":
            yy += 8
        o.append(plate(xx, yy, ww, hh, p, level, 12))
        o.append(app_icon("kroma", xx + 20, yy + 24, 48, p))
        o.append(t(xx + 80, yy + 48, "KROMA", 18, 500, p["text"]))
        o.append(t(xx + 80, yy + 70, "Player musik pribadi", 13, 400, p["sec"]))
        o.append(btn(xx + 20, yy + hh - 64, 140, 48, "Buka detail", p, True, label == "Hover"))
    o.append(t(32, 360, "View Transition: icon share-element ke /app/kroma. Scroll-driven: nav hairline opacity. No loop.", 12, 400, p["muted"]))
    return wrap(w, h, p["bg"], "".join(o))


def home360():
    p, w, h = G, 360, 860
    o = [nav(w, p, "home")]
    o.append(mark("h360", 16, 80, 96))
    o.append(t(128, 118, "RaxeHub", 28, 500, p["text"]))
    o.append(t(128, 144, "Bengkel APK pribadi", 14, 400, p["sec"]))
    o.append(t(16, 204, "Tiga rilis.", 22, 500, p["text"]))
    o.append(t(16, 232, "Unduh dari sini, bukan toko.", 16, 400, p["sec"]))
    o.append(btn(16, 256, 200, 48, "Masuk library", p, True, True))
    x = 16
    for name, tag, kind in APPS:
        o.append(plate(x, 328, 104, 132, p, 0, 12))
        o.append(app_icon(kind, x + 28, 344, 48, p))
        o.append(t(x + 52, 418, name.split()[0], 12, 500, p["text"], PJS, "middle"))
        o.append(t(x + 52, 436, "Rilis", 11, 400, p["muted"], JBM, "middle"))
        x += 112
    o.append(footer(w, h, p))
    return wrap(w, h, p["bg"], "".join(o))


def home1080():
    p, w, h = G, 1080, 800
    o = [nav(w, p, "home")]
    o.append(mark("h1080", 32, 88, 128))
    o.append(t(180, 140, "RaxeHub", 40, 500, p["text"]))
    o.append(t(180, 178, "Bengkel APK pribadi", 18, 400, p["sec"]))
    o.append(t(180, 210, "Tiga rilis. Unduh dari sini, bukan toko.", 16, 400, p["muted"]))
    o.append(btn(180, 232, 200, 48, "Masuk library", p, True, True))
    x = 32
    for name, tag, kind in APPS:
        o.append(plate(x, 320, 328, 200, p, 0, 12))
        o.append(app_icon(kind, x + 24, 344, 48, p))
        o.append(t(x + 88, 368, name, 20, 500, p["text"]))
        o.append(t(x + 88, 394, tag, 14, 400, p["sec"]))
        o.append(t(x + 24, 430, "Rilis", 12, 400, p["muted"], JBM))
        o.append(btn(x + 24, 452, 148, 48, "Buka detail", p, True))
        x += 344
    o.append(footer(w, h, p))
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
        "A-360.svg": a360(),
        "A-1080.svg": a1080(),
        "B-360.svg": b360(),
        "B-1080.svg": b1080(),
        "C-360.svg": c360(),
        "C-1080.svg": c1080(),
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
        ("I text/bg", I["text"], I["bg"]),
        ("I sec/bg", I["sec"], I["bg"]),
        ("I muted/card", I["muted"], I["card"]),
        ("I onbtn/btn", I["onbtn"], I["btn"]),
        ("I steel/bg", I["steel"], I["bg"]),
        ("W text/bg", W["text"], W["bg"]),
        ("W sec/bg", W["sec"], W["bg"]),
        ("W muted/card", W["muted"], W["card"]),
        ("W onbtn/btn", W["onbtn"], W["btn"]),
        ("W brass/bg", W["brass"], W["bg"]),
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
