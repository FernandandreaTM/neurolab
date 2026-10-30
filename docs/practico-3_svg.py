"""NeuroLab · práctico 3 (canales y potencial de acción): genera los esquemas SVG de img/potencial/.
Uso: python docs/practico-3_svg.py  (desde la raíz del repo). Las coordenadas de zonas y efectos del seed salen de aquí."""
import math, random, os, json
OUT = os.path.join(os.path.dirname(__file__), '..', 'img', 'potencial')
W, H = 1200, 750
FONT = "font-family=\"'Segoe UI', Arial, sans-serif\""
EXT, INT = '#E0F2FE', '#FFF4E0'
NA, NA_S, K, K_S = '#22C55E', '#166534', '#3B82F6', '#1E3A8A'

def doc(body, w=W, h=H, bg='#FFFDF8'):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<rect width="{w}" height="{h}" fill="{bg}"/>{body}</svg>')

def txt(x, y, t, size=26, col='#1A0E2E', anchor='start', w=700, extra=''):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{w}" fill="{col}" text-anchor="{anchor}" {FONT} {extra}>{t}</text>'

def ion(x, y, kind, r=16):
    f, s, lab = {'na': (NA, NA_S, 'Na⁺'), 'k': (K, K_S, 'K⁺'), 'cl': ('#FACC15', '#A16207', 'Cl⁻')}[kind]
    return (f'<g><circle cx="{x:.0f}" cy="{y:.0f}" r="{r}" fill="{f}" stroke="{s}" stroke-width="2.5"/>'
            f'<text x="{x:.0f}" y="{y + 4.5:.0f}" font-size="{r * .85:.0f}" font-weight="800" fill="#fff" text-anchor="middle" {FONT}>{lab}</text></g>')

# ---------------- Membrana ----------------
MY0, MY1 = 330, 420           # bicapa (y)

def bicapa(x0=0, x1=W, huecos=()):
    """Fosfolípidos: cabezas en dos filas y colas; `huecos` = [(xa, xb)] donde van proteínas."""
    s = f'<rect x="{x0}" y="{MY0}" width="{x1 - x0}" height="{MY1 - MY0}" fill="#FFEDD5"/>'
    x = x0 + 12
    while x < x1:
        if not any(a - 14 < x < b + 14 for a, b in huecos):
            for yh, yt in ((MY0 + 11, MY0 + 22), (MY1 - 11, MY1 - 22)):
                d = 1 if yt > yh else -1
                s += (f'<path d="M{x - 4} {yt} q-3 {12 * d} 0 {24 * d} M{x + 4} {yt} q3 {12 * d} 0 {24 * d}" stroke="#FDBA74" stroke-width="3" fill="none"/>'
                      f'<circle cx="{x}" cy="{yh}" r="10" fill="#FB923C" stroke="#C2410C" stroke-width="2"/>')
        x += 24
    return s

def canal(cx, kind, abierto=False, etq=True):
    col, borde = ('#BBF7D0', NA_S) if kind == 'na' else ('#BFDBFE', K_S)
    g = 8 if not abierto else 30            # ancho del poro
    s = (f'<path d="M{cx - 70} {MY0 - 26} Q{cx - 74} {(MY0 + MY1) / 2} {cx - 70} {MY1 + 26} L{cx - g / 2} {MY1 + 26} L{cx - g / 2} {MY0 - 26}Z" fill="{col}" stroke="{borde}" stroke-width="3"/>'
         f'<path d="M{cx + 70} {MY0 - 26} Q{cx + 74} {(MY0 + MY1) / 2} {cx + 70} {MY1 + 26} L{cx + g / 2} {MY1 + 26} L{cx + g / 2} {MY0 - 26}Z" fill="{col}" stroke="{borde}" stroke-width="3"/>')
    if not abierto:   # compuerta cerrada
        s += f'<rect x="{cx - 24}" y="{MY0 - 34}" width="48" height="14" rx="7" fill="{borde}"/>'
    else:
        s += f'<rect x="{cx - 64}" y="{MY0 - 50}" width="40" height="14" rx="7" fill="{borde}" transform="rotate(-35 {cx - 44} {MY0 - 43})"/>'
    if etq:
        s += txt(cx, MY1 + 62, ('Canal de Na⁺' if kind == 'na' else 'Canal de K⁺') + (' · abierto' if abierto else ' · cerrado'), 22, borde, 'middle', 800)
    return s

def bomba(cx):
    return (f'<path d="M{cx - 58} {MY0 - 34} q-16 {(MY1 - MY0 + 68) / 2} 0 {MY1 - MY0 + 68} h116 q16 -{(MY1 - MY0 + 68) / 2} 0 -{MY1 - MY0 + 68}z" fill="#DDD6FE" stroke="#6D28D9" stroke-width="3"/>'
            f'<path d="M{cx} {MY0 - 20} v{MY1 - MY0 + 40}" stroke="#6D28D9" stroke-width="3" stroke-dasharray="6 6"/>'
            + txt(cx, MY1 + 64, 'Proteína transportadora', 20, '#6D28D9', 'middle', 800))

def regiones(etq=True):
    s = f'<rect width="{W}" height="{MY0}" fill="{EXT}"/><rect y="{MY1}" width="{W}" height="{H - MY1}" fill="{INT}"/>'
    if etq:
        s += txt(30, 50, 'MEDIO EXTRACELULAR', 26, '#0C4A6E', w=800, extra='letter-spacing="2"')
        s += txt(30, H - 28, 'CITOPLASMA (INTRACELULAR)', 26, '#7C2D12', w=800, extra='letter-spacing="2"')
    return s

