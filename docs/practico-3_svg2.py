"""NeuroLab · actividad 15 (potencial de acción, simulador propio js/sim-pa.js): esquemas y guías nuevas de img/potencial/.
Uso: python3 docs/practico-3_svg2.py (desde la raíz). Escribe decremento.svg, axon-refractario.svg, guia-pa-{1,2,3}.svg
y las coordenadas en docs/practico-3_coords2.json (las lee docs/practico-3_build.py).
Las curvas de las guías salen del mismo modelo del simulador (Hodgkin y Huxley, activación del Na⁺ +4 mV, reposo −70 mV)."""
import math, os, json
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(RAIZ, 'img', 'potencial')
W, H = 1200, 750
FONT = "font-family=\"'Segoe UI', Arial, sans-serif\""

def doc(body, bg='#FFFDF8'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{bg}"/>{body}</svg>'
def txt(x, y, t, size=24, col='#1A0E2E', anchor='start', w=700):
    return f'<text x="{x:.0f}" y="{y:.0f}" font-size="{size}" font-weight="{w}" fill="{col}" text-anchor="{anchor}" {FONT}>{t}</text>'
def pol(pts): return ' '.join(f'{x:.0f},{y:.0f}' for x, y in pts)
def guardar(n, s):
    with open(os.path.join(OUT, n), 'w', encoding='utf-8') as f: f.write(s)

# ---------------- Modelo (igual que js/sim-pa.js) ----------------
SH, DT = 4, 0.01
AMP = [13, 29, 49, 81, 130]
def hh(stims, T=20):
    def tasas(V):
        vm, x, y = V - SH, V - SH + 40, V + 55
        return (0.1 * x / (1 - math.exp(-x / 10)) if abs(x) > 1e-6 else 1, 4 * math.exp(-(vm + 65) / 18),
                0.07 * math.exp(-(V + 65) / 20), 1 / (1 + math.exp(-(V + 35) / 10)),
                0.01 * y / (1 - math.exp(-y / 10)) if abs(y) > 1e-6 else .1, 0.125 * math.exp(-(V + 65) / 80))
    V, m, h, n = -65, .05, .6, .32
    def paso(I):
        nonlocal V, m, h, n
        am, bm, ah, bh, an, bn = tasas(V)
        m += DT * (am * (1 - m) - bm * m); h += DT * (ah * (1 - h) - bh * h); n += DT * (an * (1 - n) - bn * n)
        V += DT * (I - 120 * m ** 3 * h * (V - 50) - 36 * n ** 4 * (V + 77) - 0.3 * (V + 54.387))
    for _ in range(30000): paso(0)
    off = -70 - V
    out, t = [], 0.0
    for i in range(int(T / DT)):
        I = sum(a for (ts, a) in stims if ts <= t < ts + .5)
        paso(I); t += DT
        if i % 5 == 0: out.append((t, V + off))
    return out

# ---------------- Ejes ----------------
def ejes(x0, x1, y0, y1, t1, vmin=-90, vmax=50, paso_t=5, titulo=''):
    X = lambda t: x0 + (x1 - x0) * t / t1
    Y = lambda v: y0 + (y1 - y0) * (vmax - v) / (vmax - vmin)
    s = f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>'
    for v in range(-80, vmax + 1, 40):
        s += f'<line x1="{x0}" x2="{x1}" y1="{Y(v):.0f}" y2="{Y(v):.0f}" stroke="#E2E8F0" stroke-width="2"/>' + txt(x0 - 10, Y(v) + 8, str(v).replace('-', '−'), 20, '#64748B', 'end')
    s += f'<line x1="{x0}" x2="{x1}" y1="{Y(-70):.0f}" y2="{Y(-70):.0f}" stroke="#94A3B8" stroke-width="3" stroke-dasharray="12 8"/>'
    s += f'<line x1="{x0}" x2="{x1}" y1="{Y(-55):.0f}" y2="{Y(-55):.0f}" stroke="#DC2626" stroke-width="3" stroke-dasharray="12 8"/>'
    s += txt(x1 - 8, Y(-70) - 8, 'reposo −70', 19, '#64748B', 'end') + txt(x1 - 8, Y(-55) - 10, 'umbral −55', 19, '#DC2626', 'end')
    t = 0
    while t <= t1 + 1e-9:
        s += txt(X(t), y1 + 28, f'{t:g}', 19, '#64748B', 'middle'); t += paso_t
    s += txt(x1, y1 + 54, 'ms', 19, '#64748B', 'end') + txt(x0 - 70, y0 - 16, 'mV', 19, '#64748B')
    if titulo: s += txt(x0, y0 - 16, titulo, 24, '#1A0E2E', w=800)
    return s, X, Y
def curva(datos, X, Y, t_desde=0, vmin=-90, vmax=50):
    return [(X(t - t_desde), Y(max(vmin, min(vmax, v)))) for t, v in datos if t >= t_desde]

# ---------------- Guía nivel I: local frente a acción ----------------
s, X, Y = ejes(150, 1150, 90, 640, 12, paso_t=2)
series = [('#94A3B8', hh([(1, AMP[0])], 12), '1 · Intensidad 1: potencial local'),
          ('#64748B', hh([(1, AMP[1])], 12), '2 · Intensidad 2: mayor, bajo el umbral'),
          ('#16A34A', hh([(1, AMP[1]), (2.2, AMP[1])], 12), '3 · Dos de intensidad 2: sumación → PA'),
          ('#7C3AED', hh([(1, AMP[2])], 12), '4 · Intensidad 3 o 5: el mismo PA')]
for c, d, _ in series: s += f'<polyline points="{pol(curva(d, X, Y))}" fill="none" stroke="{c}" stroke-width="6" stroke-linejoin="round"/>'
s += '<rect x="610" y="118" width="520" height="190" rx="16" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>'
for i, (c, _, t) in enumerate(series):
    s += f'<line x1="630" x2="672" y1="{158 + i * 42}" y2="{158 + i * 42}" stroke="{c}" stroke-width="8"/>' + txt(686, 166 + i * 42, t, 21)
guardar('guia-pa-1.svg', doc(s))

# ---------------- Guía nivel II: fases ----------------
PA = hh([(1, AMP[2])], 20)
s, X, Y = ejes(150, 1150, 90, 640, 20, paso_t=5)
v = [x[1] for x in PA]
ip = max(range(len(v)), key=lambda i: v[i])
i0 = next(i for i in range(ip, 0, -1) if v[i] <= -55)
ir = next(i for i in range(ip, len(v)) if v[i] <= -70)
ih = next(i for i in range(ir + 5, len(v)) if v[i] >= -72 and v[i + 1] >= v[i])
im = min(range(len(v)), key=lambda i: v[i])
VPK, VMIN = round(v[ip]), round(v[im])
tramos = [('#16A34A', 0, i0, ip, 'a · Despolarización'), ('#2563EB', 1, ip, ir, 'b · Repolarización'), ('#D97706', 2, ir, ih, 'c · Hiperpolarización')]
s += f'<polyline points="{pol(curva(PA, X, Y))}" fill="none" stroke="#CBD5E1" stroke-width="6"/>'
for c, _, a, b, t in tramos: s += f'<polyline points="{pol(curva(PA[a:b + 1], X, Y))}" fill="none" stroke="{c}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>'
tp = PA[ip][0]
s += txt(X(tp) - 22, Y(-10), 'a', 34, '#16A34A', 'end', 900) + txt(X(tp) + 95, Y(-10), 'b', 34, '#2563EB', 'start', 900) + txt(X(PA[im][0]) + 70, Y(-81) + 46, 'c', 34, '#D97706', 'middle', 900)
s += txt(X(tp) + 16, Y(v[ip]) - 6, f'peak +{round(v[ip])} mV', 21, '#1A0E2E') + txt(X(PA[im][0]) + 110, Y(v[im]) + 8, f'mínimo {round(v[im])} mV'.replace('-', '−'), 21, '#1A0E2E')
s += '<rect x="640" y="118" width="490" height="168" rx="16" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>'
for k, (c, _, _, _, t) in enumerate(tramos):
    s += f'<line x1="660" x2="702" y1="{156 + k * 42}" y2="{156 + k * 42}" stroke="{c}" stroke-width="10"/>' + txt(716, 164 + k * 42, t + ['  (entra Na⁺)', '  (sale K⁺)', '  (K⁺ sigue saliendo)'][k], 21)
guardar('guia-pa-2.svg', doc(s))

# ---------------- Guía nivel III: períodos refractarios ----------------
s, X, Y = ejes(150, 1150, 90, 640, 20, paso_t=5)
d2 = hh([(1, AMP[2]), (10, AMP[4])], 20)
t_on = PA[i0][0]
t_abs, t_rel = 7.5, PA[ih][0]   # con intensidad 5 el segundo PA aparece desde ≈ 6,5 ms después del primer estímulo
s += (f'<rect x="{X(t_on):.0f}" y="90" width="{X(t_abs) - X(t_on):.0f}" height="550" fill="#FCA5A5" opacity=".45"/>'
      f'<rect x="{X(t_abs):.0f}" y="90" width="{X(t_rel) - X(t_abs):.0f}" height="550" fill="#FCD34D" opacity=".45"/>')
s += f'<polyline points="{pol(curva(d2, X, Y))}" fill="none" stroke="#7C3AED" stroke-width="6" stroke-linejoin="round"/>'
s += txt((X(t_on) + X(t_abs)) / 2, 616, 'Absoluto', 22, '#991B1B', 'middle', 900) + txt((X(t_abs) + X(t_rel)) / 2, 616, 'Relativo', 22, '#92400E', 'middle', 900)
pk2 = max(x[1] for x in d2 if x[0] > 10)
s += txt(X(10.6) + 10, Y(pk2) - 10, f'2.º PA (intensidad 5): +{round(pk2)} mV', 20, '#5B21B6')
guardar('guia-pa-3.svg', doc(s))

# ---------------- Esquema: decremento y sumación espacial ----------------
NEU = '#E9D5FF'; NEU_S = '#7C3AED'
def neurona():
    s = ''
    # dendritas (A lejos, B en otra rama), soma, cono y axón mielinizado
    s += f'<path d="M150 600 C 260 600 360 590 470 560" stroke="{NEU_S}" stroke-width="34" fill="none" stroke-linecap="round"/>'
    s += f'<path d="M150 600 C 260 600 360 590 470 560" stroke="{NEU}" stroke-width="26" fill="none" stroke-linecap="round"/>'
    s += f'<path d="M300 440 C 380 470 440 500 500 530" stroke="{NEU_S}" stroke-width="30" fill="none" stroke-linecap="round"/>'
    s += f'<path d="M300 440 C 380 470 440 500 500 530" stroke="{NEU}" stroke-width="22" fill="none" stroke-linecap="round"/>'
    s += f'<ellipse cx="560" cy="555" rx="92" ry="78" fill="{NEU}" stroke="{NEU_S}" stroke-width="4"/>'
    s += f'<path d="M645 535 L700 545 L700 565 L645 575 Z" fill="{NEU}" stroke="{NEU_S}" stroke-width="4"/>'
    s += f'<rect x="700" y="545" width="480" height="20" fill="{NEU}" stroke="{NEU_S}" stroke-width="3"/>'
    for x in (760, 900, 1040):
        s += f'<rect x="{x}" y="536" width="110" height="38" rx="18" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3"/>'
    # botones sinápticos A y B
    for (x, y, l) in ((128, 600, 'A'), (284, 432, 'B')):
        s += f'<circle cx="{x - 34}" cy="{y}" r="24" fill="#FBCFE8" stroke="#BE185D" stroke-width="4"/>' + txt(x - 34, y + 9, l, 26, '#9D174D', 'middle', 900)
    s += txt(260, 652, 'Dendrita', 22, '#5B21B6', 'middle') + txt(560, 562, 'Soma', 22, '#5B21B6', 'middle') + txt(690, 610, 'Cono axónico', 22, '#5B21B6', 'middle')
    return s
PAN = [(40, 'En la dendrita', (128, 600)), (440, 'En el soma', (560, 480)), (840, 'En el cono axónico', (690, 545))]
PW_, PH_, PY_ = 320, 230, 70
def panel(x0, tit, punto):
    X = lambda t: x0 + 20 + (PW_ - 40) * t / 10
    Y = lambda v: PY_ + 40 + (PH_ - 60) * (-40 - v) / 40      # −40 a −80 mV
    s = f'<rect x="{x0}" y="{PY_}" width="{PW_}" height="{PH_}" rx="16" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>' + txt(x0 + 16, PY_ + 30, tit, 21, '#1A0E2E', w=800)
    s += f'<line x1="{x0 + 20}" x2="{x0 + PW_ - 20}" y1="{Y(-70):.0f}" y2="{Y(-70):.0f}" stroke="#94A3B8" stroke-width="3" stroke-dasharray="10 7"/>'
    s += f'<line x1="{x0 + 20}" x2="{x0 + PW_ - 20}" y1="{Y(-55):.0f}" y2="{Y(-55):.0f}" stroke="#DC2626" stroke-width="3" stroke-dasharray="10 7"/>'
    s += txt(x0 + PW_ - 22, Y(-55) - 8, 'umbral', 17, '#DC2626', 'end') + txt(x0 + PW_ - 22, Y(-70) + 22, 'reposo', 17, '#64748B', 'end')
    s += f'<line x1="{x0 + PW_ / 2:.0f}" y1="{PY_ + PH_}" x2="{punto[0]}" y2="{punto[1] - 30}" stroke="#94A3B8" stroke-width="2.5" stroke-dasharray="6 6"/>'
    s += f'<circle cx="{punto[0]}" cy="{punto[1] - 30}" r="6" fill="#94A3B8"/>'
    return s, X, Y
def psp(t0, amp, tau=1.6, t1=10, n=60, pa=False):
    pts = []
    for i in range(n + 1):
        t = t0 + (t1 - t0) * i / n
        u = t - t0
        v = -70 + amp * (u / tau) * math.exp(1 - u / tau) if u >= 0 else -70
        pts.append((t, v))
    return pts
s = neurona()
trazas = {}
for k, (x0, tit, pt) in enumerate(PAN):
    p, X, Y = panel(x0, tit, pt); s += p
    amp = [14, 8, 4][k]
    a_sola = psp(.6, amp, t1=4.6)
    trazas[f'A{k}'] = [[round(X(t)), round(Y(v))] for t, v in a_sola]
    if k == 2:   # A + B juntas en el cono: la suma llega al umbral y dispara
        sub = [(t, v) for t, v in psp(5.4, 17, t1=6.8)]
        pts = [[round(X(t)), round(Y(v))] for t, v in sub]
        pts += [[round(X(7.0)), round(Y(-40))], [round(X(7.0)), PY_ + 44]]
        trazas['AB2'] = pts
        s += f'<line x1="{X(5):.0f}" x2="{X(5):.0f}" y1="{PY_ + 44}" y2="{PY_ + PH_ - 14}" stroke="#E2E8F0" stroke-width="2"/>'
guardar('decremento.svg', doc(s))

# ---------------- Esquema: axón y período refractario ----------------
NODOS = [330, 500, 670, 840, 1010]
DEND = ['M170 380 C 130 330 100 280 70 230', 'M95 262 C 70 250 50 255 30 240', 'M170 380 C 120 370 70 380 20 370',
        'M170 380 C 130 430 100 480 60 530', 'M85 505 C 60 510 40 500 22 515', 'M170 380 C 175 320 190 270 200 220', 'M170 380 C 180 440 200 490 215 540']
s = ''.join(f'<path d="{d}" stroke="{NEU_S}" stroke-width="{w + 8}" fill="none" stroke-linecap="round"/>' for d, w in zip(DEND, (20, 12, 18, 20, 12, 16, 16)))
s += ''.join(f'<path d="{d}" stroke="{NEU}" stroke-width="{w}" fill="none" stroke-linecap="round"/>' for d, w in zip(DEND, (20, 12, 18, 20, 12, 16, 16)))
s += f'<ellipse cx="170" cy="380" rx="78" ry="68" fill="{NEU}" stroke="{NEU_S}" stroke-width="4"/>' + txt(170, 388, 'Soma', 24, '#5B21B6', 'middle')
s += txt(60, 600, 'Dendritas', 22, '#5B21B6', 'middle')
s += f'<path d="M244 364 L270 370 L270 390 L244 396 Z" fill="{NEU}" stroke="{NEU_S}" stroke-width="4"/>'
s += f'<rect x="270" y="370" width="910" height="20" fill="{NEU}" stroke="{NEU_S}" stroke-width="3"/>'
xs = [270] + NODOS + [1180]
for a, b in zip(xs, xs[1:]):
    if b - a > 60: s += f'<rect x="{a + 20 if a != 270 else 290}" y="356" width="{b - a - 40 if a != 270 else b - 310}" height="48" rx="22" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3"/>'
for i, x in enumerate(NODOS): s += txt(x, 446, f'Nodo {i + 1}', 20, '#475569', 'middle')
s += f'<circle cx="{NODOS[2]}" cy="380" r="34" fill="rgba(245,158,11,.35)" stroke="#F59E0B" stroke-width="4"/>' + txt(NODOS[2], 320, 'PA', 28, '#B45309', 'middle', 900)
guardar('axon-refractario.svg', doc(s))

json.dump({'trazas': trazas, 'nodos': NODOS, 'pan': [[x0, PY_, PW_, PH_] for x0, _, _ in PAN]},
          open(os.path.join(RAIZ, 'docs', 'practico-3_coords2.json'), 'w'), separators=(',', ':'))
print('ok', {k: len(v) for k, v in trazas.items()}, 'peak', VPK, 'min', VMIN, 'fases ms', PA[i0][0], PA[ip][0], PA[ir][0], PA[ih][0])
