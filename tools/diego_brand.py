# Prepara a identidade Diego Mudanças a partir do selo oficial (sem redesenhar a marca)
import numpy as np
from PIL import Image, ImageFilter
src = Image.open("diego/assets_src/logo_badge_src.png").convert("RGBA")
a = np.asarray(src).astype(np.float32)
H, W = a.shape[:2]
yy, xx = np.mgrid[0:H, 0:W]
cx, cy, r = 627, 627, 615
inside = (xx - cx) ** 2 + (yy - cy) ** 2 <= (r - 2) ** 2
rgb = a[..., :3]; al = a[..., 3:] / 255
# compõe sobre branco dentro do círculo (fundo do selo é branco levemente translúcido)
comp = rgb * al + 255 * (1 - al)
# limpa a mancha cinza no céu branco (região superior direita, fora do leão e do lettering)
mx, mn = comp.max(2), comp.min(2)
sat = (mx - mn) / np.maximum(mx, 1)
zone = (xx > 560) & (yy > 60) & (yy < 400) & inside
fix = zone & (sat < 0.12) & (mn > 120)
comp[fix] = 255
out = np.dstack([comp, np.where(inside, 255, a[..., 3])]).clip(0, 255).astype(np.uint8)
# borda externa do selo mantém a alfa original
Image.fromarray(out, "RGBA").save("diego/public/brand/badge.png")
# lettering DiEGO MUDANÇAS (azul-marinho sobre branco) -> máscara
box = (612, 396, 1200, 690)
c = comp[box[1]:box[3], box[0]:box[2]]
lum = c.mean(2)
alpha = np.clip((235 - lum) / (235 - 40), 0, 1)
alpha = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.4))
# remove componentes que tocam a borda do recorte (anel do selo, focinho do leão)
from PIL import ImageDraw
binm = alpha.point(lambda v: 255 if v > 25 else 0).convert("L")
bw, bh = binm.size
for x in range(bw):
    for y in (0, bh - 1):
        if binm.getpixel((x, y)) == 255: ImageDraw.floodfill(binm, (x, y), 0)
for y in range(bh):
    for x in (0, bw - 1):
        if binm.getpixel((x, y)) == 255: ImageDraw.floodfill(binm, (x, y), 0)
binm = binm.filter(ImageFilter.MaxFilter(5))
alpha = Image.fromarray((np.asarray(alpha).astype(np.float32) * np.asarray(binm) / 255).astype(np.uint8))
bb = alpha.point(lambda v: 255 if v > 60 else 0).getbbox()
alpha = alpha.crop((bb[0] - 4, bb[1] - 4, bb[2] + 4, bb[3] + 4))
for name, col in (("wordmark_white", (255, 255, 255)), ("wordmark_navy", (11, 24, 61))):
    im = Image.new("RGBA", alpha.size, col + (0,)); im.putalpha(alpha); im.save(f"diego/public/brand/{name}.png")
print("wordmark", alpha.size)
# leão sobre branco (para aplicar com multiply em superfícies brancas)
lbox = (55, 150, 700, 960)
lc = comp.copy()
d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
white = (d > 566) | ((xx > 612) & (yy < 576)) | ((xx > 672) & (yy < 645)) | ((xx > 684) & (yy < 668))
lc[white] = 255
# funde a base (ondas do selo) para o branco
fade = np.clip((yy - 730) / 130, 0, 1)[..., None]
lc = lc * (1 - fade) + 255 * fade
lion = Image.fromarray(lc[lbox[1]:lbox[3], lbox[0]:lbox[2]].clip(0, 255).astype(np.uint8))
lion.save("diego/public/brand/lion_on_white.png"); print("lion", lion.size)
