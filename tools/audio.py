# Trilha e efeitos sintetizados para o anúncio (48 kHz, estéreo). Saída: public/music.wav, public/sfx.wav
import numpy as np, wave, sys
SR = 48000; DUR = 30.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
def tt(d): return np.arange(int(d * SR)) / SR
def write(path, x):
    x = np.clip(x, -1, 1); y = (x * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.reshape(-1).tobytes())
def place(buf, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if sig.ndim == 1: sig = np.stack([sig * np.sqrt(0.5 * (1 - pan)), sig * np.sqrt(0.5 * (1 + pan))], 1) * np.sqrt(2)
    j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[:j - i] * gain
def fftfilt(x, lo=None, hi=None, order=2):
    X = np.fft.rfft(x, axis=0); fr = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(fr)
    if hi: g *= 1 / np.sqrt(1 + (fr / hi) ** (2 * order))
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(fr, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * (g[:, None] if x.ndim == 2 else g), n=len(x), axis=0)
def conv(x, ir):
    n = len(x) + len(ir) - 1; L = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[:len(x)]
def reverb(x, rt=1.6, mix=0.25, pre=0.02):
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = np.concatenate([x, np.zeros((int(rt * SR), 2))]); d = tt(rt * 1.5); out = np.zeros_like(x)
    for c in range(2):
        ir = rng.standard_normal(len(d)) * np.exp(-6.9 * d / rt); ir[:int(pre * SR)] = 0
        ir = fftfilt(ir, lo=200, hi=7000); ir /= np.sqrt(np.sum(ir ** 2))
        out[:, c] = conv(x[:, c] if x.ndim == 2 else x, ir)
    dry = x if x.ndim == 2 else np.stack([x, x], 1)
    return dry * (1 - mix) + out * mix * 0.7
def stft_noise(d, fc, bw, env):
    # ruído com banda variável no tempo (fc, bw, env: funções de t em s)
    n = int(d * SR); F = 2048; Hh = 512; win = np.hanning(F); out = np.zeros(n + F)
    fr = np.fft.rfftfreq(F, 1 / SR)
    for k in range(0, n, Hh):
        t = k / SR; c = fc(t); b = bw(t)
        spec = (rng.standard_normal(len(fr)) + 1j * rng.standard_normal(len(fr))) * np.exp(-0.5 * ((np.log2(np.maximum(fr, 20) / c)) / b) ** 2)
        out[k:k + F] += np.fft.irfft(spec, F) * win * env(t)
    out = out[:n]; return out / (np.max(np.abs(out)) + 1e-9)

# ---------------- instrumentos ----------------
def kick(g=1.0):
    t = tt(0.5); f = 48 + 90 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 7) + 0.25 * rng.standard_normal(len(t)) * np.exp(-t * 300)) * g
def clap():
    t = tt(0.3); n = rng.standard_normal(len(t)); e = np.zeros_like(t)
    for o in (0, 0.011, 0.022): e += (t >= o) * np.exp(-np.maximum(t - o, 0) * (60 if o < 0.02 else 18))
    return fftfilt(n * e, lo=900, hi=5000) * 0.9
def hat(d=0.05):
    t = tt(d * 3); return fftfilt(rng.standard_normal(len(t)), lo=7000) * np.exp(-t / d) * 0.5
def pluck(f, d=0.6, bright=1.0):
    t = tt(d); x = np.zeros_like(t)
    for k in range(1, 16):
        if f * k > 15000: break
        x += np.sin(2 * np.pi * f * k * t + k) / k * np.exp(-t * (4 + k * 2.2 / bright))
    return x * (1 - np.exp(-t * 400)) * 0.5
