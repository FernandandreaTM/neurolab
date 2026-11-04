"""Guías de la actividad 16 (La sinapsis química): img/sinapsis/guia-sinapsis-1.svg y -2.svg.
Las curvas salen del mismo modelo de js/sim-sinapsis.js. Uso: python3 docs/practico-4_svg.py"""
import pathlib
OUT = pathlib.Path(__file__).resolve().parent.parent / 'img' / 'sinapsis'
P = {'glu': (0, .5, 2.5, 1.0, 3), 'gaba': (-80, 2.5, 5, 1.0, 3), 'nic': (0, .6, 2, .7, .7), 'mus': (-92, 3, 0, .7, .7)}

def correr(tipo, pas=(5,), ca=True, recap=True, TS=150, DT=.02):
    E, G, tr, tc, tcoff = P[tipo]
    V, C, r, s, k, spk, data = -70., 0., 0., 0., 0., -1., []
    fus = [p + .8 for p in pas]; t = 0.; n = 0
    while t < TS:
        if ca:
            for f in fus:
                if t <= f < t + DT: C += 1
        C -= DT * C / (tc if recap else tcoff)
        if tipo == 'mus':
            s += DT * (1.2 * C * (1 - s) - s / 60); k += DT * (s - k) / 35; I = G * k * (V - E)
        else:
            r += DT * (3 * C * (1 - r) - r / tr); I = G * r * (V - E)
        if spk >= 0:
            u = t - spk
            if u < .6: V = -55 + u / .6 * 85
            elif u < 1.8: V = 30 - (u - .6) / 1.2 * 108
            else: spk = -1
        else:
            V += DT * (-(V + 70) - I) / 8
            if V >= -55 and tipo != 'mus': spk = t
        if n % 5 == 0: data.append(V)
        t += DT; n += 1
    return data

FONT = "font-family='Inter, Arial, sans-serif'"

def traza(x, y, w, h, data, titulo, sub, col='#7C3AED', TS=150, rango=(-95, 38), marcas=(5,)):
    lo, hi = rango
    Y = lambda v: y + 58 + (hi - max(lo, min(hi, v))) / (hi - lo) * (h - 92)
    X = lambda t: x + 40 + (w - 56) * t / TS
    pts = ' '.join(f'{X(i * .1):.1f},{Y(v):.1f}' for i, v in enumerate(data))
    s = [f"<rect x='{x}' y='{y}' width='{w}' height='{h}' rx='14' fill='#fff' stroke='#DDD6FE' stroke-width='2'/>",
         f"<text x='{x + 14}' y='{y + 24}' {FONT} font-size='17' font-weight='800' fill='#1A0E2E'>{titulo}</text>",
         f"<text x='{x + 14}' y='{y + 44}' {FONT} font-size='14' font-weight='700' fill='#6D28D9'>{sub}</text>",
         f"<line x1='{X(0)}' y1='{Y(-70)}' x2='{X(TS)}' y2='{Y(-70)}' stroke='#94A3B8' stroke-dasharray='6 5'/>",
         f"<line x1='{X(0)}' y1='{Y(-55)}' x2='{X(TS)}' y2='{Y(-55)}' stroke='#DC2626' stroke-dasharray='6 5'/>",
         f"<text x='{X(0) - 6}' y='{Y(-70) + 5}' {FONT} font-size='12' fill='#64748B' text-anchor='end'>−70</text>",
         f"<text x='{X(0) - 6}' y='{Y(-55) + 4}' {FONT} font-size='12' fill='#DC2626' text-anchor='end'>−55</text>",
         f"<polyline points='{pts}' fill='none' stroke='{col}' stroke-width='3' stroke-linejoin='round'/>"]
    for m in marcas:
        s.append(f"<path d='M{X(m)} {y + h - 22} l-5 -9 h10 z' fill='#F59E0B'/>")
    return '\n'.join(s)

