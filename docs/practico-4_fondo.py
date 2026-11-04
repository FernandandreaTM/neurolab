"""Fondo ilustrado del simulador de la sinapsis: recorta la imagen de ChatGPT a la zona (700 × 720, guardada a 1,5×)
y hace la versión sin astrocito (acetilcolina). Uso: python3 docs/practico-4_fondo.py <sinapsis-fondo-chatgpt.png>"""
import sys, pathlib
import numpy as np, cv2
from PIL import Image
OUT = pathlib.Path(__file__).resolve().parent.parent / 'img' / 'sinapsis'
im = Image.open(sys.argv[1]).convert('RGB')
k = im.width / 1024                                  # la plantilla era 1024 = zona × 1,4222 + 14 px a la izquierda
c = im.crop((round(14 * k), 0, round((700 * 1.42222 + 14) * k), im.height)).resize((1050, 1080), Image.LANCZOS)
c.save(OUT / 'fondo.jpg', quality=86, optimize=True)
a = np.array(c)
r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
mask = ((g - b > 6) & (g - r > 10)).astype(np.uint8) * 255   # verde del astrocito (el fondo es celeste: b > g)
mask[:, 380:] = 0
mask = cv2.dilate(mask, np.ones((9, 9), np.uint8), iterations=2)
sin = cv2.inpaint(cv2.cvtColor(a, cv2.COLOR_RGB2BGR), mask, 9, cv2.INPAINT_TELEA)
Image.fromarray(cv2.cvtColor(sin, cv2.COLOR_BGR2RGB)).save(OUT / 'fondo-sin-astrocito.jpg', quality=86, optimize=True)
print('ok', c.size, int(mask.sum() / 255), 'px de astrocito')
