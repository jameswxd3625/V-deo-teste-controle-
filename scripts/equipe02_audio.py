"""Áudio do vídeo "Equipe 02 em execução": efeitos premium (mesma paleta do filme) + pad e arpejo
eletrônicos bem baixos. Sem voz. Gera public/diego/equipe02_audio.wav (estéreo 48 kHz, 20 s).
Uso: python3 scripts/equipe02_audio.py   (requer numpy)
"""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import diego_sfx as S

SR = S.SR
DUR = 20.04
n = int(DUR * SR)
S.L[:] = 0; S.R[:] = 0
rng = np.random.default_rng(21)
BAR = 20.12 / 8; BEAT = BAR / 4; S16 = BEAT / 4

# ---------- efeitos sincronizados com src/diego/Equipe02.jsx ----------
E = [
    (0.00, S.air(1.0, 500, 3200, 0.7), .06, 0),                 # abertura da tomada
    (0.50, S.shimmer(1.0, 74), .035, -.3),                       # logo
    (0.60, S.sub_hit(1.2), .12, 0), (0.62, S.chime(1760, 2637), .045, .2),    # EQUIPE
    (0.92, S.blip(1760, .12, 1.3), .05, .2),                     # 02
    (1.40, S.glass(2600, .5), .05, -.2), (1.44, S.blip(1319, .1, 1.4), .04, -.2),  # EM EXECUÇÃO
    (1.60, S.blip(1976, .1, 1.3), .035, .3),                     # marcação no caminhão
    (2.60, S.sweep(1.7, 500, 5000, 0.5) * (np.arange(int(1.7 * SR)) / (1.7 * SR)) ** 2, .05, 0),  # subida do drone
    (3.95, S.air(0.4, 3200, 1000, 0.3), .045, 0),                # sai fase A
    (4.40, S.air(0.3, 1200, 3800), .04, .3),                     # NO BAIRRO
    (4.60, S.air(0.45, 900, 4200, 0.7), .06, 0), (4.68, S.thump(110, 58, .35), .09, 0),   # PAQUETÁ
    (5.20, S.chime(1568, 2349), .045, 0), (5.22, S.blip(1976, .12, 1.3), .045, .3),        # BELO HORIZONTE
    (9.20, S.rise(1.0), .05, 0), (9.60, S.air(0.45, 3200, 900, 0.3), .05, 0),
    (10.30, S.sub_hit(1.6), .15, 0), (10.32, S.chime(1760, 2637), .05, .2),   # mensagem final
    (10.80, S.glass(2600, .5), .05, -.2), (10.84, S.blip(1319, .1, 1.4), .04, -.2),
    (11.60, S.air(0.3, 1200, 3800), .04, .3), (11.85, S.air(0.45, 900, 4200, 0.7), .06, 0),
    (11.92, S.thump(110, 58, .35), .09, 0), (12.50, S.chime(1568, 2349), .05, 0), (12.52, S.blip(1976, .12, 1.3), .045, .3),
    (13.2, S.shimmer(1.6, 81), .03, .2),
]
for t0, s, g, p in E:
    S.put(s, t0, g, p)

# ---------- cama eletrônica (pad + arpejo), bem no fundo ----------
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
CH = [[47, 54, 57, 61, 62, 66], [43, 54, 57, 59, 62, 66], [38, 54, 57, 62, 64, 66], [45, 52, 57, 62, 64, 69]]
for k in range(int(DUR / BAR) + 1):
    notes = CH[k % 4]
    t0 = k * BAR
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
    if t0 + BAR > 0.9:
        tones = sorted(m + 12 for m in notes[1:])
        pat = [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 4, 5, 3, 2, 1, 2]
        for j in range(16):
            tt = t0 + j * S16
            if tt < 1.0 or tt > DUR - 0.5: continue
            m = tones[pat[j] % len(tones)] + (12 if j % 8 == 6 else 0)
            tk = np.arange(int(0.5 * SR)) / SR
            pl = sum(np.sin(2 * np.pi * mtof(m) * h * tk) * np.exp(-tk / (0.1 / (1 + .2 * h))) / h for h in range(1, 7))
            pl *= np.minimum(1, tk / 0.003)
            S.put(pl, tt, 0.035 * (0.6 + 0.4 * (j % 4 == 0)) * min(1, (tt - 1.0) / 1.0) * (1.5 if tt > 10.3 else 1.0), 0.35 if j % 2 else -0.35)

L = S.L[:n].copy(); R = S.R[:n].copy()
L = L + 0.35 * S.reverb(L, 7); R = R + 0.35 * S.reverb(R, 8)
mix = np.stack([L, R], 1)
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.1) * 0.20
fade = np.ones(n); fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
mix *= fade[:, None]
out = os.path.join(os.path.dirname(__file__), "..", "public", "diego", "equipe02_audio.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", out)
