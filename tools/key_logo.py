# Extrai a logo do fundo navy (chave por luminância relativa ao fundo local) e gera PNG com alfa em 2x.
import sys, numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = im.size
im2 = im.resize((W*2, H*2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
a = np.asarray(im2).astype(np.float32)
V = a.max(axis=2)
# fundo local: mínimo em janela grande, suavizado
bgV = np.asarray(Image.fromarray(V.astype(np.uint8)).filter(ImageFilter.MinFilter(31)).filter(ImageFilter.GaussianBlur(25))).astype(np.float32)
bgRGB = np.stack([np.asarray(Image.fromarray(a[...,c].astype(np.uint8)).filter(ImageFilter.MinFilter(31)).filter(ImageFilter.GaussianBlur(25))).astype(np.float32) for c in range(3)], 2)
d = V - bgV
alpha = np.clip((d - float(sys.argv[3]) ) / float(sys.argv[4]), 0, 1)
alpha = alpha**0.8
fg = (a - (1-alpha[...,None])*bgRGB) / np.maximum(alpha[...,None], 1e-3)
fg = np.clip(fg, 0, 255)
out = np.dstack([fg, alpha*255]).astype(np.uint8)
img = Image.fromarray(out, "RGBA")
bb = img.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
pad = 24
bb = (max(0,bb[0]-pad), max(0,bb[1]-pad), min(img.width,bb[2]+pad), min(img.height,bb[3]+pad))
img.crop(bb).save(dst)
print(bb, img.crop(bb).size)
