"""Áudio do vídeo "Hora de descarregar": efeitos premium + cama eletrônica discreta, sem voz.
Gera public/diego/descarregar_audio.wav (estéreo 48 kHz, 10 s). Sincronizado com src/diego/Descarregar.jsx.
Uso: python3 scripts/descarregar_audio.py   (requer numpy)
"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import diego_sfx as S

SR = S.SR
DUR = 10.03
n = int(DUR * SR)
S.L[:] = 0; S.R[:] = 0
BAR = 20.12 / 8; S16 = BAR / 16

E = [
    (0.00, S.air(0.9, 500, 3200, 0.7), .06, 0),
    (0.32, S.shimmer(1.0, 74), .035, -.3),                              # logo
    (0.27, S.sub_hit(1.2), .12, 0), (0.29, S.chime(1760, 2637), .045, .2),   # HORA DE
    (0.57, S.air(0.45, 900, 4200, 0.7), .06, 0), (0.65, S.thump(110, 58, .35), .09, 0),  # DESCARREGAR
    (1.26, S.air(0.45, 3200, 900, 0.3), .05, 0),                        # sai para baixo
    (1.95, S.glass(2600, .5), .05, -.2), (1.99, S.blip(1319, .1, 1.4), .04, -.2),       # etiqueta
    (2.15, S.blip(1568, .08, 1.3), .03, .2), (2.30, S.blip(1760, .08, 1.3), .03, .2), (2.45, S.blip(1976, .1, 1.3), .035, .2),
    (4.20, S.air(1.3, 600, 5200, 0.5), .045, 0), (4.35, S.shimmer(1.3, 81), .03, .2),   # luz na plotagem
    (6.00, S.rise(0.9), .05, 0), (6.40, S.air(0.45, 3200, 900, 0.3), .05, 0),
    (6.95, S.shimmer(1.0, 74), .035, -.3),
    (7.30, S.sub_hit(1.6), .15, 0), (7.32, S.chime(1760, 2637), .05, .2),                # título final
    (7.66, S.air(0.45, 900, 4200, 0.7), .06, 0), (7.74, S.thump(110, 58, .35), .09, 0),
    (8.15, S.glass(2600, .5), .045, -.2),
]
for t0, s, g, p in E:
    S.put(s, t0, g, p)

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
CH = [[47, 54, 57, 61, 62, 66], [43, 54, 57, 59, 62, 66], [38, 54, 57, 62, 64, 66], [45, 52, 57, 62, 64, 69]]
for k in range(int(DUR / BAR) + 1):
    notes = CH[k % 4]; t0 = k * BAR
    d = BAR + 1.0
    t = np.arange(int(d * SR)) / SR
    env = np.minimum(1, t / 0.7) * np.clip((d - t) / 0.9, 0, 1)
    out = np.zeros(len(t))
    for m in [x + 12 for x in notes[1:]] + [notes[0]]:
        f = mtof(m)
        for det, ph in ((-0.003, 0.4), (0.0035, 2.2)):
            for h in range(1, 5):
                if f * h > 3000: break
                out += np.sin(2 * np.pi * f * (1 + det) * h * t + ph * h) * (0.4 ** (h - 1)) / h
    S.put(out * env / len(notes), max(0, t0 - 0.3), 0.30)
    tones = sorted(m + 12 for m in notes[1:])
    pat = [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 4, 5, 3, 2, 1, 2]
    for j in range(16):
        tt = t0 + j * S16
        if tt < 0.8 or tt > DUR - 0.4: continue
        m = tones[pat[j] % len(tones)] + (12 if j % 8 == 6 else 0)
        tk = np.arange(int(0.5 * SR)) / SR
        pl = sum(np.sin(2 * np.pi * mtof(m) * h * tk) * np.exp(-tk / (0.1 / (1 + .2 * h))) / h for h in range(1, 7))
        pl *= np.minimum(1, tk / 0.003)
        S.put(pl, tt, 0.035 * (0.6 + 0.4 * (j % 4 == 0)) * min(1, (tt - 0.8) / 0.8) * (1.5 if tt > 7.3 else 1.0), 0.35 if j % 2 else -0.35)

L = S.L[:n].copy(); R = S.R[:n].copy()
L = L + 0.35 * S.reverb(L, 7); R = R + 0.35 * S.reverb(R, 8)
mix = np.stack([L, R], 1)
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.1) * 0.20
fade = np.ones(n); fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
mix *= fade[:, None]
out = os.path.join(os.path.dirname(__file__), "..", "public", "diego", "descarregar_audio.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", out)
