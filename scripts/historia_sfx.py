"""Efeitos do vídeo "Toda casa guarda uma história" (33 s): porta de enrolar do baú, carimbos, encaixes.
Gera public/historia/sfx.wav. Os tempos seguem src/historia/Historia.jsx.
Uso: python3 scripts/historia_sfx.py"""
import numpy as np, wave, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import diego_sfx as K
SR = K.SR; DUR = 33.0; N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)
def put(sig, t, gain, pan=0.0):
    global L, R
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] / (np.abs(sig).max() + 1e-9) * gain
    L[i:i + len(sig)] += sig * np.cos((pan + 1) * np.pi / 4); R[i:i + len(sig)] += sig * np.sin((pan + 1) * np.pi / 4)
def door(d=0.38, down=True):
    """porta de enrolar: sequência rápida de estalos metálicos + rolamento grave"""
    n = int(d * SR); out = np.zeros(n); t = np.arange(n) / SR
    k = 0; tt = 0.0
    while tt < d - 0.02:
        i = int(tt * SR); m = int(0.012 * SR)
        click = K.band(rng.standard_normal(m), 3200 + 600 * rng.random(), 0.6) * np.exp(-np.arange(m) / (0.003 * SR))
        out[i:i + m] += click[: max(0, min(m, n - i))] * (0.6 + 0.4 * rng.random())
        k += 1; tt += 0.022 + 0.006 * rng.random()
    rum = K.band(rng.standard_normal(n), 180, 0.8) * np.sin(np.pi * t / d) * 0.6
    return out + rum
E = [
    (0.0, K.air(0.6, 500, 2600, 0.6), .05, 0),
    (1.5, K.shimmer(0.9, 74), .03, 0),                                    # HISTÓRIA
    (2.25, K.air(0.4, 1200, 3800), .05, 0),                               # passagem para os objetos
    (2.55, K.glass(2349, .6), .025, -.3), (3.95, K.glass(2637, .6), .025, .3), (5.6, K.glass(2960, .6), .025, 0),
    (9.3, K.thump(120, 62, .3), .05, -.3), (9.9, K.thump(125, 64, .3), .05, 0), (10.5, K.thump(130, 66, .3), .05, .3),  # capas
    (10.95, door(0.36), .10, 0), (11.3, K.thump(90, 50, .35), .07, 0), (11.32, door(0.32), .08, 0),                     # porta 1
    (11.92, K.thump(150, 80, .22), .07, -.2), (12.32, K.thump(150, 80, .22), .07, .2), (12.56, K.thump(140, 72, .25), .08, 0),  # ITEM POR ITEM
    (13.34, K.blip(1568, .12, 1.3), .035, 0), (13.96, K.thump(120, 60, .3), .06, 0),
    (14.75, K.air(0.5, 3600, 800, 0.4), .07, 0),                          # faixa azul
    (17.12, K.sub_hit(1.2), .10, 0), (18.18, K.air(0.6, 700, 3200, 0.6), .05, -.5), (19.62, K.air(0.6, 700, 3200, 0.6), .05, .5),
    (20.45, door(0.33), .09, 0), (20.78, K.thump(90, 50, .3), .06, 0), (20.8, door(0.3), .07, 0),                         # porta 2
    (22.12, K.thump(160, 90, .18), .05, -.3), (22.3, K.thump(160, 90, .18), .05, .3), (22.66, K.thump(160, 90, .18), .05, -.2), (22.88, K.thump(160, 90, .18), .05, .2),
    (23.4, door(0.44), .11, 0), (23.84, K.thump(80, 45, .5), .09, 0), (23.86, K.chime(1046, 1568), .05, 0),             # porta fecha, marca
    (24.0, K.shimmer(1.2, 72), .03, 0), (28.05, K.blip(1568, .14, 1.4), .04, -.2), (28.25, K.blip(1760, .14, 1.4), .04, .2),
]
for t0, s, g, p in E: put(s, t0, g, p)
L = L + 0.3 * K.reverb(L, 7); R = R + 0.3 * K.reverb(R, 8)
mix = np.stack([L, R], 1); mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.1) * 0.22
fade = np.ones(N); fade[-SR:] = np.linspace(1, 0, SR); mix *= fade[:, None]
out = os.path.join(os.path.dirname(__file__), "..", "public", "historia", "sfx.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", out, len(E), "efeitos")
