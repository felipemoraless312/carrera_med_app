# Uso: procesar_logo.py <entrada> <salida.webp> <logo|redondo|circular>
# logo: recorta al contenido y lo centra en un cuadro blanco de 512 de forma que quepa en el círculo
# redondo: logo con forma redonda u ovalada sobre fondo blanco; se agranda hasta casi llenar el círculo
# circular: el logo ya es un círculo; recorta a su borde para que llene el círculo
import sys
from PIL import Image, ImageChops
src, dst, modo = sys.argv[1:4]
SIZE = 512
im = Image.open(src)
# Los PNG con transparencia se ponen sobre fondo blanco
if im.mode in ('RGBA', 'LA', 'P'):
    im = im.convert('RGBA')
    fondo = Image.new('RGBA', im.size, 'white')
    im = Image.alpha_composite(fondo, im)
im = im.convert('RGB')
if modo != 'circular':
    # Quita líneas finas en las orillas (bordes de capturas de WhatsApp)
    m = max(2, round(min(im.size) * 0.01))
    im = im.crop((m, m, im.width - m, im.height - m))
# Contenido = píxeles claramente no blancos/grises claros
g = im.convert('L').point(lambda v: 255 if v < 215 else 0)
sat = ImageChops.difference(im.getchannel('R'), im.getchannel('B')).point(lambda v: 255 if v > 40 else 0)
mask = ImageChops.lighter(g, sat)
bbox = mask.getbbox()
im = im.crop(bbox)
w, h = im.size
if modo == 'circular':
    side = max(w, h)
    lienzo = Image.new('RGB', (side, side), 'white')
    lienzo.paste(im, ((side - w) // 2, (side - h) // 2))
    out = lienzo.resize((SIZE, SIZE), Image.LANCZOS)
else:
    # Escala para que la diagonal del contenido quede dentro del círculo con margen
    diag = max(w, h) * 1.04 if modo == 'redondo' else (w * w + h * h) ** 0.5
    escala = (SIZE * 0.90) / diag
    im = im.resize((max(1, round(w * escala)), max(1, round(h * escala))), Image.LANCZOS)
    out = Image.new('RGB', (SIZE, SIZE), 'white')
    out.paste(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2))
out.save(dst, 'WEBP', quality=90)
print(dst, bbox, out.size)