def pad(freqs, d, att=0.6, rel=0.8, bright=8):
    t = tt(d); L = np.zeros_like(t); R = np.zeros_like(t)
    for f in freqs:
        for det, side in ((-0.12, 0), (0.0, 2), (0.12, 1)):
            ff = f * 2 ** (det / 12)
            for k in range(1, bright + 1):
                s = np.sin(2 * np.pi * ff * k * t + rng.uniform(0, 6.28)) / k ** 1.4
                if side in (0, 2): L += s
                if side in (1, 2): R += s
    env = np.minimum(1, t / att) * np.minimum(1, (d - t) / rel).clip(0, 1)
    x = np.stack([L, R], 1) * env[:, None]; return x / (np.max(np.abs(x)) + 1e-9)
def bass(f, d):
    t = tt(d); x = np.zeros_like(t)
    for k in range(1, 7): x += np.sin(2 * np.pi * f * k * t) / k ** 1.6
    env = (1 - np.exp(-t * 200)) * np.exp(-t * 1.2) * np.clip((d - t) / 0.05, 0, 1)
    return np.tanh(x * 1.4) * env * 0.6
def bell(f, d=1.5, g=1.0):
    t = tt(d); x = np.zeros_like(t)
    for r, a, dec in ((1, 1, 3), (2.76, 0.5, 6), (5.4, 0.25, 10), (8.93, 0.12, 16)):
        x += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dec)
    return x * (1 - np.exp(-t * 2000)) * g * 0.4
def coin(f=2300): return bell(f, 1.2, 1.0) + 0.6 * bell(f * 1.5, 1.2, 0.6)
def tick(f=2000, d=0.03):
    t = tt(d * 3); return np.sin(2 * np.pi * f * t) * np.exp(-t / d) * 0.5
def whoosh(d=0.6, f0=300, f1=3000, peak=0.6):
    return stft_noise(d, lambda t: f0 * (f1 / f0) ** (t / d), lambda t: 0.9, lambda t: np.sin(np.pi * min(1, (t / d) ** (np.log(0.5) / np.log(peak)))) ** 2) * 0.6
def impact(g=1.0):
    t = tt(2.5); f = 38 + 70 * np.exp(-t * 9); ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-t * 2.2)
    nz = fftfilt(rng.standard_normal(len(t)), hi=2500) * np.exp(-t * 9) * 0.5
    return (sub + nz) * g
def riser(d=1.0):
    n = stft_noise(d, lambda t: 400 * (8000 / 400) ** ((t / d) ** 1.5), lambda t: 0.7, lambda t: (t / d) ** 2)
    t = tt(d); ph = 2 * np.pi * np.cumsum(200 * 4 ** (t / d)) / SR
    return n * 0.5 + np.sin(ph) * (t / d) ** 3 * 0.15

# ---------------- música ----------------
DROP, LOGO = 7.92, 26.22
BEAT = (LOGO - DROP) / 37  # ~0.4946 s (121,3 bpm): virada e impacto da logo caem na grade
def beats(a, b):
    n0 = int(np.ceil((a - DROP) / BEAT)); out = []
    while DROP + n0 * BEAT < b: out.append((n0, DROP + n0 * BEAT)); n0 += 1
    return out
mus = np.zeros((N, 2)); drums = np.zeros((N, 2)); padb = np.zeros((N, 2)); pl = np.zeros((N, 2))
nt = lambda m: 440 * 2 ** ((m - 69) / 12)
A2, C3, E3, F2, G2 = 45, 48, 52, 41, 43
CH = {"Am": [57, 60, 64], "F": [53, 57, 60], "C": [55, 60, 64], "G": [55, 59, 62], "Fmaj7": [53, 57, 60, 64]}
ROOT = {"Am": 45, "F": 41, "C": 48, "G": 43, "Fmaj7": 41}
BAR = 4 * BEAT
# problema (0 -> 7.92): Am / F escuros, pulso grave, tique de relógio crescente
for i, (t0, ch) in enumerate([(-0.08, "Am"), (BAR - 0.08, "F"), (2 * BAR - 0.08, "Am"), (3 * BAR - 0.08, "Fmaj7")]):
    place(padb, pad([nt(m - 12) for m in CH[ch]], BAR + 0.6, att=0.4, bright=5), max(0, t0), 0.16)
