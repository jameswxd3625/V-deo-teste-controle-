# Desenho de som do filme Diego Mudanças: efeitos CC0 (OpenGameArt) + sínteses + trilha "Reunited" (Kevin MacLeod, CC BY 4.0)
# Saída: diego/public/sfx.wav e diego/public/music.wav (48 kHz estéreo, 62 s)
import numpy as np, subprocess, wave, sys
sys.path.insert(0, "tools")
SR = 48000; DUR = 62.0; N = int(SR * DUR)
rng = np.random.default_rng(11)
SFX = "diego/assets_src/sfx_used/"
def load(path, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(sr), "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def write(path, x):
    x = np.clip(x, -1, 1); y = (x * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.reshape(-1).tobytes())
def tt(d): return np.arange(int(d * SR)) / SR
def st(x): return np.stack([x, x], 1) if x.ndim == 1 else x
def pitch(x, r):  # reamostra (r>1 = mais agudo e curto)
    n = int(len(x) / r); idx = np.arange(n) * r
    return np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)
def place(buf, sig, t0, g=1.0, pan=0.0, r=1.0):
    sig = st(sig)
    if r != 1.0: sig = pitch(sig, r)
    sig = sig * np.array([np.sqrt(1 - pan) , np.sqrt(1 + pan)]) / np.sqrt(1) * 0.7071 * 1.4142
    i = int(t0 * SR); j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * g
def fftfilt(x, lo=None, hi=None, o=2):
    X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** (2 * o))
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * o))
    return np.fft.irfft(X * (g[:, None] if x.ndim == 2 else g), n=len(x), axis=0)
def stft_noise(d, fc, bw, env):
    n = int(d * SR); F = 2048; Hh = 512; win = np.hanning(F); out = np.zeros(n + F); fr = np.fft.rfftfreq(F, 1 / SR)
    for k in range(0, n, Hh):
        t = k / SR
        spec = (rng.standard_normal(len(fr)) + 1j * rng.standard_normal(len(fr))) * np.exp(-0.5 * ((np.log2(np.maximum(fr, 20) / fc(t))) / bw(t)) ** 2)
        out[k:k + F] += np.fft.irfft(spec, F) * win * env(t)
    return norm(out[:n])
def whoosh(d=0.6, f0=300, f1=3000, peak=0.5):
    return stft_noise(d, lambda t: f0 * (f1 / f0) ** (t / d), lambda t: 0.8, lambda t: np.sin(np.pi * min(1, (t / d) ** (np.log(0.5) / np.log(peak)))) ** 2)
def tape_rip(d=0.42):
    t = tt(d); n = rng.standard_normal(len(t))
    crack = (rng.random(len(t)) < 0.02).astype(float); crack = np.convolve(crack, np.exp(-np.arange(200) / 30), "same")
    x = fftfilt(n * (0.4 + crack), lo=1200, hi=9000) * np.minimum(1, t / 0.02) * np.exp(-np.maximum(0, t - d + 0.08) * 40)
    return norm(x) * 0.9
def chime(fs, d=2.5):
    t = tt(d); x = np.zeros_like(t)
    for i, f in enumerate(fs):
        for r, a, dec in ((1, 1, 2.2), (2.0, 0.3, 4), (3.0, 0.12, 7)):
            x += a * np.sin(2 * np.pi * f * r * t + i) * np.exp(-t * dec) * (t > i * 0.05)
    return norm(x * (1 - np.exp(-t * 800)))
def engine(d, f0, f1, g_env):
    t = tt(d); f = f0 + (f1 - f0) * t / d; ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.5 * np.sin(2 * ph + 1) + 0.3 * np.sin(3 * ph) + 0.4 * fftfilt(rng.standard_normal(len(t)), hi=300)
    return norm(x) * np.array([g_env(u) for u in t / d])
def ambience(d, lo, hi):
    x = st(fftfilt(rng.standard_normal(int(d * SR)), lo=lo, hi=hi))
    x[:, 1] = np.roll(x[:, 1], 997)
    return norm(x)
def S(name): return load(SFX + name)

fx = np.zeros((N, 2))
# ---- ambiências ----
amb_night = ambience(19.6, 80, 900); amb_night[: int(SR * 1.0)] *= np.linspace(0, 1, int(SR * 1.0))[:, None]
place(fx, amb_night, 0.0, 0.035)
amb_day = ambience(4.2, 200, 5000); place(fx, amb_day, 36.3, 0.03); place(fx, ambience(1.6, 200, 5000), 44.9, 0.03)
place(fx, ambience(3.5, 150, 4000), 46.4, 0.02)
# ---- abertura e lista ----
place(fx, whoosh(1.4, 200, 1200, 0.3), 0.0, 0.10)
place(fx, S("100-CC0-SFX_0/paper_02.ogg"), 2.78, 0.35)
place(fx, whoosh(0.5, 400, 2500, 0.4), 2.7, 0.10)
for i, at in enumerate([5.74, 7.14, 8.66, 10.22]):
    place(fx, S("100-CC0-SFX_0/paper_01.ogg"), at, 0.22, pan=-0.3, r=1.0 + i * 0.05)
