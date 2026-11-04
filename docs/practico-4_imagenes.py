"""Práctico 4 · sesión 15: integra las imágenes de ChatGPT (originales en img/_fuentes/, ver docs/prompts-imagenes.md §14-15).
Uso: python3 docs/practico-4_imagenes.py   (procesa lo que exista; lo que falte lo avisa)
  · img/_fuentes/reflejo-fondo-chatgpt.png  (1024 × 1024) → img/reflejo/fondo.jpg   (escena 760 × 720 a 2×: 1520 × 1440)
  · img/_fuentes/reflejo-pierna-chatgpt.png (1024 × 1024) → img/reflejo/pierna.png  (alineada con la plantilla; blanco → transparente)
  · img/_fuentes/sitios-placa-chatgpt.png   (1024 × 1024, 2 × 2) → img/cartas/<tarjeta>.png (320 px)
Después de crear fondo.jpg y pierna.jpg, agregar a sim_cfg de los dos niveles de la actividad 9 (docs/practico-4_build.py):
  "fondo": "img/reflejo/fondo.jpg", "pierna": "img/reflejo/pierna.png"."""
import pathlib
from PIL import Image

R = pathlib.Path(__file__).resolve().parent.parent
F = R / 'img' / '_fuentes'

def escena(origen, destino):
    src = F / origen
    if not src.exists():
        print('falta', src.name); return
    im = Image.open(src).convert('RGB')
    k = im.width / 1024
    im = im.crop((0, 0, im.width, round(970 * k)))          # la plantilla ocupa 1024 × 970 (760 × 720 × 1,347)
    im = im.point(lambda v: 255 if v > 240 else v)          # fondo blanco puro: no se nota el borde de la imagen
    im.resize((1520, 1440), Image.LANCZOS).save(R / destino, quality=86)
    print('ok', destino)

escena('reflejo-fondo-chatgpt.png', 'img/reflejo/fondo.jpg')

def pierna():
    """La pierna: se alinea con la plantilla (borde de arriba y de atrás de la silueta) y el blanco pasa a transparente."""
    src = F / 'reflejo-pierna-chatgpt.png'
    if not src.exists():
        print('falta', src.name); return
    im = Image.open(src).convert('RGB').resize((1024, 1024), Image.LANCZOS)
    caja = lambda x: x.convert('L').point(lambda v: 255 if v < 235 else 0).getbbox()
    a, b = caja(im), caja(Image.open(F / 'plantilla-reflejo-pierna.png').convert('RGB'))
    dx, dy = b[2] - a[2], b[1] - a[1]
    print('pierna: corrida', dx, dy)
    rgba = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    al = Image.new('L', im.size)
    al.putdata([0 if min(c) > 244 else 255 if min(c) < 225 else int((244 - min(c)) / 19 * 255) for c in im.getdata()])
    im.putalpha(al)
    rgba.paste(im, (dx, dy), im)
    rgba.crop((0, 0, 1024, 970)).resize((1520, 1440), Image.LANCZOS).save(R / 'img/reflejo/pierna.png')
    print('ok img/reflejo/pierna.png')

pierna()

# Tarjetas de la placa motora: cuadrícula 2 × 2, en el orden del prompt
PLACA = ['terminal-del-axon-motor', 'hendidura-de-la-placa', 'receptor-de-la-fibra-muscular', 'celula-de-schwann-terminal']
src = F / 'sitios-placa-chatgpt.png'
if src.exists():
    im = Image.open(src).convert('RGB')
    w, h = im.width // 2, im.height // 2
    for i, nom in enumerate(PLACA):
        x, y = (i % 2) * w, (i // 2) * h
        m = round(w * 0.04)                                  # margen blanco entre cuadros
        im.crop((x + m, y + m, x + w - m, y + h - m)).resize((320, 320), Image.LANCZOS).save(R / 'img' / 'cartas' / f'{nom}.png')
        print('ok', f'img/cartas/{nom}.png')
else:
    print('falta', src.name)