def nube(n, x0, x1, y0, y1, seed, evitar=()):
    rnd = random.Random(seed); pts = []
    while len(pts) < n:
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        if any(a <= x <= b for a, b in evitar): continue
        if all(math.hypot(x - a, y - b) > 40 for a, b in pts): pts.append((round(x), round(y)))
    return pts

EVITAR = [(300, 500), (700, 900)]       # canales en x = 400 y 800
NA_AF = nube(14, 40, 1160, 90, 290, 1, EVITAR)
NA_AD = nube(2, 40, 1160, 470, 680, 2, EVITAR)
K_AD = nube(14, 40, 1160, 470, 680, 3, EVITAR)
K_AF = nube(2, 40, 1160, 90, 290, 4, EVITAR)
CARGAS = ''.join(txt(x, MY0 - 10, '+', 30, '#B91C1C', 'middle', 900) for x in range(40, W, 80)) + \
         ''.join(txt(x, MY1 + 30, '−', 34, '#1D4ED8', 'middle', 900) for x in range(40, W, 80))

def iones(na_af=NA_AF, na_ad=NA_AD, k_ad=K_AD, k_af=K_AF):
    return ''.join(ion(x, y, 'na') for x, y in na_af + na_ad) + ''.join(ion(x, y, 'k') for x, y in k_ad + k_af)

def leyenda(x=W - 330, y=34):
    return (f'<rect x="{x}" y="{y - 26}" width="300" height="44" rx="22" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>'
            + ion(x + 34, y - 4, 'na') + txt(x + 56, y + 4, 'sodio', 22, '#166534')
            + ion(x + 158, y - 4, 'k') + txt(x + 180, y + 4, 'potasio', 22, '#1E3A8A'))

def guardar(nombre, svg):
    with open(os.path.join(OUT, nombre), 'w', encoding='utf-8') as f: f.write(svg)

# Actividad 1 · nivel I: membrana sin iones (con la bomba sin nombre) y su versión de la guía
guardar('membrana.svg', doc(regiones() + bicapa(huecos=[(942, 1058)]) + bomba(1000) + leyenda()))
guardar('membrana-reposo.svg', doc(regiones() + bicapa(huecos=[(942, 1058)]) + bomba(1000) + iones(
    [p for p in NA_AF if not 900 < p[0] < 1100], NA_AD, [p for p in K_AD if not 900 < p[0] < 1100], K_AF) + CARGAS
    + txt(1000, 150, 'Bomba Na⁺/K⁺', 24, '#6D28D9', 'middle', 800) + txt(1000, 180, '3 Na⁺ fuera · 2 K⁺ dentro', 20, '#6D28D9', 'middle', 700)
    + '<rect x="20" y="452" width="290" height="50" rx="25" fill="#fff" stroke="#1D4ED8" stroke-width="3"/>' + txt(165, 487, 'Interior ≈ −70 mV', 28, '#1D4ED8', 'middle', 800) + leyenda()))
# nivel II: membrana en reposo con un canal de Na⁺ y uno de K⁺
base2 = regiones() + bicapa(huecos=EVITAR) + iones() + leyenda()
guardar('canales.svg', doc(base2 + canal(400, 'na') + canal(800, 'k')))
guardar('canal-na-abierto.svg', doc(base2 + canal(400, 'na', True) + canal(800, 'k')))
guardar('canal-k-abierto.svg', doc(base2 + canal(400, 'na') + canal(800, 'k', True)))

