"""Separa a logo quadrada (logo_diego.png) em camadas sem fundo branco:
- logo_letreiro.png: lettering "DiEGO MUDANÇAS" (versão negativa, branca) com transparência
- logo_ondas.png: ondas azuis/ciano/brancas com transparência
O leão vem de leao.png (mesma arte), alinhado à logo: escala 0.825, deslocamento (-240, 23) em px da logo 1254.
"""
import json, numpy as np
from PIL import Image, ImageFilter
D = "public/diego/"
im = np.asarray(Image.open(D + "logo_diego.png").convert("RGB")).astype(float)
Hh, Ww = im.shape[:2]
lum = im.mean(2)
sat = im.max(2) - im.min(2)

# ---- letreiro: pixels escuros na área do texto
X0, Y0, X1, Y1 = 600, 300, 1254, 660
reg = lum[Y0:Y1, X0:X1]
a = np.clip((232 - reg) / (232 - 70), 0, 1)
xx = np.arange(X0, X1)[None, :]; yy = np.arange(Y0, Y1)[:, None]
a[(xx < 700) & (yy > 528)] = 0   # nariz do leão
a[:, :18] = 0
blue = (im[Y0:Y1, X0:X1, 2] - im[Y0:Y1, X0:X1, 0]) > 90
a[blue & (reg > 60)] = 0
let = np.zeros((Y1 - Y0, X1 - X0, 4), "uint8"); let[..., :3] = 255; let[..., 3] = (a * 255).astype("uint8")
Image.fromarray(let).save(D + "logo_letreiro.png")

# ---- ondas: tudo abaixo do contorno superior das faixas
env = np.zeros(Ww, int)
for x in range(Ww):
    col = im[:, x]
    if x >= 640:
        ys = np.where((sat[640:, x] > 45) & (lum[640:, x] < 235))[0]
        env[x] = 640 + ys[0] if len(ys) else Hh
    else:
        ys = np.where((lum[860:, x] > 222) & (sat[860:, x] < 40))[0]
        env[x] = 860 + ys[0] if len(ys) else Hh
# junção entre a faixa branca (esquerda) e as faixas coloridas (direita)
for x in range(440, 700):
    colored = 997 + (680 - x) * 0.42
    white = 1104 + (x - 440) * 0.2
    env[x] = int(min(colored, white))
# suaviza o contorno
k = 25; e = np.convolve(np.pad(env.astype(float), k, mode="edge"), np.ones(2 * k + 1) / (2 * k + 1), "same")[k:-k]
yy = np.arange(Hh)[:, None]
alpha = np.clip(yy - e[None, :] + 1.0, 0, 1)
# esmaecimento nas bordas do quadrado para fundir com o fundo do vídeo
xs = np.arange(Ww)[None, :]
fade = np.clip(np.minimum(xs / 90, (Ww - 1 - xs) / 90), 0, 1) * np.clip((Hh - 1 - yy) / 70, 0, 1)
# fundo branco remanescente perto da ponta das faixas
wt = (1104 + (np.arange(Ww) - 440) * 0.2)[None, :]
bgw = (lum > 226) & (sat < 32) & (yy < wt - 24) & (xs >= 430) & (xs < 700)
alpha[bgw] = 0
alpha = alpha * fade
top = int(e.min()) - 4
ond = np.zeros((Hh - top, Ww, 4), "uint8")
ond[..., :3] = im[top:].astype("uint8"); ond[..., 3] = (alpha[top:] * 255).astype("uint8")
Image.fromarray(ond).save(D + "logo_ondas.png")
json.dump({"size": 1254, "letreiro": [X0, Y0], "ondas_top": top, "leao": {"s": 0.825, "x": -240, "y": 23}},
          open("src/diego/logo_layout.json", "w"))
print("ok", top)