for n, t in beats(0, 7.7):
    place(drums, bass(nt(ROOT["Am" if (t // (2 * BAR)) % 2 == 0 else "F"] - 12), 0.4), t, 0.5)
    place(drums, kick(0.55), t, 0.45)
    for s in range(2):
        place(drums, hat(0.02), t + s * BEAT / 2, 0.10 + 0.12 * (t / 7.9), pan=0.3)
place(mus, riser(1.1), DROP - 1.15, 0.35)
# solução (7.92 -> 21.45)
prog = ["Am", "F", "C", "G"]
for b in range(7):
    t0 = DROP + b * BAR; ch = prog[b % 4]
    place(padb, pad([nt(m) for m in CH[ch]], BAR + 0.5, att=0.08, bright=9), t0, 0.15)
    for k in range(8):  # arpejo em colcheias
        m = CH[ch][[0, 1, 2, 1, 2, 0, 1, 2][k]] + (12 if k in (2, 4, 6) else 0)
        place(pl, pluck(nt(m), 0.5), t0 + k * BEAT / 2, 0.16, pan=[-0.4, 0.4][k % 2])
    for k in range(4):
        place(drums, bass(nt(ROOT[ch] - 12), BEAT * 0.9), t0 + k * BEAT, 0.6)
for n, t in beats(DROP, 21.45):
    place(drums, kick(0.9), t, 0.6)
    if n % 2 == 1: place(drums, clap(), t, 0.35)
    for s in range(4): place(drums, hat(0.018 if s % 2 == 0 else 0.03), t + s * BEAT / 4, 0.09 if s % 2 == 0 else 0.13, pan=-0.25)
# pausa "Vai abrir sua empresa?" (21.45 -> 24.4): pad + arpejo leve
for b, ch in enumerate(["F", "G"]):
    t0 = DROP + (7 + b) * BAR
    place(padb, pad([nt(m) for m in CH[ch]], BAR + 0.6, att=0.3, bright=9), t0, 0.17)
    for k in range(8): place(pl, pluck(nt(CH[ch][k % 3] + 12), 0.45, 0.6), t0 + k * BEAT / 2, 0.10, pan=[-0.4, 0.4][k % 2])
# retomada 24.4 -> 26.22 com rufar
for n, t in beats(24.35, LOGO - 0.01):
    place(drums, kick(0.9), t, 0.55)
    if n % 2 == 1: place(drums, clap(), t, 0.3)
    place(drums, bass(nt(ROOT["Am" if t < 25.3 else "G"] - 12), BEAT * 0.9), t, 0.55)
roll_t = 25.2
while roll_t < LOGO - 0.02:
    g = (roll_t - 25.2) / (LOGO - 25.2); place(drums, clap(), roll_t, 0.08 + 0.25 * g); roll_t += BEAT / (4 if g < 0.5 else 8)
place(mus, riser(1.3), LOGO - 1.3, 0.4)
# final em Dó maior sustentado
place(padb, pad([nt(m) for m in [48, 55, 60, 64, 67, 72]], 30 - LOGO, att=0.02, rel=2.5, bright=10), LOGO, 0.24)
place(drums, kick(1.0), LOGO, 0.7); place(drums, bass(nt(36), 2.5), LOGO, 0.6)
for k, m in enumerate([72, 76, 79, 84, 88]): place(pl, pluck(nt(m), 1.2, 1.5), LOGO + 0.08 + k * BEAT / 2, 0.12, pan=[-0.5, 0.5][k % 2])

mus += reverb(padb, 2.2, 0.35)[:N] + reverb(pl, 1.4, 0.35)[:N] + drums
mus = fftfilt(mus, lo=30)
fade = np.ones(N); tail = int(1.2 * SR); fade[-tail:] = np.linspace(1, 0, tail) ** 2; mus *= fade[:, None]
mus /= np.max(np.abs(mus)) / 0.8
write(sys.argv[1] + "/music.wav", mus)

# ---------------- efeitos (ligados às ações da imagem) ----------------
fx = np.zeros((N, 2))
place(fx, impact(0.7), 0.0, 0.5); place(fx, whoosh(0.7, 200, 4000, 0.3), 0.0, 0.3)
for i in range(12): place(fx, tick(1400 + i * 90), 0.1 + i * (0.52 / 12), 0.22)  # contagem 0 -> 12
place(fx, coin(2600), 0.62, 0.22)
place(fx, whoosh(0.6, 300, 2500), 2.28, 0.35, pan=-0.3)
for i in range(1, 12): place(fx, tick(900 + i * 70, 0.04), 3.46 + i * 0.065, 0.16, pan=[-0.5, 0, 0.5][i % 3])
place(fx, whoosh(0.5, 2500, 300, 0.5), 4.45, 0.35)
place(fx, whoosh(0.55, 400, 3000, 0.6), 4.92, 0.3)
place(fx, coin(1900), 5.86, 0.35, pan=0.4)
place(fx, whoosh(0.25, 1500, 6000, 0.5), 7.28, 0.3, pan=0.2)
place(fx, impact(1.0), DROP, 0.75); place(fx, reverb(bell(1046, 2.5, 1) + bell(1568, 2.5, 0.6), 2.5, 0.5), DROP + 0.05, 0.3)
place(fx, whoosh(0.5, 3000, 600, 0.5), 8.5, 0.28)
for t in (9.32, 10.38, 12.12): place(fx, whoosh(0.45, 500, 3500, 0.7), t, 0.28, pan=0.4)
for i in range(3): place(fx, tick(2200, 0.03), 9.84 + i * 0.15, 0.25)
place(fx, whoosh(0.9, 2000, 4000, 0.5), 10.95, 0.12)
for i in range(5): place(fx, tick(1500 + i * 150, 0.035), 12.45 + i * 0.09, 0.18)
place(fx, whoosh(0.5, 3000, 500, 0.5), 12.95, 0.3)
for t, f in ((13.32, 1318), (14.32, 1568), (15.66, 1760)): place(fx, reverb(bell(f, 1.6, 1), 1.2, 0.4), t, 0.3)
place(fx, whoosh(0.5, 3000, 400, 0.6), 16.85, 0.3)
place(fx, kick(0.6) * 0.6, 18.22, 0.5); place(fx, tick(3000, 0.02), 18.22, 0.5)
place(fx, reverb(bell(2093, 1.5, 0.8), 1.5, 0.45), 19.28, 0.22)
place(fx, whoosh(0.7, 400, 5000, 0.7), 19.95, 0.28)
place(fx, impact(0.6), 21.0, 0.4); place(fx, reverb(bell(1568, 1.8, 1), 1.6, 0.4), 21.02, 0.28)
place(fx, whoosh(0.4, 600, 5000, 0.5), 21.42, 0.35)
place(fx, whoosh(0.5, 300, 1200, 0.4), 22.95, 0.2)
place(fx, reverb(bell(1760, 1.4, 1), 1.2, 0.4), 23.72, 0.28)
place(fx, whoosh(0.5, 300, 6000, 0.8), 24.3, 0.4)
place(fx, impact(1.0), 25.02, 0.6)
place(fx, whoosh(0.4, 3000, 700, 0.5), 25.85, 0.25)
place(fx, impact(1.0), LOGO, 0.75)
place(fx, reverb(sum(np.pad(bell(f, 3.0, 0.6), (int(i * 0.06 * SR), 0))[:int(3 * SR)] for i, f in enumerate([2093, 2637, 3136, 4186])), 3.0, 0.6), LOGO + 0.45, 0.25)
fx = fftfilt(fx, lo=25)
fx /= np.max(np.abs(fx)) / 0.85
write(sys.argv[1] + "/sfx.wav", fx)
print("ok, beat", BEAT)
