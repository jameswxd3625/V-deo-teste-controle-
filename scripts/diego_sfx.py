"""Efeitos e ambiência sintetizados (sem música) para o filme Diego Mudanças.
Gera public/diego/sfx.wav (estéreo 48 kHz). Os tempos seguem src/diego/Diego.jsx.
Uso: python3 scripts/diego_sfx.py
"""
import numpy as np, wave, os

SR = 48000
DUR = 62.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)


def noise(d, color="white"):
    n = int(SR * d)
    x = rng.standard_normal(n)
    if color == "pink":
        f = np.fft.rfft(x); k = np.arange(len(f)); k[0] = 1
        x = np.fft.irfft(f / np.sqrt(k), n)
    elif color == "brown":
        x = np.cumsum(x); x -= np.linspace(x[0], x[-1], n)
    return x / (np.abs(x).max() + 1e-9)


def svf(x, fc, q=0.7, mode="bp"):
    """filtro de estado variável com corte variável (fc escalar ou vetor)."""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR)
    lp = bp = 0.0; out = np.empty_like(x); damp = 1 / q
    for i in range(len(x)):
        hp = x[i] - lp - damp * bp
        bp += f[i] * hp
        lp += f[i] * bp
        out[i] = bp if mode == "bp" else (lp if mode == "lp" else hp)
    return out / (np.abs(out).max() + 1e-9)


def env(n, a, r, curve=2.0):
    t = np.linspace(0, 1, n)
    e = np.where(t < a, (t / max(a, 1e-6)) ** 1.5, ((1 - t) / max(1 - a, 1e-6)) ** curve)
    return np.clip(e, 0, 1)


def put(sig, t, gain, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * 1.414


# ---------- sons ----------
def whoosh(d=0.7, f0=300, f1=2400, peak=0.55):
    x = noise(d, "pink"); n = len(x)
    fc = np.geomspace(f0, f1, n) if f1 > f0 else np.geomspace(f0, f1, n)
    return svf(x, fc, 1.2) * env(n, peak, 1)


def thud(d=0.55, f=58):
    n = int(SR * d); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (f * t + 25 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 9)
    card = svf(noise(d), 500, 1.0, "bp") * np.exp(-t * 35)
    return body * 0.8 + card * 0.45


def tape(d=0.65):
    n = int(SR * d); t = np.arange(n) / SR
    grains = (rng.random(n) < 0.012).astype(float)
    grains = np.convolve(grains, np.hanning(90), "same")
    x = svf(noise(d) * (0.3 + grains), np.linspace(1800, 3800, n), 0.9) * env(n, 0.15, 1, 0.8)
    return x


def page(d=0.5):
    n = int(SR * d)
    crack = np.convolve((rng.random(n) < 0.004).astype(float), np.hanning(60), "same")
    x = svf(noise(d, "pink") * (0.5 + crack), np.geomspace(900, 4200, n), 0.8) * env(n, 0.45, 1, 1.6)
    return x


def tick(d=0.09):
    n = int(SR * d); t = np.arange(n) / SR
    return (svf(noise(d), 3200, 3.0) * np.exp(-t * 90) + np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 120) * 0.3)


def tap(d=0.25):
    n = int(SR * d); t = np.arange(n) / SR
    return svf(noise(d), 1400, 1.2) * np.exp(-t * 40) * 0.7 + np.sin(2 * np.pi * 110 * t) * np.exp(-t * 25) * 0.5


def fabric(d=0.7):
    n = int(SR * d)
    return svf(noise(d, "pink"), np.linspace(500, 1600, n), 0.8) * env(n, 0.4, 1, 1.2)


def rumble(d=2.0):
    n = int(SR * d); t = np.arange(n) / SR
    x = svf(noise(d, "brown"), 110, 0.8, "lp") * (0.75 + 0.25 * np.sin(2 * np.pi * 7.5 * t))
    return x * env(n, 0.45, 1, 1.4)


def impact(d=2.2):
    n = int(SR * d); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (44 * t + 30 * (1 - np.exp(-t * 18)) / 18)) * np.exp(-t * 2.6)
    air = svf(noise(d), 6000, 0.7, "hp") * np.exp(-t * 2.2) * 0.18
    hit = svf(noise(0.08), 900, 0.8) * 0.6
    out = boom + air; out[: len(hit)] += hit * np.exp(-np.arange(len(hit)) / SR * 40)
    return out


def riser(d=1.0):
    n = int(SR * d)
    return svf(noise(d, "pink"), np.geomspace(250, 5000, n), 1.4) * (np.linspace(0, 1, n) ** 2.2)