# ---------------- Neurona: dónde y por qué se abren los canales ----------------
def neurona():
    """1200×800 (= 1536×1024 de ChatGPT ÷ 1,28). Piel periférica, neurona sensitiva, segunda neurona; aumentos de la sinapsis
    excitatoria (abajo izq.), de la inhibitoria (arriba centro-izq.) y del cono axónico con canales de Na⁺ dependientes de voltaje
    (arriba der.); espacio libre abajo al centro para el mini-registro; leyenda abajo a la derecha."""
    s = ('<defs><radialGradient id="soma" cx=".4" cy=".35"><stop offset="0" stop-color="#EDE9FE"/><stop offset="1" stop-color="#A78BFA"/></radialGradient>'
         '<radialGradient id="somas" cx=".4" cy=".35"><stop offset="0" stop-color="#FEF3C7"/><stop offset="1" stop-color="#F59E0B"/></radialGradient>'
         f'<clipPath id="zE"><circle cx="{ZE[0]}" cy="{ZE[1]}" r="{ZE[2]}"/></clipPath><clipPath id="zI"><circle cx="{ZI[0]}" cy="{ZI[1]}" r="{ZI[2]}"/></clipPath>'
         f'<clipPath id="zC"><circle cx="{ZC[0]}" cy="{ZC[1]}" r="{ZC[2]}"/></clipPath><clipPath id="zM"><circle cx="{ZM[0]}" cy="{ZM[1]}" r="{ZM[2]}"/></clipPath></defs>')
    # piel (epidermis a la izquierda = superficie; dermis a la derecha, por donde sale el nervio)
    s += '<path d="M0 300 H112 Q100 360 108 430 Q116 500 104 560 H0Z" fill="#FDE2CF"/>'
    s += '<path d="M0 300 H36 V560 H0Z" fill="#F9A8D4" opacity=".55"/>'
    # corpúsculo de Pacini en la dermis profunda: cápsula en capas con el terminal al centro
    s += ''.join(f'<ellipse cx="{PAC[0]}" cy="{PAC[1]}" rx="{rx}" ry="{ry}" fill="{"#FFF7ED" if k == 0 else "none"}" stroke="#E7A57E" stroke-width="2.5"/>'
                 for k, (rx, ry) in enumerate(((34, 22), (27, 17), (20, 12), (13, 8))))
    s += f'<path d="M{PAC[0] - 10} {PAC[1]} H112" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>'
    # ganglio y soma sensitivo
    s += '<ellipse cx="240" cy="290" rx="72" ry="54" fill="#FFF7ED" stroke="#F59E0B" stroke-width="3" stroke-dasharray="9 7"/>'
    s += '<path d="M240 322 C240 360 248 400 240 430" stroke="#F59E0B" stroke-width="7" fill="none"/>'
    s += '<circle cx="240" cy="290" r="32" fill="url(#somas)" stroke="#B45309" stroke-width="3.5"/><circle cx="236" cy="286" r="12" fill="#B45309" opacity=".55"/>'
    # axón sensitivo y botón presináptico
    s += '<path d="M110 430 H424" stroke="#F59E0B" stroke-width="7"/>'
    s += ''.join(f'<rect x="{x}" y="419" width="{w}" height="22" rx="10" fill="#FEF3C7" stroke="#D97706" stroke-width="2.5"/>' for x, w in ((124, 92), (262, 62), (340, 62)))
    s += '<circle cx="240" cy="430" r="6" fill="#B45309"/>'
    s += '<path d="M424 430 C428 414 448 412 452 430 C448 446 428 446 424 430Z" fill="#FCD34D" stroke="#B45309" stroke-width="3"/>'
    # segunda neurona
    s += ('<path d="M458 430 C510 432 560 432 600 432" stroke="#8B5CF6" stroke-width="22" fill="none" stroke-linecap="round"/>'
          '<path d="M686 384 C712 330 730 290 752 240 M604 500 C590 540 574 580 556 620 M690 498 C712 540 724 580 744 620" stroke="#8B5CF6" stroke-width="14" fill="none" stroke-linecap="round"/>')
    s += '<ellipse cx="640" cy="440" rx="80" ry="70" fill="url(#soma)" stroke="#6D28D9" stroke-width="4"/>'
    s += '<circle cx="636" cy="446" r="28" fill="#7C3AED" opacity=".5"/><circle cx="640" cy="442" r="8" fill="#4C1D95"/>'
    # axón inhibitorio (a la izquierda) y su botón sobre el soma
    s += f'<path d="M575 0 C576 140 586 260 {BI[0]} {BI[1] - 12}" stroke="#EC4899" stroke-width="7" fill="none"/>'
    s += f'<path d="M{BI[0] - 14} {BI[1]} C{BI[0] - 12} {BI[1] - 16} {BI[0] + 10} {BI[1] - 18} {BI[0] + 14} {BI[1] - 2} C{BI[0] + 10} {BI[1] + 14} {BI[0] - 10} {BI[1] + 14} {BI[0] - 14} {BI[1]}Z" fill="#FBCFE8" stroke="#BE185D" stroke-width="3"/>'
    # cono axónico y axón mielinizado
    s += '<path d="M718 424 L782 430 L782 438 L718 450Z" fill="#A78BFA" stroke="#6D28D9" stroke-width="4"/>'
    s += '<path d="M782 434 H1200" stroke="#7C3AED" stroke-width="9"/>'
    for x in (800, 910, 1020, 1130):
        s += f'<rect x="{x}" y="418" width="{80 if x < 1130 else 90}" height="32" rx="14" fill="#EDE9FE" stroke="#6D28D9" stroke-width="3"/>'
    # ---- aumento de la sinapsis excitatoria: pre a la izquierda, post a la derecha ----
    cx, cy, r = ZE
    z = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F1F5F9"/>'
    z += f'<path d="M{cx - r - 10} {cy - r} H{XPRE - 30} C{XPRE + 4} {cy - 70} {XPRE + 4} {cy + 70} {XPRE - 30} {cy + r} H{cx - r - 10}Z" fill="#FCD34D" stroke="#B45309" stroke-width="4"/>'
    z += f'<ellipse cx="{cx - 70}" cy="{cy + 40}" rx="28" ry="14" fill="#FDBA74" stroke="#C2410C" stroke-width="2"/><path d="M{cx - 92} {cy + 40} q11 -9 22 0 t22 0" stroke="#C2410C" stroke-width="2" fill="none"/>'
    for vx, vy in VES_E:
        z += f'<circle cx="{vx}" cy="{vy}" r="13" fill="#FCE7F3" stroke="#BE185D" stroke-width="2"/>' + ''.join(f'<polygon points="{vx + dx},{vy + dy - 4} {vx + dx + 4},{vy + dy + 3} {vx + dx - 4},{vy + dy + 3}" fill="#EC4899"/>' for dx, dy in ((-4, -2), (4, 3)))
    z += f'<path d="M{XPRE - 2} {cy - 18} q-16 0 -16 18 q0 18 16 18" fill="#FCE7F3" stroke="#BE185D" stroke-width="2"/>'
    z += f'<rect x="{XPOST}" y="{cy - r}" width="{cx + r - XPOST + 10}" height="{2 * r}" fill="#C4B5FD"/>'
    z += f'<rect x="{XPOST}" y="{cy - 75}" width="9" height="150" fill="#6D28D9" opacity=".55"/><path d="M{XPOST} {cy - r} V{cy + r}" stroke="#6D28D9" stroke-width="3"/>'
    for ry in REC_E:
        z += (f'<rect x="{XPOST - 6}" y="{ry - 15}" width="14" height="30" rx="4" fill="#4ADE80" stroke="#166534" stroke-width="2.5"/>'
              f'<rect x="{XPOST + 8}" y="{ry - 15}" width="14" height="30" rx="4" fill="#4ADE80" stroke="#166534" stroke-width="2.5"/>')
    s += f'<g clip-path="url(#zE)">{z}</g><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#475569" stroke-width="3"/>'
    s += txt(cx - 44, cy + r - 14, 'presináptica', 15, '#92400E', 'middle', 800) + txt(cx + 70, cy + r - 14, 'postsináptica', 15, '#4C1D95', 'middle', 800)
    s += '<circle cx="438" cy="430" r="30" fill="none" stroke="#475569" stroke-width="2.5" stroke-dasharray="6 5"/>'
    s += f'<path d="M418 452 L{cx + 40} {cy - r + 8} M460 446 L{cx + r - 6} {cy - 40}" stroke="#475569" stroke-width="2" stroke-dasharray="6 5"/>'
    # ---- aumento de la sinapsis inhibitoria: pre arriba, post abajo ----
    cx, cy, r = ZI
    z = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F1F5F9"/>'
    z += f'<path d="M{cx - r} {cy - r - 10} V{YPRE - 26} C{cx - 60} {YPRE + 4} {cx + 60} {YPRE + 4} {cx + r} {YPRE - 26} V{cy - r - 10}Z" fill="#FBCFE8" stroke="#BE185D" stroke-width="4"/>'
    for vx, vy in VES_I:
        z += f'<circle cx="{vx}" cy="{vy}" r="12" fill="#FFF7ED" stroke="#C2410C" stroke-width="2"/>' + ''.join(f'<rect x="{vx + dx - 3}" y="{vy + dy - 3}" width="6" height="6" transform="rotate(45 {vx + dx} {vy + dy})" fill="#F97316"/>' for dx, dy in ((-4, -2), (4, 3)))
    z += f'<rect x="{cx - r}" y="{YPOST}" width="{2 * r}" height="{cy + r - YPOST + 10}" fill="#C4B5FD"/>'
    z += f'<rect x="{cx - 70}" y="{YPOST}" width="140" height="9" fill="#6D28D9" opacity=".55"/><path d="M{cx - r} {YPOST} H{cx + r}" stroke="#6D28D9" stroke-width="3"/>'
    for rx_ in REC_I:
        z += (f'<rect x="{rx_ - 7}" y="{YPOST - 14}" width="14" height="28" rx="4" fill="#FDE047" stroke="#A16207" stroke-width="2.5"/>'
              f'<rect x="{rx_ - 7 + 15}" y="{YPOST - 14}" width="14" height="28" rx="4" fill="#FDE047" stroke="#A16207" stroke-width="2.5"/>')
    s += f'<g clip-path="url(#zI)">{z}</g><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#475569" stroke-width="3"/>'
    s += txt(cx, YPRE - 12, 'presináptica', 15, '#9D174D', 'middle', 800, 'paint-order="stroke" stroke="#FBCFE8" stroke-width="5"') + txt(cx, cy + r - 22, 'postsináptica', 15, '#4C1D95', 'middle', 800)
    s += f'<circle cx="{BI[0]}" cy="{BI[1]}" r="26" fill="none" stroke="#475569" stroke-width="2.5" stroke-dasharray="6 5"/>'
    s += f'<path d="M{BI[0] - 22} {BI[1] - 14} L{cx + 40} {cy + r - 8} M{BI[0] - 6} {BI[1] - 26} L{cx + r - 10} {cy + 30}" stroke="#475569" stroke-width="2" stroke-dasharray="6 5"/>'
    # ---- aumento del cono axónico: afuera arriba, axoplasma abajo; canales de Na⁺ dependientes de voltaje ----
    cx, cy, r = ZC
    z = f'<rect x="{cx - r}" y="{cy - r}" width="{2 * r}" height="{2 * r}" fill="#E0F2FE"/>'
    z += f'<rect x="{cx - r}" y="{YMC + 12}" width="{2 * r}" height="{cy + r - YMC}" fill="#DDD6FE"/>'
    z += f'<rect x="{cx - r}" y="{YMC - 12}" width="{2 * r}" height="24" fill="#C4B5FD"/><path d="M{cx - r} {YMC - 12} H{cx + r} M{cx - r} {YMC + 12} H{cx + r}" stroke="#6D28D9" stroke-width="3"/>'
    for x in REC_C:
        z += (f'<rect x="{x - 22}" y="{YMC - 26}" width="16" height="52" rx="5" fill="#5EEAD4" stroke="#0F766E" stroke-width="2.5"/>'
              f'<rect x="{x + 6}" y="{YMC - 26}" width="16" height="52" rx="5" fill="#5EEAD4" stroke="#0F766E" stroke-width="2.5"/>'
              f'<rect x="{x - 12}" y="{YMC - 32}" width="24" height="8" rx="4" fill="#0F766E"/>'                                  # compuerta
              f'<rect x="{x - 32}" y="{YMC - 14}" width="9" height="28" rx="3" fill="#FB923C" stroke="#C2410C" stroke-width="2"/>'  # sensor de voltaje
              f'<text x="{x - 27.5}" y="{YMC + 5}" font-size="13" font-weight="900" fill="#fff" text-anchor="middle" {FONT}>+</text>')
    s += f'<g clip-path="url(#zC)">{z}</g><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#475569" stroke-width="3"/>'
    s += txt(cx, cy - r + 34, 'afuera', 15, '#0C4A6E', 'middle', 800) + txt(cx, cy + r - 22, 'axoplasma', 15, '#4C1D95', 'middle', 800)
    s += '<circle cx="750" cy="437" r="30" fill="none" stroke="#475569" stroke-width="2.5" stroke-dasharray="6 5"/>'
    s += f'<path d="M740 408 L{cx - r + 22} {cy + 60} M774 418 L{cx - 40} {cy + r - 6}" stroke="#475569" stroke-width="2" stroke-dasharray="6 5"/>'
    # ---- aumento del corpúsculo de Pacini: capas concéntricas y terminal con canales mecanosensibles ----
    cx, cy, r = ZM
    z = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#FDE2CF"/>'
    z += ''.join(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{"#FFF7ED" if k % 2 == 0 else "#FEF3C7"}" stroke="#E7A57E" stroke-width="2.5"/>'
                 for k, (rx, ry) in enumerate(((92, 70), (78, 58), (64, 46), (50, 34), (36, 24))))
    z += f'<rect x="{cx - 44}" y="{cy - 11}" width="{r + 60}" height="22" rx="11" fill="#FCD34D" stroke="#B45309" stroke-width="3"/>'
    for x in REC_M:
        z += f'<rect x="{x - 6}" y="{cy - 20}" width="12" height="18" rx="3" fill="#818CF8" stroke="#3730A3" stroke-width="2"/>'
        z += f'<rect x="{x - 6}" y="{cy + 2}" width="12" height="18" rx="3" fill="#818CF8" stroke="#3730A3" stroke-width="2"/>'
    s += f'<g clip-path="url(#zM)">{z}</g><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#475569" stroke-width="3"/>'
    s += f'<circle cx="{PAC[0]}" cy="{PAC[1]}" r="40" fill="none" stroke="#475569" stroke-width="2.5" stroke-dasharray="6 5"/>'
    s += f'<path d="M{PAC[0] - 30} {PAC[1] - 26} L{cx - 60} {cy + r - 20} M{PAC[0] + 30} {PAC[1] - 26} L{cx + 50} {cy + r - 12}" stroke="#475569" stroke-width="2" stroke-dasharray="6 5"/>'
    # ---- marco del mini-registro (la curva la dibuja la animación) ----
    s += '<g id="superpuesto">' + registro_marco()
    # ---- leyenda ----
    lx, ly = 850, 546
    s += f'<rect x="{lx}" y="{ly}" width="340" height="248" rx="14" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>'
    items = [('<polygon points="0,-8 7,5 -7,5" fill="#EC4899"/>', 'Glutamato'), ('<rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" fill="#F97316"/>', 'GABA'),
             ('<circle r="9" fill="#22C55E" stroke="#166534" stroke-width="2"/>', 'Na⁺'), ('<circle r="8" fill="#FACC15" stroke="#A16207" stroke-width="2"/>', 'Cl⁻'),
             ('<rect x="-5" y="-11" width="10" height="22" rx="3" fill="#4ADE80" stroke="#166534" stroke-width="2"/>', 'Receptor-canal de glutamato'),
             ('<rect x="-5" y="-11" width="10" height="22" rx="3" fill="#FDE047" stroke="#A16207" stroke-width="2"/>', 'Receptor-canal de GABA'),
             ('<rect x="-5" y="-11" width="10" height="22" rx="3" fill="#5EEAD4" stroke="#0F766E" stroke-width="2"/><rect x="-11" y="-6" width="5" height="12" rx="2" fill="#FB923C"/>', 'Canal de Na⁺ de voltaje'),
             ('<rect x="-5" y="-11" width="10" height="22" rx="3" fill="#818CF8" stroke="#3730A3" stroke-width="2"/>', 'Canal mecanosensible')]
    for k, (ico, t) in enumerate(items):
        if k < 4: x, y = lx + 26 + (k % 2) * 150, ly + 30 + (k // 2) * 32
        else: x, y = lx + 26, ly + 98 + (k - 4) * 34
        s += f'<g transform="translate({x} {y})">{ico}</g>' + txt(x + 20, y + 6, t, 17, '#1E293B', w=700)
    return s + '</g>'
def registro_marco():
    m = '<rect x="470" y="648" width="352" height="140" rx="12" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>'
    m += txt(484, 670, 'Registro en el cono axónico', 14, '#334155', w=800)
    m += '<path d="M484 750 H760" stroke="#94A3B8" stroke-width="2" stroke-dasharray="6 5"/>' + txt(766, 755, 'Reposo', 13, '#64748B', w=700)
    m += '<path d="M484 712 H760" stroke="#DC2626" stroke-width="2" stroke-dasharray="6 5"/>' + txt(766, 717, 'Umbral', 13, '#DC2626', w=700)
    return m
PAC = (72, 430)                 # corpúsculo de Pacini
ZM = (135, 118, 100)            # su aumento
REC_M = [110, 145, 180]
ZE = (305, 625, 132)
XPRE, XPOST = 297, 317
VES_E = [(249, 567), (262, 611), (240, 653), (266, 687), (212, 609)]
REC_E = [577, 625, 673]
ZI = (450, 138, 110)
YPRE, YPOST = 130, 150
VES_I = [(410, 80), (452, 96), (494, 78), (428, 52), (472, 50)]
REC_I = [408, 450, 492]
BI = (598, 368)                 # botón inhibitorio sobre el soma
ZC = (935, 200, 125)            # aumento del cono axónico
YMC = 205
REC_C = [880, 942, 1004]
guardar('neurona-canales.svg', doc(neurona(), h=800, bg='#F8FAFC'))
NODOS = [(895, 434), (1005, 434), (1115, 434)]

# ---------------- Gráficos de potencial ----------------
def ejes(t1, vmin, vmax, x0=150, x1=1150, y0=90, y1=660, paso_t=None, lineas=(), titulo='', paso_v=20):
    sx = (x1 - x0) / t1; sy = (y1 - y0) / (vmax - vmin)
    X = lambda t: x0 + t * sx
    Y = lambda v: y0 + (vmax - v) * sy
    s = f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>'
    for v in range(int(math.ceil(vmin / 10) * 10), vmax + 1, 10):
        s += f'<line x1="{x0}" x2="{x1}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="{"#94A3B8" if v == 0 else "#EEF2F7"}" stroke-width="{2 if v == 0 else 1.5}"/>'
        if v % paso_v == 0: s += txt(x0 - 14, Y(v) + 8, f'{v:+d}'.replace('+0', '0').replace('-', '−'), 22, '#475569', 'end', 700)
    pt = paso_t or (1 if t1 <= 12 else 5)
    t = 0
    while t <= t1 + 1e-9:
        s += f'<line x1="{X(t):.1f}" x2="{X(t):.1f}" y1="{y1}" y2="{y1 + 8}" stroke="#94A3B8" stroke-width="2"/>' + txt(X(t), y1 + 34, f'{t:g}', 20, '#475569', 'middle', 700)
        t += pt
    s += txt((x0 + x1) / 2, y1 + 70, 'Tiempo (ms)', 24, '#334155', 'middle', 800)
    s += txt(40, (y0 + y1) / 2, 'Potencial de membrana (mV)', 24, '#334155', 'middle', 800, f'transform="rotate(-90 40 {(y0 + y1) / 2})"')
    for v, etq, col in lineas:
        s += f'<line x1="{x0}" x2="{x1}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="{col}" stroke-width="3" stroke-dasharray="12 8"/>'
        s += txt(x1 - 10, Y(v) - 10, etq, 22, col, 'end', 800)
    if titulo: s += txt(x0, 50, titulo, 28, '#1A0E2E', w=800)
    return s, X, Y

def pol(pts): return ' '.join(f'{x:.0f},{y:.0f}' for x, y in pts)

# Curva del simulador PhET Neuron (modelo de Hodgkin-Huxley modificado de PhET): reposo −65, peak +35, mínimo −77
def curva_phet(t_est=1.0, t_fin=10.0, dt=0.005):
    v, t, pts = 0.0, 0.0, []
    while t <= t_fin:
        ta = t - t_est
        if ta >= 0:
            n4 = .55 * math.exp(-1 / .55 * (ta - 1.75) ** 2); m3h = .3 * math.exp(-1 / .2 * (ta - 1) ** 2)
            v += -dt * (120 * m3h * (v + 115) + 36 * n4 * (v - 12) + .3 * v)
        pts.append((t, -(v + 65))); t += dt
    return pts[::4]

CUR = curva_phet()
base_pa, X, Y = ejes(10, -90, 50, lineas=[(-55, 'Umbral ≈ −55 mV', '#DC2626')], titulo='Potencial de acción (neurona del simulador)')
PA = [(X(t), Y(v)) for t, v in CUR]
def tramo(a, b): return [(X(t), Y(v)) for t, v in CUR if a <= t <= b]
i_peak = max(range(len(CUR)), key=lambda i: CUR[i][1]); t_peak = CUR[i_peak][0]
i_min = min(range(len(CUR)), key=lambda i: CUR[i][1]); t_min = CUR[i_min][0]
t_cruce = next(t for t, v in CUR if t > 1 and v < -65.05 and t > t_peak)   # vuelve a cruzar el reposo
t_um = next(t for t, v in CUR if v >= -55)
FASES = {'despol': (1.0, t_peak), 'repol': (t_peak, t_cruce), 'hiper': (t_cruce, 10)}
curva = f'<polyline points="{pol(PA)}" fill="none" stroke="#7C3AED" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>'
guardar('pa-curva.svg', doc(base_pa + curva))
colF = {'despol': '#16A34A', 'repol': '#2563EB', 'hiper': '#D97706'}
letras = ''
for k, (a, b) in FASES.items():
    letras += f'<polyline points="{pol(tramo(a, b))}" fill="none" stroke="{colF[k]}" stroke-width="10" stroke-linecap="round"/>'
pos = {'despol': (X(1.18) - 34, Y(-10)), 'repol': (X(t_peak + .55) + 34, Y(-10)), 'hiper': (X(t_min + 1.5), Y(-77) + 42)}
nom = {'despol': ('a', 'Despolarización'), 'repol': ('b', 'Repolarización'), 'hiper': ('c', 'Hiperpolarización')}
for k, (x, y) in pos.items():
    letras += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="24" fill="{colF[k]}"/>' + txt(x, y + 10, nom[k][0], 30, '#fff', 'middle', 900)
letras += '<rect x="760" y="150" width="370" height="150" rx="16" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>'
for i, k in enumerate(nom):
    letras += f'<circle cx="790" cy="{185 + i * 42}" r="15" fill="{colF[k]}"/>' + txt(790, 192 + i * 42, nom[k][0], 20, '#fff', 'middle', 900) + txt(818, 193 + i * 42, nom[k][1], 24, colF[k], w=800)
guardar('pa-fases.svg', doc(base_pa + letras))

# Ejes de la sumación (actividad 2, nivel I): reposo −70, umbral −55 (valores de neurona de mamífero)
base_sum, XS, YS = ejes(20, -90, 50, lineas=[(-55, 'Umbral (−55 mV)', '#DC2626'), (-70, 'Reposo (−70 mV)', '#64748B')], titulo='Potencial de membrana en el cono axónico')
guardar('ejes-sumacion.svg', doc(base_sum))
base_med, XM, YM = ejes(10, -90, 50, titulo='Tu registro del simulador')
guardar('ejes-medida.svg', doc(base_med))

def psp(t0, amp, tau=2.2):
    return lambda t: 0 if t < t0 else amp * ((t - t0) / tau) * math.exp(1 - (t - t0) / tau)
def traza_sum(fs, dispara=None):
    pts = []
    t = 0.0
    while t <= 20:
        v = -70 + sum(f(t) for f in fs)
        if dispara is not None and t >= dispara:
            # desde el umbral, la forma del PA del simulador (corrida a reposo −70)
            tt = t - dispara
            tc = t_um + tt
            vc = min(CUR, key=lambda q: abs(q[0] - tc))[1] if tc <= 10 else -65
            v = vc - 5 * min(1, tt / 2)
        pts.append((round(XS(t)), round(YS(v)))); t = round(t + .05, 2)
    return pts
SUMAS = {
    'debil': traza_sum([psp(3, 5)]),
    'fuerte': traza_sum([psp(3, 12.5)]),
    'temporal': traza_sum([psp(3, 10), psp(5, 10)], dispara=None),
    'ipsp': traza_sum([psp(3, 12.5), psp(3.6, -12)]),
}
# sumación temporal que llega al umbral: se busca el cruce y desde ahí el PA
f2 = [psp(3, 10), psp(5, 10)]
t = 3.0
while -70 + sum(f(t) for f in f2) < -55: t += .02
SUMAS['temporal'] = traza_sum(f2, dispara=round(t, 2))

# Actividad 2, nivel IV: curva arriba y membrana con un canal de Na⁺ y uno de K⁺ abajo
def mini_curva(destaca=None):
    s, Xc, Yc = ejes(10, -90, 50, x0=150, x1=1150, y0=60, y1=330, paso_v=40)
    s = s.replace('Tiempo (ms)', '').replace('Potencial de membrana (mV)', 'mV')
    pts = [(Xc(t), Yc(v)) for t, v in CUR]
    s += f'<polyline points="{pol(pts)}" fill="none" stroke="#7C3AED" stroke-width="6"/>'
    if destaca:
        a, b = FASES[destaca]
        s += f'<polyline points="{pol([(Xc(t), Yc(v)) for t, v in CUR if a <= t <= b])}" fill="none" stroke="{colF[destaca]}" stroke-width="12" stroke-linecap="round"/>'
    return s
M2Y0, M2Y1 = 520, 590
def mem2():
    s = f'<rect y="410" width="{W}" height="{M2Y0 - 410}" fill="{EXT}"/><rect y="{M2Y1}" width="{W}" height="{H - M2Y1}" fill="{INT}"/>'
    s += txt(30, 445, 'Extracelular', 22, '#0C4A6E', w=800) + txt(30, H - 20, 'Intracelular', 22, '#7C2D12', w=800)
    s += f'<rect y="{M2Y0}" width="{W}" height="{M2Y1 - M2Y0}" fill="#FDBA74" opacity=".55"/>'
    for x in range(12, W, 24):
        if 250 < x < 550 or 650 < x < 950: continue
        s += f'<circle cx="{x}" cy="{M2Y0 + 9}" r="9" fill="#FB923C"/><circle cx="{x}" cy="{M2Y1 - 9}" r="9" fill="#FB923C"/>'
    return s
def canal2(cx, kind, estado):
    """estado: cerrado · abierto · inactivado (Na⁺) · ? (sin mostrar)"""
    col, borde = ('#BBF7D0', NA_S) if kind == 'na' else ('#BFDBFE', K_S)
    g = 34 if estado == 'abierto' or estado == 'inactivado' else 8
    s = (f'<path d="M{cx - 80} {M2Y0 - 30} Q{cx - 86} {(M2Y0 + M2Y1) / 2} {cx - 80} {M2Y1 + 30} H{cx - g / 2} V{M2Y0 - 30}Z" fill="{col}" stroke="{borde}" stroke-width="3"/>'
         f'<path d="M{cx + 80} {M2Y0 - 30} Q{cx + 86} {(M2Y0 + M2Y1) / 2} {cx + 80} {M2Y1 + 30} H{cx + g / 2} V{M2Y0 - 30}Z" fill="{col}" stroke="{borde}" stroke-width="3"/>')
    if estado == '?':
        s += f'<circle cx="{cx}" cy="{(M2Y0 + M2Y1) / 2}" r="30" fill="#fff" stroke="{borde}" stroke-width="3"/>' + txt(cx, (M2Y0 + M2Y1) / 2 + 13, '?', 38, borde, 'middle', 900)
    elif estado == 'cerrado':
        s += f'<rect x="{cx - 26}" y="{M2Y0 - 40}" width="52" height="14" rx="7" fill="{borde}"/>'
    else:
        s += f'<rect x="{cx - 76}" y="{M2Y0 - 58}" width="42" height="14" rx="7" fill="{borde}" transform="rotate(-35 {cx - 55} {M2Y0 - 51})"/>'
    if estado == 'inactivado':   # compuerta de inactivación (bola y cadena) tapando el poro por dentro
        s += f'<path d="M{cx + 70} {M2Y1 + 30} Q{cx + 40} {M2Y1 + 70} {cx + 8} {M2Y1 + 22}" stroke="#DC2626" stroke-width="5" fill="none"/><circle cx="{cx}" cy="{M2Y1 + 14}" r="17" fill="#DC2626"/>'
    nom = ('Canal de Na⁺' if kind == 'na' else 'Canal de K⁺')
    s += txt(cx, M2Y1 + 100 if estado != 'inactivado' else M2Y1 + 110, nom + ('' if estado == '?' else ' · ' + estado), 22, borde, 'middle', 800)
    return s
ESTADOS = {'despol': ('abierto', 'cerrado'), 'repol': ('inactivado', 'abierto'), 'hiper': ('cerrado', 'abierto')}
guardar('pa-canales.svg', doc(mini_curva() + mem2() + canal2(400, 'na', '?') + canal2(800, 'k', '?')))
for k, (na, kk) in ESTADOS.items():
    guardar(f'pa-canales-{k}.svg', doc(mini_curva(k) + mem2() + canal2(400, 'na', na) + canal2(800, 'k', kk)))

# Coordenadas para el seed
info = {
  'NA_AF': NA_AF, 'NA_AD': NA_AD, 'K_AD': K_AD, 'K_AF': K_AF, 'NODOS': NODOS, 'ZE': ZE, 'ZI': ZI, 'ZC': ZC, 'YMC': YMC, 'ZM': ZM, 'PAC': PAC, 'REC_M': REC_M, 'REC_C': REC_C, 'BI': BI, 'XPRE': XPRE, 'XPOST': XPOST, 'REC_E': REC_E, 'YPRE': YPRE, 'YPOST': YPOST, 'REC_I': REC_I, 'VES_E': VES_E, 'VES_I': VES_I,
  'PA': [list(map(round, p)) for p in PA[::3]],
  'tramos': {k: [list(map(round, p)) for p in tramo(a, b)[::3]] for k, (a, b) in FASES.items()},
  't': {'peak': t_peak, 'min': t_min, 'cruce': t_cruce, 'umbral': t_um},
  'XY': {'peak': [round(X(t_peak)), round(Y(CUR[i_peak][1]))], 'min': [round(X(t_min)), round(Y(CUR[i_min][1]))],
         'umbral': [round(X(t_um)), round(Y(-55))], 'est': [round(X(1)), round(Y(-65))]},
  'SUMAS': {k: v[::2] for k, v in SUMAS.items()},
  'YS': {v: round(YS(v)) for v in (-70, -55, 35, -80)}, 'XS': {t: round(XS(t)) for t in (0, 3, 5, 20)},
  'YM': {v: round(YM(v)) for v in (-65, -55, 35, -77)}, 'XM': {t: round(XM(t)) for t in (0, 10)},
}
json.dump(info, open(os.path.join(OUT, '..', '..', 'docs', 'practico-3_coords.json'), 'w'), separators=(',', ':'))
print({k: info[k] for k in ('t', 'XY', 'YS', 'XS', 'YM', 'XM')})

# ---------------- Imágenes de la guía ----------------
colS = {'debil': ('#94A3B8', '1 · Débil'), 'fuerte': ('#7C3AED', '2 · Más fuerte'), 'temporal': ('#16A34A', '3 · Sumación: potencial de acción'), 'ipsp': ('#DC2626', '4 · PPSE + PPSI')}
g = base_sum
for k, (c, _) in colS.items():
    g += f'<polyline points="{pol(SUMAS[k])}" fill="none" stroke="{c}" stroke-width="6" stroke-linejoin="round"/>'
g += '<rect x="680" y="120" width="460" height="190" rx="16" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>'
for i, (k, (c, t)) in enumerate(colS.items()):
    g += f'<line x1="700" x2="745" y1="{160 + i * 42}" y2="{160 + i * 42}" stroke="{c}" stroke-width="8"/>' + txt(760, 168 + i * 42, t, 23, '#1A0E2E', w=700)
guardar('sumacion-guia.svg', doc(g))

m = base_med + f'<polyline points="{pol(PA)}" fill="none" stroke="#7C3AED" stroke-width="7"/>'
for v, t, col in ((-65, 'Reposo −65 mV', '#475569'), (-55, 'Umbral ≈ −55 mV', '#DC2626'), (35, 'Peak +35 mV', '#16A34A'), (-77, 'Mínimo ≈ −77 mV', '#D97706')):
    m += f'<line x1="150" x2="1150" y1="{YM(v):.0f}" y2="{YM(v):.0f}" stroke="{col}" stroke-width="3" stroke-dasharray="12 8"/>' + txt(1140, YM(v) - 10 if v != -77 else YM(v) + 30, t, 24, col, 'end', 800)
guardar('pa-medidas.svg', doc(m))

xa, xb, xc = X(1.0), X(t_cruce), X(6.0)
r = (f'<rect x="{xa:.0f}" y="90" width="{xb - xa:.0f}" height="570" fill="#FCA5A5" opacity=".45"/>'
     f'<rect x="{xb:.0f}" y="90" width="{xc - xb:.0f}" height="570" fill="#FCD34D" opacity=".45"/>')
rf = base_pa.replace('<polyline', '<polyline') + r + curva
rf += txt((xa + xb) / 2, 640, 'Absoluto', 22, '#991B1B', 'middle', 900) + txt((xb + xc) / 2, 640, 'Relativo', 22, '#92400E', 'middle', 900)
guardar('pa-refractario.svg', doc(rf))
info2 = {'ARP': [round(xa), round(xb)], 'RRP': [round(xb), round(xc)]}
print(info2)
json.dump({**info, **info2}, open(os.path.join(OUT, '..', '..', 'docs', 'practico-3_coords.json'), 'w'), separators=(',', ':'))
