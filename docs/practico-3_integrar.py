"""NeuroLab · actividad 15: integra las ilustraciones de ChatGPT (docs/prompts-imagenes.md §13).
Uso: python3 docs/practico-3_integrar.py (desde la raíz; requiere Pillow y Playwright).
- img/_fuentes/neurona-simple-chatgpt.png → img/potencial/neurona-simple.jpg (1024×1024): fondo del simulador en vista «neurona».
  Posiciones medidas (fracción del lado): soma (0,347; 0,518) r 0,124 · fin del cono 0,55 · eje del axón 0,524 → js/sim-pa.js (NEU_IMG).
- img/_fuentes/axon-refractario-chatgpt.png → img/potencial/axon-refractario.jpg (1536×1024 = vb 1200×800) con los rótulos
  (Soma, Dendritas, Segmento inicial, Nodo 1–4) y la marca del PA en el nodo 2. Nodos medidos: 330, 498, 668, 839, 1009 (y 380)."""
import os, base64, asyncio
from PIL import Image
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = lambda *p: os.path.join(RAIZ, *p)

Image.open(F('img/_fuentes/neurona-simple-chatgpt.png')).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(F('img/potencial/neurona-simple.jpg'), quality=86)

FONT = "font-family=\"'Segoe UI', Arial, sans-serif\""
def txt(x, y, t, size=24, col='#4C1D95', w=800):
    return (f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{w}" fill="{col}" text-anchor="middle" {FONT} '
            f'stroke="#FFFDF8" stroke-width="6" paint-order="stroke" stroke-linejoin="round">{t}</text>')
NODOS = [330, 498, 668, 839, 1009]
b64 = base64.b64encode(open(F('img/_fuentes/axon-refractario-chatgpt.png'), 'rb').read()).decode()
s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1536" height="1024">'
     f'<image href="data:image/png;base64,{b64}" x="0" y="0" width="1200" height="800"/>')
s += txt(170, 300, 'Soma') + txt(70, 600, 'Dendritas', 22)
# el primer tramo sin mielina es el segmento inicial (no un nodo): los nodos de Ranvier son los 4 espacios entre vainas
s += txt(NODOS[0], 446, 'Segmento inicial', 18, '#334155', 700) + ''.join(txt(x, 446, f'Nodo {i + 1}', 20, '#334155', 700) for i, x in enumerate(NODOS[1:]))
s += f'<circle cx="{NODOS[2]}" cy="380" r="34" fill="rgba(245,158,11,.35)" stroke="#F59E0B" stroke-width="4"/>' + txt(NODOS[2], 322, 'PA', 28, '#B45309', 900)
s += '</svg>'
tmp = F('img/_fuentes/_axon-compuesto.svg'); open(tmp, 'w').write(s)
async def foto():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1536, 'height': 1024})
        await pg.goto('file://' + tmp); png = F('img/_fuentes/_axon-compuesto.png'); await pg.screenshot(path=png); await b.close()
        Image.open(png).convert('RGB').save(F('img/potencial/axon-refractario.jpg'), quality=86)
        os.remove(png)
asyncio.run(foto()); os.remove(tmp)
print('ok')