for i, at in enumerate([5.8, 6.0, 6.2, 6.3, 6.5]):
    place(fx, S("RPGsounds_Kenney/OGG/dropLeather.ogg"), at - 0.02, 0.55, pan=[-0.4, -0.3, -0.2, 0.3, 0.35][i], r=[0.8, 0.85, 0.95, 0.78, 0.9][i])
place(fx, S("RPGsounds_Kenney/OGG/creak1.ogg"), 10.5, 0.18, pan=-0.4, r=0.8)
place(fx, S("RPGsounds_Kenney/OGG/creak2.ogg"), 11.4, 0.22, pan=-0.4, r=0.75)
for i, at in enumerate([11.95, 12.18, 12.42]): place(fx, S(f"RPGsounds_Kenney/OGG/footstep0{i}.ogg"), at, 0.35, pan=0.4 - i * 0.2)
place(fx, S("RPGsounds_Kenney/OGG/dropLeather.ogg"), 12.4, 0.35, pan=-0.3, r=1.1)
place(fx, S("RPGsounds_Kenney/OGG/cloth1.ogg"), 12.3, 0.3)
place(fx, whoosh(0.4, 600, 2000, 0.5), 12.15, 0.08)
# ---- álbum ----
place(fx, S("RPGsounds_Kenney/OGG/cloth2.ogg"), 14.55, 0.25)
place(fx, S("100-CC0-SFX_0/paper_02.ogg"), 14.72, 0.3, pan=0.35, r=0.85)
place(fx, S("MoreSounds/Plastic/Plastic_05.wav"), 15.6, 0.2, pan=0.35)
place(fx, S("RPGsounds_Kenney/OGG/handleSmallLeather.ogg"), 16.15, 0.45, pan=0.25)
place(fx, S("RPGsounds_Kenney/OGG/cloth3.ogg"), 16.5, 0.2)
place(fx, S("RPGsounds_Kenney/OGG/bookOpen.ogg"), 19.66, 0.6)
place(fx, S("book_flips_-_starninjas/book_flip.3.ogg"), 19.62, 0.35)
place(fx, S("book_flips_-_starninjas/book_flip.5.ogg"), 24.28, 0.55)
place(fx, S("RPGsounds_Kenney/OGG/bookClose.ogg"), 29.5, 0.6)
place(fx, S("book_flips_-_starninjas/book_flip.7.ogg"), 29.0, 0.3)
place(fx, S("RPGsounds_Kenney/OGG/cloth4.ogg"), 29.45, 0.25)
place(fx, S("MoreSounds/Plastic/Plastic_08.wav"), 30.45, 0.35)
place(fx, S("100-CC0-SFX_0/paper_01.ogg"), 30.92, 0.45, r=0.7)
place(fx, S("RPGsounds_Kenney/OGG/dropLeather.ogg"), 31.3, 0.5, r=0.7)
place(fx, tape_rip(0.42), 31.1, 0.4)
# ---- equipe ----
place(fx, S("RPGsounds_Kenney/OGG/doorOpen_1.ogg"), 31.78, 0.5, pan=-0.5)
for i, at in enumerate([32.25, 32.5, 32.7, 32.95, 33.15]): place(fx, S(f"RPGsounds_Kenney/OGG/footstep0{i + 3}.ogg"), at, 0.3, pan=-0.4 + i * 0.1)
place(fx, S("MoreSounds/Cloth/Cloth_03.wav"), 34.45, 0.55)
place(fx, whoosh(0.8, 250, 2200, 0.45), 34.45, 0.22)
place(fx, chime([1046.5, 1318.5, 1568, 2093]), 35.25, 0.12)
place(fx, whoosh(0.5, 2500, 400, 0.5), 36.2, 0.25)
# ---- caminhão ----
place(fx, engine(3.3, 38, 36, lambda u: 0.5 + 0.5 * min(1, u * 4) * (1 - max(0, u - 0.9) * 10)), 36.3, 0.05)
for i in range(6): place(fx, S("100-CC0-wood-metal-SFX/metal_sheet_0%d.ogg" % (i % 5 + 1)), 38.75 + i * 0.16, 0.06, pan=-0.3)
place(fx, S("RPGsounds_Kenney/OGG/creak3.ogg"), 39.75, 0.3, r=0.7)
place(fx, S("100-CC0-wood-metal-SFX/metal_close_01.ogg"), 40.12, 0.55)
place(fx, S("RPGsounds_Kenney/OGG/metalLatch.ogg"), 40.3, 0.55)
place(fx, whoosh(0.6, 300, 3500, 0.4), 40.25, 0.07)
place(fx, S("100-CC0-SFX_0/plop_01.ogg"), 41.2, 0.35, pan=-0.4)
t = tt(1.1); place(fx, np.sin(2 * np.pi * np.cumsum(500 + 700 * (t / 1.1) ** 1.5) / SR) * np.sin(np.pi * t / 1.1) * 0.5, 42.2, 0.05)
place(fx, S("100-CC0-SFX_0/plop_02.ogg"), 42.85, 0.35, pan=0.4)
for i, at in enumerate([44.2, 44.35, 44.5]): place(fx, S("100-CC0-SFX_0/plop_01.ogg"), at, 0.22, pan=[-0.4, 0.4, 0][i], r=1.2 + i * 0.1)
place(fx, engine(1.4, 70, 34, lambda u: (1 - u) ** 0.6), 44.9, 0.10)
place(fx, fftfilt(rng.standard_normal(int(0.6 * SR)), lo=2000, hi=8000) * np.exp(-tt(0.6) * 5), 45.95, 0.05)
# ---- casa nova ----
place(fx, S("RPGsounds_Kenney/OGG/metalLatch.ogg"), 46.38, 0.5, r=0.9)
place(fx, S("RPGsounds_Kenney/OGG/creak2.ogg"), 46.5, 0.3, r=0.7)
place(fx, whoosh(1.0, 200, 3000, 0.6), 46.45, 0.12)
place(fx, chime([830.6, 1046.5, 1244.5], 2.0), 46.9, 0.06)
place(fx, whoosh(0.6, 400, 4000, 0.8), 48.45, 0.2)
for i, at in enumerate([49.1, 49.4, 49.7, 50.0]): place(fx, S(f"RPGsounds_Kenney/OGG/footstep0{i + 5}.ogg"), at, 0.22, pan=0.1 * i)
place(fx, S("RPGsounds_Kenney/OGG/bookPlace1.ogg"), 50.6, 0.6, pan=0.3)
# ---- marca ----
place(fx, whoosh(1.0, 150, 2500, 0.6), 52.0, 0.3)
place(fx, chime([830.6, 1046.5, 1244.5, 1661.2], 4.0), 55.25, 0.16)
t = tt(2.0); place(fx, np.sin(2 * np.pi * 52 * t) * np.exp(-t * 2.5) * (1 - np.exp(-t * 300)), 55.22, 0.35)
place(fx, S("100-CC0-SFX_0/plop_01.ogg"), 58.55, 0.3, r=0.9)
fx = fftfilt(fx, lo=25)
write("diego/public/sfx.wav", fx / max(1.0, np.max(np.abs(fx)) / 0.9))

