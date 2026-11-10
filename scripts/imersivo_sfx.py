"""Efeitos do vídeo imersivo (32 s), com os mesmos timbres "premium UI" do filme aprovado.
Gera public/imersivo/sfx.wav. Os tempos seguem src/imersivo/Imersivo.jsx.
Uso: python3 scripts/imersivo_sfx.py"""
import numpy as np, wave, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import diego_sfx as K
SR = K.SR; DUR = 32.0; N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
def put(sig, t, gain, pan=0.0):
    global L, R
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] / (np.abs(sig).max() + 1e-9) * gain
    L[i:i + len(sig)] += sig * np.cos((pan + 1) * np.pi / 4); R[i:i + len(sig)] += sig * np.sin((pan + 1) * np.pi / 4)
E = [
    (0.75, K.air(0.9, 400, 4200, 0.5), .08, 0), (0.85, K.sub_hit(1.4), .14, 0), (0.9, K.chime(1175, 1760), .04, 0),   # corredor e leão
    (1.6, K.shimmer(1.4, 74), .03, 0),
    (3.05, K.air(0.5, 700, 3200, 0.7), .07, -.6), (3.45, K.glass(2349, .6), .03, -.3),                                # painel atendimento
    (5.45, K.air(0.5, 700, 3200, 0.7), .07, .6), (5.85, K.glass(2637, .6), .03, .3),                                  # painel embalagem
    (7.9, K.air(0.6, 600, 2800, 0.6), .06, 0), (8.45, K.chime(1568, 2349), .04, 0),                                   # vídeo da capa
    (9.4, K.thump(110, 58, .4), .05, -.2), (10.6, K.thump(120, 62, .35), .045, .2),
    (12.2, K.air(0.7, 3200, 800, 0.4), .06, .4), (13.4, K.air(0.5, 700, 3200, 0.7), .05, -.5),                         # painel sai, segue viagem
    (16.2, K.rise(1.3), .09, 0), (17.6, K.sub_hit(1.6), .17, 0), (17.62, K.chime(1175, 1760), .05, 0),                # mergulho no caminhão
    (17.8, K.blip(1760), .035, -.2), (18.6, K.blip(1976), .03, .2), (19.4, K.data(6, 1100), .03, 0),
    (19.95, K.air(0.7, 4000, 700, 0.35), .08, 0),                                                                     # saída pela tela
    (20.5, K.glass(2637, .6), .03, 0), (22.5, K.air(0.6, 600, 2400, 0.6), .05, 0),
    (23.1, K.shimmer(1.2, 74), .03, -.3), (24.0, K.glass(1760, .9), .03, 0),                                          # seu Daniel
    (27.1, K.air(0.6, 700, 3600, 0.6), .06, 0), (28.3, K.rise(1.3), .09, 0),                                          # em direção ao leão
    (29.6, K.sub_hit(1.9), .19, 0), (29.62, K.chime(1175, 1760), .06, 0), (29.9, K.shimmer(1.4, 86), .035, .3),       # marca
    (30.55, K.blip(1568, .14, 1.4), .04, -.2), (30.75, K.blip(1760, .14, 1.4), .04, .2),                              # contatos
]
for t0, s, g, p in E: put(s, t0, g, p)
L = L + 0.35 * K.reverb(L, 7); R = R + 0.35 * K.reverb(R, 8)
mix = np.stack([L, R], 1); mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.1) * 0.5
fade = np.ones(N); fade[-SR:] = np.linspace(1, 0, SR); mix *= fade[:, None]
out = os.path.join(os.path.dirname(__file__), "..", "public", "imersivo", "sfx.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", out, len(E), "efeitos")
