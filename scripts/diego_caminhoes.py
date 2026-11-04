"""Aplica a nova logo (logo_diego.png) nos caminhões da foto, substituindo o
emblema antigo (caminhão + "Transporte com segurança e qualidade").
Entrada: public/diego/caminhoes_foto_original.jpg  Saída: public/diego/caminhoes.jpg"""
import numpy as np
from PIL import Image, ImageFilter
D = "public/diego/"
im = np.asarray(Image.open(D + "caminhoes_foto_original.jpg").convert("RGB")).astype(float)
logo = Image.open(D + "logo_diego.png").convert("RGB")

def clean(x0, y0, x1, y1, sx0, sx1):
    """apaga o emblema: pixels não azuis viram o tom claro do adesivo (mediana por linha)."""
    for y in range(y0, y1):
        row = im[y, sx0:sx1]
        r, g, b = row[:, 0], row[:, 1], row[:, 2]
        light = (r > 170) & (b - r < 40)
        base = np.median(row[light], 0) if light.sum() > 5 else np.array([228, 230, 236.0])
        seg = im[y, x0:x1]
        blue = (seg[:, 2] - seg[:, 0] > 70) & (seg[:, 0] < 120)
        seg[~blue] = base + np.random.default_rng(y).normal(0, 1.5, (int((~blue).sum()), 3))
        im[y, x0:x1] = seg

def stamp(box, w, h):
    """aplica a logo como impressão (multiplicação), sem alterar suas cores em fundo branco."""
    x, y = box
    L = np.asarray(logo.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.5))).astype(float) / 255
    reg = im[y:y + h, x:x + w]
    blue = (reg[:, :, 2] - reg[:, :, 0] > 70) & (reg[:, :, 0] < 120)
    out = reg * L
    reg[~blue] = out[~blue]
    im[y:y + h, x:x + w] = reg

clean(549, 182, 645, 272, 545, 700)     # caminhão esquerdo
stamp((558, 186), 78, 78)
clean(1148, 226, 1192, 294, 1140, 1215) # caminhão direito (lateral em perspectiva)
stamp((1153, 230), 36, 62)
out = Image.fromarray(np.clip(im, 0, 255).astype("uint8"))
out.save(D + "caminhoes.jpg", quality=94)
print("ok")