# ---------------- trilha ----------------
mu = np.zeros((N, 2))
tr = load("diego/assets_src/Reunited.mp3")
OFF = 0.3
place(mu, tr, OFF, 1.0)
# automação: respiro em "parou por um instante" e abertura na marca
tline = np.arange(N) / SR
def env(pts):
    xs, ys = zip(*pts); return np.interp(tline, xs, ys)
g = env([(0, 0.0), (0.5, 0.85), (17.8, 0.85), (18.3, 0.55), (19.5, 0.55), (20.2, 0.85), (34.4, 0.85), (35.2, 1.0), (52.0, 1.0), (55.2, 1.05), (62, 1.0)])
mu *= g[:, None]
# pad em Lá bemol maior sustentando a assinatura final
t = tt(DUR - 55.0); pad = np.zeros_like(t)
for f in (207.65, 261.63, 311.13, 415.3, 523.25):
    for det in (-0.08, 0.0, 0.08):
        for k in range(1, 6): pad += np.sin(2 * np.pi * f * 2 ** (det / 12) * k * t + k) / k ** 1.6
pad = norm(fftfilt(pad, hi=2500)) * np.minimum(1, t / 1.5) * np.clip((DUR - 55.0 - t) / 2.5, 0, 1)
place(mu, pad, 55.0, 0.08)
fade = np.ones(N); fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR)) ** 1.5
mu *= fade[:, None]
write("diego/public/music.wav", mu / max(1.0, np.max(np.abs(mu)) / 0.95))
print("ok")
