"""Circuito reflejo: corrige el nervio que se unía al tendón del extensor y rotula los músculos.
Uso: python3 docs/practico-4_reflejo-img.py <carpeta con los originales>
(esquema-base.jpg, tablero-huecos.jpg, musculo-extensor.webp, musculo-flexor.webp sin editar).
Las coordenadas son las de la imagen de 1152×768 (las zonas y trazos no cambian)."""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont

SRC = pathlib.Path(sys.argv[1])
IMG = pathlib.Path(__file__).resolve().parent.parent / 'img' / 'reflejo'
FONT = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', 21)
BG = (254, 254, 254)
ROJO, NARANJO = (220, 38, 38), (234, 88, 12)

def borde_nervio(y):          # contorno izquierdo del ramo que baja, junto al tendón
    return 436.2 - 0.37 * (y - 370)

CONT_N = (180, 118, 55)       # contorno del nervio
CONT_T = (190, 137, 153)      # borde del tendón

def mezcla(c, d, t):
    return tuple(int(c[k] * (1 - t) + d[k] * t) for k in range(3))

def cortar_tendon(px, ox=0, oy=0, fondo=BG, alfa=False, nervio=True):
    """El tendón termina en un extremo redondeado (x ≈ 414) y queda fondo hasta el nervio."""
    for y in range(352, 418):
        q = (y - 385) / 24
        cap = 406 + 8 * (1 - q * q) ** .5 if abs(q) < 1 else 0
        xo = borde_nervio(y)
        for x in range(392, int(xo) + 2):
            X, Y = x - ox, y - oy
            if not (0 <= X < W_ and 0 <= Y < H_): continue
            c = px[X, Y]
            if x >= xo - 1 or (nervio and y < 386 and x > 418): continue
            dd = x - cap                                             # >0 fuera del extremo
            if dd < -2: continue
            if dd < 0:
                if alfa: continue
                px[X, Y] = mezcla(c, CONT_T, .55 if dd > -1.5 else .25)
            else:
                if alfa:
                    px[X, Y] = c[:3] + (0,)
                else:
                    px[X, Y] = mezcla(CONT_T, fondo, min(1, .45 + dd / 2)) if dd < 1.2 else fondo


CURVA = [(457, 350), (450, 356), (443, 363), (438, 370), (434.5, 377), (432.5, 383), (431, 387)]

def dist_seg(p, a, b):
    ax, ay = a; bx, by = b; px_, py_ = p
    dx, dy = bx - ax, by - ay
    t = max(0, min(1, ((px_ - ax) * dx + (py_ - ay) * dy) / (dx * dx + dy * dy)))
    return ((px_ - ax - t * dx) ** 2 + (py_ - ay - t * dy) ** 2) ** .5, ax + t * dx

def contorno_nervio(px):
    """Redibuja el borde del ramo que baja donde antes se unía el tendón."""
    for y in range(348, 388):
        for x in range(418, 462):
            c = px[x, y]
            d, xm = min(dist_seg((x, y), CURVA[i], CURVA[i + 1]) for i in range(len(CURVA) - 1))
            # ¿a qué lado de la curva? (x de la curva en esta fila)
            xc = next((CURVA[i][0] + (y - CURVA[i][1]) * (CURVA[i + 1][0] - CURVA[i][0]) / (CURVA[i + 1][1] - CURVA[i][1])
                       for i in range(len(CURVA) - 1) if CURVA[i][1] <= y <= CURVA[i + 1][1]), None)
            if xc is None: continue
            if d < 1.4:
                px[x, y] = mezcla(c, CONT_N, 1 if d < .7 else .6)
            elif x < xc:
                if y < 386: px[x, y] = BG
            elif d < 4 and not (c[0] > 235 and c[1] > 190 and c[2] < 170):
                px[x, y] = (251, 210, 140)

def rotulo(img, xy, txt, color):
    d = ImageDraw.Draw(img)
    x, y = xy
    w = d.textlength(txt, font=FONT)
    d.rounded_rectangle([x, y, x + w + 24, y + 34], radius=17, fill=(255, 255, 255), outline=color, width=3)
    d.text((x + 12, y + 17), txt, font=FONT, fill=color, anchor='lm')

# Esquema base (niveles III-V)
im = Image.open(SRC / 'esquema-base.jpg').convert('RGB')
W_, H_ = im.size
cortar_tendon(im.load())
contorno_nervio(im.load())
rotulo(im, (22, 262), 'Extensor (cuádriceps)', ROJO)
rotulo(im, (40, 712), 'Flexor (isquiotibiales)', NARANJO)
im.save(IMG / 'esquema-base.jpg', quality=88)

# Tablero con huecos (nivel II): el hueco del extensor termina antes del nervio
im = Image.open(SRC / 'tablero-huecos.jpg').convert('RGB')
px = im.load()
for y in range(356, 414):
    for x in range(410, 437):
        r, g, b = px[x, y]
        if x < borde_nervio(y) + 1 and (b > r + 3 or abs(r - g) > 12):   # lila del hueco o trazo punteado
            px[x, y] = BG
d = ImageDraw.Draw(im)
DASH = (124, 92, 230)
import math
pts = [(408 + 8 * math.sin(math.pi * k / 20), 362 + 46 * k / 20) for k in range(21)]
d.polygon([(400, 362)] + pts + [(400, 408)], fill=(246, 243, 252))
for k in range(0, 20, 3):
    d.line(pts[k:k + 2], fill=DASH, width=3)
im.save(IMG / 'tablero-huecos.jpg', quality=88)

# Pieza del extensor: sin el extremo del tendón y con su rótulo (aparece al encajarla)
caja = (round(0.0117 * 1152), round(0.3955 * 768))
pz = Image.open(SRC / 'musculo-extensor.webp').convert('RGBA')
W_, H_ = pz.size
cortar_tendon(pz.load(), *caja, alfa=True, nervio=False)
rotulo(pz, (28, 66), 'Extensor', ROJO)
pz.save(IMG / 'piezas' / 'musculo-extensor.webp', quality=90)

pz = Image.open(SRC / 'musculo-flexor.webp').convert('RGBA')
rotulo(pz, (120, 120), 'Flexor', NARANJO)
pz.save(IMG / 'piezas' / 'musculo-flexor.webp', quality=90)
