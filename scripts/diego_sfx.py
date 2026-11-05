"""Efeitos sonoros "premium UI" para o filme Diego Mudanças: ar curto e limpo, toques de vidro,
bipes digitais, impactos graves suaves e brilhos. Poucos eventos, discretos, com espaço (reverb).
Gera public/diego/sfx.wav (estéreo 48 kHz). Os tempos seguem src/diego/Diego.jsx.
Uso: python3 scripts/diego_sfx.py   (requer numpy)
"""
import numpy as np, wave, os

SR = 48000
DUR = 62.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)


def put(sig, t, gain, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] / (np.abs(sig).max() + 1e-9) * gain
    L[i:i + len(sig)] += sig * np.cos((pan + 1) * np.pi / 4)
    R[i:i + len(sig)] += sig * np.sin((pan + 1) * np.pi / 4)


def tt_(d): return np.arange(int(d * SR)) / SR


def band(x, fc, oct_w=1.0):
    """filtro passa-banda suave (gaussiano em oitavas) via FFT."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= np.exp(-((np.log2(f + 1) - np.log2(fc)) ** 2) / (2 * oct_w ** 2))
    return np.fft.irfft(X, len(x))


def sweep(d, f0, f1, oct_w=0.7):
    """ruído com banda que desliza de f0 a f1 (STFT)."""
    n = int(d * SR); W = 1024; H = 256
    x = rng.standard_normal(n + W)
    out = np.zeros(n + W); win = np.hanning(W)
    f = np.fft.rfftfreq(W, 1 / SR)
    frames = range(0, n, H)
    for k, i in enumerate(frames):
        p = i / max(1, n - 1)
        fc = f0 * (f1 / f0) ** p
        S = np.fft.rfft(x[i:i + W] * win) * np.exp(-((np.log2(f + 1) - np.log2(fc)) ** 2) / (2 * oct_w ** 2))
        out[i:i + W] += np.fft.irfft(S, W) * win
    return out[:n]


def env(d, peak=0.5, a_curve=2.0, r_curve=2.5):
    t = tt_(d); p = t / d
    return np.where(p < peak, (p / peak) ** a_curve, ((1 - p) / (1 - peak)) ** r_curve)


# ---------- paleta ----------
def air(d=0.45, f0=900, f1=4200, peak=0.55):          # passagem de ar curta e limpa
    return sweep(d, f0, f1) * env(d, peak)


def glass(f=2600, d=0.7):                              # toque de vidro
    t = tt_(d)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / dc) for r, a, dc in ((1, 1, .32), (2.76, .35, .12), (5.4, .12, .05)))
    return s * np.minimum(1, t / 0.002)


def chime(f=1760, f2=2637):
    a = glass(f, 0.9); b = glass(f2, 0.9)
    out = np.zeros(len(a) + int(0.07 * SR)); out[:len(a)] += a; out[int(0.07 * SR):] += 0.8 * b
    return out


def blip(f=1500, d=0.12, up=1.25):                     # bipe digital
    t = tt_(d)
    fr = f * (1 + (up - 1) * np.minimum(1, t / 0.025))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.035) * np.minimum(1, t / 0.0015)


def thump(f0=110, f1=58, d=0.35):                      # impacto grave suave
    t = tt_(d)
    fr = f1 + (f0 - f1) * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.09)
    click = band(rng.standard_normal(len(t)), 2500, 0.8) * np.exp(-t / 0.004) * 0.15
    return body + click


def sub_hit(d=1.6):                                    # assinatura: grave + ar brilhante
    t = tt_(d)
    fr = 38 + 34 * np.exp(-t / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.45) * np.minimum(1, t / 0.005)
    sheen = band(rng.standard_normal(len(t)), 7000, 0.6) * np.exp(-t / 0.35) * 0.18
    return boom + sheen


def shimmer(d=1.2, base=74):                           # brilho de luz (parciais agudas com tremolo)
    t = tt_(d); out = np.zeros(len(t))
    for k, m in enumerate((base, base + 7, base + 12, base + 16, base + 19)):
        f = 440 * 2 ** ((m - 69) / 12)
        trem = 0.6 + 0.4 * np.sin(2 * np.pi * (9 + 3 * k) * t + k)
        out += np.sin(2 * np.pi * f * t) * trem / (1 + k * 0.4)
    return out * env(d, 0.35, 1.5, 2.0)


def rise(d=0.9):                                       # subida antes de uma revelação
    return sweep(d, 600, 7000, 0.5) * (tt_(d) / d) ** 2.2


def paper(d=0.32):                                     # página, curta e limpa
    t = tt_(d)
    grains = np.convolve((rng.random(len(t)) < 0.003).astype(float), np.hanning(48), "same")
    return band(rng.standard_normal(len(t)) * (0.6 + grains), 3000, 0.8) * env(d, 0.35, 1.5, 2.0)


def data(n=7, f=1200, step=0.055):                     # sequência digital ascendente
    out = np.zeros(int((n * step + 0.2) * SR))
    for k in range(n):
        b = blip(f * 2 ** (k / 12 * 2), 0.09); i = int(k * step * SR)
        out[i:i + len(b)] += b * (0.5 + 0.5 * k / n)
    return out


# espaço comum (reverb curto e escuro)
def reverb(x, seed, dec=0.55, dur=1.8):
    n = int(dur * SR); t = np.arange(n) / SR
    ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-t / dec)
    ir = np.convolve(ir, np.ones(11) / 11, "same"); ir /= np.sqrt((ir ** 2).sum())
    m = len(x) + n
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]

def main():
    global L, R
    E = []
    # cena 1
    E += [(1.02, air(0.5, 700, 3600, 0.75), .10, 0), (1.86, sub_hit(1.2), .16, 0), (1.88, chime(1760, 2637), .05, .2),
          (2.6, air(0.4, 3000, 1200, 0.3), .05, 0), (4.35, air(0.55, 600, 2600, 0.7), .07, 0)]
    # cena 2 — caixas, lista, objetos
    E += [(5.98, thump(120, 60), .14, -.3), (6.16, thump(130, 66), .12, .3), (6.38, thump(140, 72), .10, 0),
          (6.75, glass(2600, .5), .05, .3), (7.1, air(0.35, 1200, 3800), .05, .4), (8.1, glass(2900, .5), .05, .3),
          (8.6, air(0.35, 1200, 3800), .05, .4), (9.75, glass(3100, .5), .05, .3), (10.08, air(0.35, 1200, 3800), .05, .4),
          (11.86, chime(2093, 3136), .07, 0), (11.86, thump(90, 50, .5), .09, 0), (12.4, air(0.7, 3200, 700, 0.45), .09, 0)]
    # cena 3 — Paulo
    E += [(12.95, shimmer(0.9, 74), .035, -.2), (13.86, sub_hit(1.0), .10, 0), (13.9, glass(1760, .8), .035, 0),
          (14.95, thump(120, 62), .07, -.4), (15.12, thump(130, 66), .06, .4), (16.05, air(0.6, 800, 2800, 0.7), .05, .3)]
    # cena 4 — álbum
    E += [(19.72, paper(0.45), .08, -.1), (22.82, paper(0.38), .09, .1), (23.02, glass(2349, .5), .035, -.2),
          (23.58, air(0.4, 900, 4200, 0.7), .04, 0), (24.32, glass(2637, .5), .035, .2), (24.98, air(0.35, 1200, 3800), .035, .4),
          (25.87, glass(2960, .5), .035, -.1), (27.32, air(0.4, 900, 4200, 0.7), .04, 0), (28.55, paper(0.3), .06, 0),
          (29.18, thump(100, 55, .4), .07, 0), (29.85, air(0.55, 500, 2000, 0.6), .05, 0), (30.42, chime(1568, 2349), .045, 0),
          (30.8, air(0.9, 400, 5000, 0.5), .10, 0)]
    # cena 5 — leão e marca
    E += [(31.5, shimmer(1.6, 74), .045, -.4), (33.4, air(0.4, 1200, 3800), .035, .4), (34.3, rise(0.86), .08, 0),
          (35.16, sub_hit(1.8), .18, 0), (35.18, chime(1175, 1760), .06, 0), (35.55, shimmer(1.2, 86), .03, .3)]
    # cena 6 — caminhões e trabalho
    E += [(36.4, air(0.55, 4000, 900, 0.35), .07, 0), (38.05, air(0.35, 1000, 3600), .04, .5), (38.6, blip(1760), .04, -.2),
          (38.95, air(0.35, 1000, 3600), .04, .5), (39.5, blip(1976), .04, -.2), (40.3, air(0.45, 3500, 900, 0.3), .05, 0)]
    # cena 7 — trajeto
    E += [(40.9, blip(1319, .14, 1.5), .06, -.4), (40.95, thump(140, 80, .25), .05, -.4), (41.88, blip(1760), .035, -.4),
          (42.64, data(8, 990), .04, 0), (43.15, blip(1568, .14, 1.5), .06, .4), (43.2, thump(140, 80, .25), .05, .4),
          (43.9, blip(1760), .03, -.2), (44.1, blip(2093), .03, 0), (44.3, blip(2349), .03, .2), (44.85, rise(0.7), .06, 0)]
    # cena 8 — nova casa
    E += [(45.0, air(0.6, 600, 3000, 0.5), .06, 0), (45.1, shimmer(0.9, 74), .03, -.4), (46.15, thump(100, 55, .4), .06, 0),
          (47.28, air(0.4, 900, 4200, 0.7), .035, 0), (49.0, paper(0.45), .08, -.1), (49.55, air(0.35, 1200, 3800), .035, .4),
          (51.52, thump(150, 70, .3), .07, 0), (51.54, blip(1760, .14, 1.33), .05, 0), (52.36, air(0.4, 900, 4200, 0.7), .035, 0),
          (54.4, rise(0.8), .06, 0)]
    # cena 9 — assinatura e convite
    E += [(54.75, air(1.0, 400, 5000, 0.5), .09, 0), (55.28, sub_hit(1.8), .18, 0), (55.3, chime(1175, 1760), .06, 0),
          (57.0, shimmer(1.0, 86), .03, -.3), (58.62, chime(2093, 3136), .05, 0), (58.64, thump(150, 80, .25), .05, 0)]

    for t0, s, g, p in E:
        put(s, t0, g, p)

    L = L + 0.35 * reverb(L, 7); R = R + 0.35 * reverb(R, 8)

    mix = np.stack([L, R], 1)
    mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.1) * 0.16  # efeitos discretos
    fade = np.ones(N); fade[-SR:] = np.linspace(1, 0, SR)
    mix *= fade[:, None]
    out = os.path.join(os.path.dirname(__file__), "..", "public", "diego", "sfx.wav")
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype("<i2").tobytes())
    print("ok", out, len(E), "efeitos")

if __name__ == "__main__":
    main()