def sinapsis(x, y, nt_col, rec='canal'):
    """Esquema pequeño: botón, hendidura, membrana postsináptica, astrocito; pasos numerados."""
    s = [f"<g transform='translate({x},{y})'>",
         "<path d='M0 70 C40 70 60 95 62 125 C60 158 40 182 0 182 Z' fill='#D1FAE5' stroke='#10B981' stroke-width='3'/>",
         f"<text x='6' y='108' {FONT} font-size='13' font-weight='800' fill='#047857'>Astrocito</text>",
         "<path d='M160 0 V30 C160 50 70 54 70 104 C70 140 100 154 130 154 H290 C320 154 350 140 350 104 C350 54 260 50 260 30 V0' fill='#FFF4E0' stroke='#FB923C' stroke-width='3'/>",
         "<path d='M90 290 V200 C90 186 104 176 124 176 H300 C320 176 334 186 334 200 V290' fill='#EDE9FE' stroke='#8B5CF6' stroke-width='3'/>"]
    for cx in (150, 210, 270):
        s.append(f"<circle cx='{cx}' cy='{120 if cx != 210 else 140}' r='13' fill='#fff' stroke='#FB923C' stroke-width='2.5'/>")
        s.append(f"<circle cx='{cx}' cy='{120 if cx != 210 else 140}' r='4' fill='{nt_col}'/>")
    for cx in (115, 305):
        s.append(f"<rect x='{cx - 10}' y='144' width='8' height='20' rx='3' fill='#C084FC' stroke='#6B21A8'/><rect x='{cx + 2}' y='144' width='8' height='20' rx='3' fill='#C084FC' stroke='#6B21A8'/>")
    for cx in (170, 210, 250):
        if rec == 'canal':
            s.append(f"<rect x='{cx - 11}' y='166' width='8' height='22' rx='3' fill='#F9A8D4' stroke='#BE185D'/><rect x='{cx + 3}' y='166' width='8' height='22' rx='3' fill='#F9A8D4' stroke='#BE185D'/>")
        else:
            s.append(''.join(f"<rect x='{cx - 12 + i * 6}' y='166' width='5' height='22' rx='2' fill='#5EEAD4' stroke='#0F766E'/>" for i in range(4)))
    for cx in (165, 200, 230, 255, 185):
        s.append(f"<path d='M{cx} {158} l5 9 h-10 z' fill='{nt_col}'/>")
    s.append('</g>')
    return '\n'.join(s)

def num(x, y, n, t):
    return (f"<circle cx='{x}' cy='{y}' r='13' fill='#7C3AED'/><text x='{x}' y='{y + 5}' {FONT} font-size='14' font-weight='800' fill='#fff' text-anchor='middle'>{n}</text>"
            f"<text x='{x + 20}' y='{y + 5}' {FONT} font-size='15' font-weight='700' fill='#1A0E2E'>{t}</text>")

def svg(cuerpo):
    return (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 750' width='1200' height='750'>"
            f"<rect width='1200' height='750' fill='#F8FAFC'/>{cuerpo}</svg>")

# Nivel I
c = [sinapsis(40, 70, '#EC4899'),
     num(60, 420, 1, 'Llega el potencial de acción al botón'),
     num(60, 460, 2, 'Se abren canales de Ca²⁺ por voltaje: entra Ca²⁺'),
     num(60, 500, 3, 'Las vesículas se fusionan y liberan glutamato'),
     num(60, 540, 4, 'El glutamato abre sus receptores: entra Na⁺ (PPSE)'),
     num(60, 580, 5, 'El astrocito lo recapta y la señal termina'),
     f"<text x='40' y='40' {FONT} font-size='22' font-weight='800' fill='#1A0E2E'>Del potencial de acción a la liberación</text>",
     traza(470, 30, 350, 340, correr('glu'), 'a · 1 potencial de acción', 'PPSE bajo el umbral', rango=(-75, -45)),
     traza(830, 30, 350, 340, correr('glu', pas=(5, 9, 13, 17, 21)), 'b · Tren de potenciales', 'sumación → potencial de acción', rango=(-85, 38), marcas=(5, 9, 13, 17, 21)),
     traza(470, 385, 350, 340, correr('glu', ca=False), 'c · Ca²⁺ bloqueado', 'sin liberación', rango=(-75, -45)),
     traza(830, 385, 350, 340, correr('glu', recap=False), 'd · Sin recaptación', 'PPSE más grande y largo', rango=(-75, -45))]
(OUT / 'guia-sinapsis-1.svg').write_text(svg('\n'.join(c)), encoding='utf-8')

# Nivel II
c = [f"<text x='40' y='40' {FONT} font-size='22' font-weight='800' fill='#1A0E2E'>El receptor decide el efecto</text>",
     sinapsis(40, 70, '#14B8A6', 'canal'),
     f"<text x='60' y='400' {FONT} font-size='16' font-weight='800' fill='#0F766E'>Ionotrópico: el receptor es un canal (rápido)</text>",
     sinapsis(40, 420, '#14B8A6', 'g'),
     f"<text x='60' y='740' {FONT} font-size='16' font-weight='800' fill='#0F766E'>Metabotrópico: proteína G → otro canal (lento)</text>",
     traza(470, 30, 710, 225, correr('gaba'), 'a · GABA (receptor-canal)', 'entra Cl⁻ → PPSI', col='#F97316', rango=(-82, -60)),
     traza(470, 265, 710, 225, correr('nic'), 'b · ACh en receptor nicotínico', 'entra Na⁺ → PPSE rápido', col='#0D9488', rango=(-82, -60)),
     traza(470, 500, 710, 225, correr('mus'), 'c · ACh en receptor muscarínico', 'sale K⁺ → hiperpolarización lenta', col='#2563EB', rango=(-82, -60))]
(OUT / 'guia-sinapsis-2.svg').write_text(svg('\n'.join(c)), encoding='utf-8')
print('ok')