def scribble(d=0.8):
    n = int(SR * d); t = np.arange(n) / SR
    am = 0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 6.5 * t + np.sin(2 * np.pi * 2.1 * t)))
    return svf(noise(d), 4200, 1.5) * am * env(n, 0.1, 1, 0.6)


def pop(d=0.18):
    n = int(SR * d); t = np.arange(n) / SR
    return svf(noise(d), np.geomspace(600, 2200, n), 2.5) * np.exp(-t * 30)


def shimmer(d=1.2):
    n = int(SR * d)
    return svf(noise(d), 7500, 0.8, "hp") * env(n, 0.25, 1, 2)


# ---------- ambiências (muito baixas) ----------
def bed(t0, t1, kind, gain):
    d = t1 - t0; n = int(SR * d)
    if kind == "room":
        x = svf(noise(d, "brown"), 220, 0.7, "lp") * 0.8 + svf(noise(d, "pink"), 1800, 0.7, "lp") * 0.15
    elif kind == "street":
        t = np.arange(n) / SR
        x = svf(noise(d, "pink"), 650, 0.7, "lp") * (0.8 + 0.2 * np.sin(2 * np.pi * 0.13 * t))
    else:  # ar aberto, claro
        x = svf(noise(d, "pink"), 2600, 0.6, "lp") * 0.6
    f = np.minimum(1, np.minimum(np.arange(n) / (SR * 0.8), (n - np.arange(n)) / (SR * 0.8)))
    put(x * f, t0, gain, 0)
    x2 = np.roll(x, SR // 3)
    put(x2 * f * 0.0, t0, 0)


bed(0.0, 31.4, "room", 0.035)
bed(36.4, 45.2, "street", 0.04)
bed(45.0, 55.3, "air", 0.03)
bed(55.0, 62.0, "room", 0.02)

E = []  # (tempo, som, ganho, pan)
# cena 1
E += [(0.95, whoosh(0.6, 200, 2600, 0.8), 0.20, 0), (1.86, impact(1.6), 0.30, 0), (1.5, tap(), 0.12, 0),
      (2.6, whoosh(0.7, 1800, 400, 0.4), 0.14, 0), (4.3, fabric(0.8), 0.16, 0.2), (5.25, whoosh(0.6), 0.16, 0)]
# cena 2 — caixas, fita, móveis, transporte, check
E += [(5.98, thud(), 0.42, -0.3), (6.16, thud(0.5, 66), 0.38, 0.3), (6.38, thud(0.45, 74), 0.32, 0),
      (6.35, tape(0.62), 0.22, 0), (6.75, tick(), 0.25, 0),
      (7.05, whoosh(0.55, 400, 2000, 0.6), 0.18, 0.4), (7.3, fabric(0.6), 0.15, 0), (8.1, tick(), 0.25, 0),
      (8.55, whoosh(0.55, 400, 2000, 0.6), 0.18, 0.4), (8.75, rumble(1.3), 0.22, 0), (9.75, tick(), 0.25, 0),
      (10.05, whoosh(0.5, 400, 2000, 0.6), 0.16, 0.4), (10.2, riser(1.65), 0.10, 0), (11.85, impact(1.3), 0.22, 0),
      (11.95, tick(), 0.3, 0), (12.35, whoosh(0.9, 2200, 250, 0.5), 0.24, 0)]
# cena 3 — Paulo
E += [(13.75, tape(0.6), 0.24, 0), (13.86, whoosh(0.5, 300, 3000, 0.7), 0.14, 0),
      (14.5, whoosh(0.4, 600, 1500, 0.6), 0.10, -0.6), (14.92, thud(0.45, 62), 0.30, -0.5),
      (14.66, whoosh(0.4, 600, 1500, 0.6), 0.10, 0.6), (15.08, thud(0.45, 70), 0.28, 0.5),
      (15.3, thud(0.4, 80), 0.20, 0.4), (15.45, thud(0.4, 76), 0.2, -0.4),
      (16.05, fabric(0.85), 0.22, 0), (16.8, tap(), 0.14, 0), (17.55, whoosh(1.2, 1500, 300, 0.5), 0.08, 0)]
# cena 4 — álbum
E += [(19.72, page(0.9), 0.30, -0.2), (20.5, tap(), 0.10, 0), (20.8, tap(), 0.10, 0.2),
      (21.3, whoosh(0.5, 500, 2500, 0.6), 0.12, 0.4), (22.8, page(0.55), 0.32, 0.2),
      (23.0, tap(), 0.14, -0.2), (23.55, whoosh(0.5, 300, 2800, 0.7), 0.12, 0),
      (24.3, tap(), 0.14, 0.2), (24.95, whoosh(0.45, 500, 2300, 0.6), 0.12, 0.4),
      (25.85, tap(), 0.14, -0.1), (27.3, whoosh(0.5, 300, 2800, 0.7), 0.12, 0),
      (28.55, page(0.5), 0.20, 0), (29.15, thud(0.5, 70), 0.24, 0),
      (29.82, fabric(0.75), 0.28, 0), (30.35, tape(0.5), 0.18, 0), (30.42, whoosh(0.5, 300, 3000, 0.7), 0.12, 0),
      (30.75, whoosh(1.1, 200, 3500, 0.5), 0.30, 0)]
# cena 5 — marca
E += [(33.4, whoosh(0.5, 500, 2500, 0.6), 0.14, 0.4), (34.4, whoosh(0.6, 2500, 400, 0.4), 0.12, 0),
      (34.3, riser(0.85), 0.14, 0), (35.14, impact(2.4), 0.42, 0), (35.14, shimmer(1.6), 0.14, 0)]
# cena 6 — caminhões e trabalho
E += [(36.3, whoosh(0.7, 2500, 300, 0.4), 0.18, 0), (36.5, rumble(2.2), 0.30, -0.3),
      (37.05, whoosh(0.5, 300, 3000, 0.7), 0.12, 0), (38.2, whoosh(0.5, 500, 2500, 0.5), 0.2, -0.5),
      (38.4, whoosh(0.5, 600, 2200, 0.5), 0.14, 0.5), (39.05, whoosh(0.5, 600, 2200, 0.5), 0.14, 0.5),
      (39.7, whoosh(0.5, 600, 2200, 0.5), 0.14, 0.5), (40.3, whoosh(0.6, 2200, 300, 0.4), 0.18, 0)]
# cena 7 — trajetória
E += [(40.95, thud(0.35, 90), 0.20, -0.4), (41.0, tick(), 0.18, -0.4), (41.85, pop(), 0.2, -0.4),
      (42.62, whoosh(0.95, 300, 1800, 0.5), 0.18, 0), (42.7, rumble(2.0), 0.22, 0),
      (43.2, thud(0.35, 90), 0.2, 0.4), (43.22, tick(), 0.18, 0.4), (43.3, pop(), 0.18, 0.4),
      (43.88, pop(), 0.16, -0.2), (44.08, pop(), 0.16, 0), (44.28, pop(), 0.16, 0.2),
      (44.45, whoosh(0.4, 600, 2500, 0.6), 0.12, 0.4), (44.85, riser(0.8), 0.18, 0), (45.4, whoosh(0.7, 2800, 300, 0.3), 0.18, 0)]
# cena 8 — nova casa
E += [(46.1, thud(0.5, 64), 0.20, 0), (46.15, tap(), 0.12, 0), (47.25, whoosh(0.5, 300, 3000, 0.7), 0.12, 0),
      (48.75, whoosh(0.4, 2000, 500, 0.4), 0.10, 0), (49.0, page(0.85), 0.30, -0.2),
      (49.55, whoosh(0.45, 500, 2400, 0.6), 0.12, 0.4), (49.75, scribble(0.85), 0.16, 0.1),
      (50.3, tap(), 0.14, 0), (51.5, thud(0.35, 120), 0.26, 0), (51.52, tick(), 0.22, 0),
      (52.32, whoosh(0.5, 300, 3000, 0.7), 0.14, 0), (54.4, whoosh(0.45, 500, 2400, 0.6), 0.12, 0.4)]
# cena 9 — marca e convite
E += [(54.7, whoosh(1.1, 200, 3500, 0.5), 0.30, 0), (55.2, impact(2.6), 0.42, 0), (55.2, shimmer(1.8), 0.14, 0),
      (57.15, whoosh(0.5, 500, 2000, 0.6), 0.08, 0), (58.6, pop(0.25), 0.25, 0), (58.62, tap(), 0.16, 0),
      (58.9, shimmer(0.8), 0.08, 0.3), (59.3, whoosh(0.5, 400, 2000, 0.6), 0.08, 0)]

for t, s, g, p in E:
    put(s / (np.abs(s).max() + 1e-9), t, g, p)

mix = np.stack([L, R], 1)
peak = np.abs(mix).max()
mix = np.tanh(mix / max(peak, 1e-9) * 1.2) * 0.22  # pico ~ -14 dBFS, voz em primeiro plano
fade = np.ones(N); fade[-SR * 2:] = np.linspace(1, 0, SR * 2)
mix *= fade[:, None]
out = os.path.join(os.path.dirname(__file__), "..", "public", "diego", "sfx.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", out, len(E), "efeitos")
