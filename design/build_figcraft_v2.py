"""RaxeHub concepts v2. Catalog: KROMA, Tabungku, GPS Tracker only."""
from pathlib import Path

OUT = Path(__file__).resolve().parent / "figcraft-svg"
OUT.mkdir(exist_ok=True)
PJS, JBM = "Plus Jakarta Sans", "JetBrains Mono"
BG, SURF, TXT, MUT = "#0A0D12", "#12161D", "#F4F7FB", "#B7C2D0"
CYAN, PUR, INK, LINE = "#22D3EE", "#A78BFA", "#041016", "#2A3340"

APPS = [
    ("KROMA", "Musik dan video", "kroma"),
    ("Tabungku", "Tabungan dan tujuan", "tabung"),
    ("GPS Tracker", "Lacak lokasi LAN", "gps"),
]


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def r(x, y, w, h, fill, rx=0, stroke=None, sw=1):
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"'
    if stroke:
        s += f' stroke="{stroke}" stroke-width="{sw}"'
    return s + "/>"


def t(x, y, s, size=14, weight=500, color=TXT, family=PJS, anchor="start"):
    return (
        f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{family}" '
        f'font-size="{size}" font-weight="{weight}" fill="{color}">{esc(s)}</text>'
    )


def mark(pid, x, y, size):
    s = size / 512
    return f'''<g transform="translate({x},{y}) scale({s:.6f})">
  <defs>
    <radialGradient id="{pid}-bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0c1626"/><stop offset="55%" stop-color="#070c14"/><stop offset="100%" stop-color="#030508"/>
    </radialGradient>
    <radialGradient id="{pid}-glow" cx="50%" cy="48%" r="35%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.16"/><stop offset="60%" stop-color="#0066FF" stop-opacity="0.05"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="{pid}-stem" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00D2FF"/><stop offset="35%" stop-color="#0077FE"/><stop offset="100%" stop-color="#0044B8"/>
    </linearGradient>
    <linearGradient id="{pid}-bowl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5DFBFF"/><stop offset="40%" stop-color="#00E5FF"/><stop offset="100%" stop-color="#0094D4"/>
    </linearGradient>
    <linearGradient id="{pid}-leg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E879F9"/><stop offset="30%" stop-color="#A855F7"/><stop offset="100%" stop-color="#6B21A8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#{pid}-bg)"/>
  <rect width="512" height="512" fill="url(#{pid}-glow)"/>
  <circle cx="256" cy="256" r="212" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-opacity="0.95"/>
  <circle cx="256" cy="256" r="218" fill="none" stroke="#00E5FF" stroke-width="1" stroke-opacity="0.25"/>
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


def app_icon(kind, x, y, size=56):
    s = size / 56
    g = f'<g transform="translate({x},{y}) scale({s:.4f})">'
    if kind == "kroma":
        g += r(0, 0, 56, 56, "#14171C", 12)
        g += '<path fill="#DCE1E8" transform="translate(-10,-8) scale(0.7)" d="M34 30H67V38H42V70H67V78H34Z M54 42L74.78461 54L54 66Z"/>'
    elif kind == "tabung":
        g += r(0, 0, 56, 56, "#1A2330", 12)
        g += r(18, 14, 20, 28, "none", 6, "#8AB4FF", 2)
        g += r(22, 10, 12, 6, "#8AB4FF", 2)
        g += f'<circle cx="28" cy="30" r="5" fill="none" stroke="#8AB4FF" stroke-width="2"/>'
    else:
        g += r(0, 0, 56, 56, "#1B2430", 12)
        g += '<path d="M14 18 L28 12 L42 18 L42 38 L28 44 L14 38 Z" fill="none" stroke="#7EB0E0" stroke-width="2"/>'
        g += '<path d="M28 12 V44" stroke="#7EB0E0" stroke-width="1.5"/>'
        g += f'<circle cx="28" cy="28" r="4" fill="#7EB0E0"/>'
    return g + "</g>"


def pack(w, h, body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
        + r(0, 0, w, h, BG)
        + body
        + "</svg>"
    )


def nav(w, pid, compact=True):
    s = 28 if compact else 36
    return (
        mark(pid + "n", 12, 10, s)
        + t(12 + s + 8, 34, "RaxeHub", 15, 700)
        + r(w - 88, 8, 76, 40, "none", 8, LINE, 1)
        + t(w - 50, 34, "Keluar", 13, 600, TXT, PJS, "middle")
    )


def ready():
    return r(0, 0, 0, 0, "none")  # placeholder unused


def chip_ready(x, y):
    return r(x, y, 56, 22, CYAN, 4) + t(x + 28, y + 16, "READY", 10, 700, INK, JBM, "middle")


def btn_unduh(x, y, w=96):
    return r(x, y, w, 44, CYAN, 8) + t(x + w / 2, y + 28, "Unduh", 14, 700, INK, PJS, "middle")


def footer(y, w):
    if w <= 360:
        return t(16, y, "Library pribadi. Bukan toko.", 11, 400, MUT) + t(
            16, y + 16, "APK belum terverifikasi Google Play.", 11, 400, MUT
        )
    return t(16, y, "Library pribadi. Bukan toko. APK belum terverifikasi Google Play.", 12, 400, MUT)


def a360():
    w, h, pid = 360, 800, "a360"
    body = nav(w, pid)
    body += mark(pid, 16, 72, 64)
    body += t(16, 160, "RaxeHub", 36, 800)
    body += t(16, 184, "Workshop. APK pribadi.", 14, 400, MUT)
    y = 220
    for name, tag, kind in APPS:
        body += r(16, y, 328, 88, SURF, 8)
        body += app_icon(kind, 28, y + 16, 56)
        body += t(96, y + 38, name, 16, 700)
        body += t(96, y + 58, tag, 12, 400, MUT)
        body += chip_ready(16 + 328 - 72, y + 33)
        y += 100
    body += footer(760, w)
    return pack(w, h, body)


def a1080():
    w, h, pid = 1080, 800, "a1080"
    body = nav(w, pid, False)
    body += mark(pid, 48, 80, 96)
    body += t(164, 128, "RaxeHub", 44, 800)
    body += t(164, 160, "Workshop. APK pribadi.", 16, 400, MUT)
    x = 48
    for name, tag, kind in APPS:
        body += r(x, 220, 312, 480, SURF, 12)
        body += app_icon(kind, x + 24, 244, 72)
        body += t(x + 24, 348, name, 22, 700)
        body += t(x + 24, 376, tag, 14, 400, MUT)
        body += chip_ready(x + 24, 404)
        body += btn_unduh(x + 24, 620, 160)
        x += 328
    body += footer(740, w)
    return pack(w, h, body)


def grid_bg(w, h, step=24):
    o = []
    x = 0
    while x <= w:
        o.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{h}" stroke="{LINE}" stroke-width="1"/>')
        x += step
    y = 0
    while y <= h:
        o.append(f'<line x1="0" y1="{y}" x2="{w}" y2="{y}" stroke="{LINE}" stroke-width="1"/>')
        y += step
    return "".join(o)


def b360():
    w, h, pid = 360, 800, "b360"
    body = grid_bg(w, h)
    body += nav(w, pid)
    body += r(16, 64, 328, 100, "none", 0, CYAN, 1)
    body += t(24, 84, "DWG-RH-01  BOM", 11, 700, CYAN, JBM)
    body += mark(pid, 24, 92, 56)
    body += t(92, 120, "RAXEHUB", 18, 700, TXT, JBM)
    body += t(92, 140, "PRIVATE APK  3 UNITS", 11, 500, MUT, JBM)
    body += r(16, 176, 328, 28, SURF)
    body += t(24, 195, "ITEM", 10, 700, CYAN, JBM)
    body += t(200, 195, "STAT", 10, 700, CYAN, JBM)
    y = 204
    for i, (name, tag, kind) in enumerate(APPS, 1):
        body += r(16, y, 328, 88, "none", 0, CYAN, 1)
        body += app_icon(kind, 24, y + 16, 56)
        body += t(88, y + 36, f"{i:02d}  {name.upper()}", 12, 700, TXT, JBM)
        body += t(88, y + 56, tag.upper(), 10, 400, MUT, JBM)
        body += r(232, y + 22, 96, 44, CYAN, 0)
        body += t(280, y + 50, "UNDUH", 12, 700, INK, JBM, "middle")
        y += 96
    body += footer(760, w)
    return pack(w, h, body)


def b1080():
    w, h, pid = 1080, 800, "b1080"
    body = grid_bg(w, h)
    body += nav(w, pid, False)
    body += r(48, 64, 984, 120, "none", 0, CYAN, 1)
    body += t(64, 88, "DWG-RH-01  BILL OF MATERIALS  /  PRIVATE DISTRIBUTION", 12, 700, CYAN, JBM)
    body += mark(pid, 64, 96, 72)
    body += t(152, 136, "RAXEHUB", 28, 700, TXT, JBM)
    body += t(152, 164, "3 RELEASED UNITS  /  DARK ONLY  /  SCALE 1:1", 13, 500, MUT, JBM)
    body += r(48, 200, 984, 32, SURF)
    for lab, x in (("NO", 64), ("UNIT", 140), ("FUNCTION", 400), ("STATUS", 760), ("ACTION", 900)):
        body += t(x, 222, lab, 11, 700, CYAN, JBM)
    y = 232
    for i, (name, tag, kind) in enumerate(APPS, 1):
        body += r(48, y, 984, 80, "none", 0, CYAN, 1)
        body += t(64, y + 46, f"{i:02d}", 16, 700, CYAN, JBM)
        body += app_icon(kind, 120, y + 12, 56)
        body += t(192, y + 36, name.upper(), 16, 700, TXT, JBM)
        body += t(400, y + 46, tag.upper(), 13, 400, MUT, JBM)
        body += t(760, y + 46, "RELEASE", 13, 700, CYAN, JBM)
        body += r(900, y + 18, 100, 44, CYAN, 0)
        body += t(950, y + 46, "UNDUH", 12, 700, INK, JBM, "middle")
        y += 88
    body += footer(740, w)
    return pack(w, h, body)


def scan(w, h, pid):
    lines = []
    y = 0
    while y < h:
        lines.append(f'<line x1="0" y1="{y}" x2="{w}" y2="{y}" stroke="#22D3EE" stroke-opacity="0.06" stroke-width="1"/>')
        y += 4
    return f'<g id="{pid}-scan">' + "".join(lines) + "</g>"


def c360():
    w, h, pid = 360, 860, "c360"
    body = f'<defs><radialGradient id="{pid}-wash" cx="50%" cy="16%" r="50%"><stop offset="0%" stop-color="#22D3EE" stop-opacity="0.32"/><stop offset="70%" stop-color="#A78BFA" stop-opacity="0.10"/><stop offset="100%" stop-opacity="0"/></radialGradient></defs>'
    body += f'<circle cx="180" cy="140" r="170" fill="url(#{pid}-wash)"/>'
    body += scan(w, h, pid)
    body += nav(w, pid)
    body += mark(pid, 98, 64, 164)
    body += t(180, 250, "RaxeHub", 32, 800, TXT, PJS, "middle")
    body += t(180, 274, "Lampu bengkel. Tiga APK rilis.", 13, 400, MUT, PJS, "middle")
    y = 300
    for name, tag, kind in APPS:
        body += r(16, y, 328, 140, SURF, 14, CYAN, 1.4)
        body += app_icon(kind, 32, y + 20, 64)
        body += t(108, y + 44, name, 20, 800)
        body += t(108, y + 68, tag, 13, 400, MUT)
        body += chip_ready(108, y + 80)
        body += btn_unduh(220, y + 80, 108)
        y += 156
    body += footer(820, w)
    return pack(w, h, body)


def c1080():
    w, h, pid = 1080, 800, "c1080"
    body = f'<defs><radialGradient id="{pid}-wash" cx="22%" cy="30%" r="40%"><stop offset="0%" stop-color="#22D3EE" stop-opacity="0.34"/><stop offset="60%" stop-color="#A78BFA" stop-opacity="0.12"/><stop offset="100%" stop-opacity="0"/></radialGradient></defs>'
    body += f'<circle cx="220" cy="260" r="240" fill="url(#{pid}-wash)"/>'
    body += scan(w, h, pid)
    body += nav(w, pid, False)
    body += mark(pid, 64, 88, 220)
    body += t(64, 340, "RaxeHub", 40, 800)
    body += t(64, 368, "Lampu bengkel. Tiga APK rilis.", 15, 400, MUT)
    y = 88
    for name, tag, kind in APPS:
        body += r(360, y, 672, 200, SURF, 16, CYAN, 1.5)
        body += app_icon(kind, 384, y + 40, 80)
        body += t(484, y + 72, name, 28, 800)
        body += t(484, y + 104, tag, 16, 400, MUT)
        body += chip_ready(484, y + 124)
        body += btn_unduh(880, y + 128, 128)
        y += 220
    body += footer(740, w)
    return pack(w, h, body)


SCREENS = {
    "A-360": a360,
    "A-1080": a1080,
    "B-360": b360,
    "B-1080": b1080,
    "C-360": c360,
    "C-1080": c1080,
}

if __name__ == "__main__":
    for name, fn in SCREENS.items():
        p = OUT / f"{name}.svg"
        p.write_text(fn(), encoding="utf-8")
        print(p.name, p.stat().st_size)
