"""Trilha eletrônica minimalista (tech/ambient) para o filme Diego Mudanças.
Pad que "respira", arpejo filtrado em semicolcheias, pulso grave suave e ticks digitais discretos.
Compasso de 2,515 s (95,4 BPM) alinhado para cair exatamente nas revelações da marca (35,16 s e 55,28 s).
A música abaixa sozinha sob a voz. Gera public/diego/musica.wav (estéreo 48 kHz).
Uso: python3 scripts/diego_musica.py   (requer numpy e ffmpeg)
"""
import numpy as np, wave, os, subprocess

SR = 48000
DUR = 62.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(5)
ROOT = os.path.join(os.path.dirname(__file__), "..")

BAR = 20.12 / 8           # 2,515 s → 95,4 BPM
BEAT = BAR / 4
S16 = BEAT / 4
ORIGIN = 35.16 - 14 * BAR  # compasso 14 começa na marca; compasso 22 em 55,28 s


def bar_t(n): return ORIGIN + n * BAR
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)


# acordes em Ré maior: Bm9 → Gmaj9 → Dadd9 → Asus (o compasso da marca cai em Dadd9)
CH = [[47, 54, 57, 61, 62, 66], [43, 54, 57, 59, 62, 66], [38, 54, 57, 62, 64, 66], [45, 52, 57, 62, 64, 69]]
def chord(n): return CH[n % 4]

# intensidade por compasso: pad, arpejo, pulso grave, ticks, abertura do filtro (0..1)
def sec(n):
    tt = bar_t(n)
    if tt < 10: return dict(pad=.7, arp=.45, sub=0, tick=0, open=.25)
    if tt < 12.5: return dict(pad=.7, arp=.55, sub=0, tick=.35, open=.35)
    if tt < 17.5: return dict(pad=.75, arp=.45, sub=0, tick=.25, open=.3)
    if tt < 20.0: return dict(pad=.8, arp=0, sub=0, tick=0, open=.2)    # "parou por um instante"
    if tt < 30.0: return dict(pad=.85, arp=.4, sub=0, tick=0, open=.3, slow=True)  # álbum
    if tt < 35.1: return dict(pad=.85, arp=.6, sub=0, tick=.5, open=.35, build=True)
    if tt < 45.1: return dict(pad=.8, arp=.7, sub=.8, tick=.7, open=.6)   # marca, caminhões, trajeto
    if tt < 52.7: return dict(pad=.85, arp=.55, sub=0, tick=.35, open=.4)  # nova casa
    if tt < 55.2: return dict(pad=.8, arp=.6, sub=0, tick=.5, open=.35, build=True)
    return dict(pad=.85, arp=.6, sub=.7, tick=.55, open=.55)              # assinatura final


L = np.zeros(N); R = np.zeros(N)
def add(sig, start, gain, pan=0.0):
    i = int(round(start * SR))
    if i < 0: sig = sig[-i:]; i = 0
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.cos((pan + 1) * np.pi / 4)
    R[i:i + len(sig)] += sig * np.sin((pan + 1) * np.pi / 4)


# ---------- pad (aditivo, brilho com LFO lento) ----------
def pad(notes, d, bright):
    n = int(d * SR); tt = np.arange(n) / SR
    out = np.zeros(n)
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * tt)
    for m in notes:
        f = mtof(m)
        for det, ph in ((-0.003, 0.4), (0.0035, 2.2)):
            ff = f * (1 + det)
            for h in range(1, 6):
                if f * h > 3500: break
                amp = (bright * (0.6 + 0.4 * lfo)) ** (h - 1) / h
                out += np.sin(2 * np.pi * ff * h * tt + ph * h) * amp
    return out / len(notes)


# ---------- pluck sintético (escurece rápido = filtro com envelope) ----------
def pluck(f, op, d=0.55):
    n = int(d * SR); tt = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, 9):
        if f * h > 9000: break
        dec = 0.09 + 0.5 * op / h
        out += np.sin(2 * np.pi * f * h * tt) * np.exp(-tt / (dec / (1 + 0.15 * h))) / h
    return out * np.minimum(1, tt / 0.003)


def sub(d=0.42):
    n = int(d * SR); tt = np.arange(n) / SR
    f = 44 + 30 * np.exp(-tt / 0.05)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.22) * np.minimum(1, tt / 0.004)


def tick(d=0.04):
    n = int(d * SR); tt = np.arange(n) / SR
    x = np.diff(rng.standard_normal(n + 1))  # ruído agudo
    return x * np.exp(-tt / 0.008) * 0.5


pump = np.ones(N)
for n in range(-1, 26):
    s = sec(n); t0 = bar_t(n)
    if t0 > DUR: break
    notes = chord(n)
    # pad com sobreposição entre compassos
    d = BAR + 1.0
    env_t = np.arange(int(d * SR)) / SR
    env = np.minimum(1, env_t / 0.6) * np.clip((d - env_t) / 0.9, 0, 1)
    add(pad([m + 12 for m in notes[1:]] + [notes[0]], d, 0.35 + 0.2 * s["open"]) * env, t0 - 0.3, 0.32 * s["pad"])
    # arpejo
    if s["arp"] > 0:
        tones = sorted(m + 12 for m in notes[1:])
        pat = [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 4, 5, 3, 2, 1, 2]
        step = 2 if s.get("slow") else 1
        for k in range(0, 16, step):
            tt = t0 + k * S16
            if tt < 0 or tt > DUR - 1: continue
            if s.get("build"):
                prog = (tt - t0) / BAR
                op = s["open"] + 0.4 * prog
            else:
                op = s["open"]
            m = tones[pat[k] % len(tones)] + (12 if k % 8 == 6 else 0)
            vel = (0.55 + 0.45 * (k % 4 == 0)) * s["arp"] * (0.85 + 0.3 * rng.random())
            pan = 0.35 if k % 2 else -0.35
            add(pluck(mtof(m), op), tt, 0.09 * vel, pan)
            add(pluck(mtof(m), op * 0.7), tt + 3 * S16, 0.035 * vel, -pan)  # eco pingue-pongue
    # pulso grave e bombeamento do pad
    if s["sub"] > 0:
        for b in range(4):
            tb = t0 + b * BEAT
            add(sub(), tb, 0.30 * s["sub"] * (1 if b % 2 == 0 else 0.6))
            i0 = int(tb * SR); i1 = min(N, i0 + int(BEAT * SR))
            if 0 <= i0 < N:
                ph = np.arange(i1 - i0) / SR
                pump[i0:i1] = 1 - 0.3 * np.exp(-ph / 0.14)
    if s["tick"] > 0:
        for k in range(16):
            tt = t0 + k * S16
            if k % 2 == 1 or (k % 4 == 2):
                add(tick(), tt, 0.05 * s["tick"] * (1.3 if k % 4 == 2 else 0.7), rng.uniform(-0.5, 0.5))

# subida de energia antes das marcas (ruído filtrado crescente, sem melodia)
def riser(d):
    n = int(d * SR); tt = np.arange(n) / SR
    x = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    x *= np.exp(-((np.log2(f + 1) - np.log2(2500)) ** 2) / 2)
    return np.fft.irfft(x, n) * (tt / d) ** 2.5
for tb in (35.16, 55.28):
    add(riser(2.4), tb - 2.4, 0.06)

# ---------- espaço (reverb) ----------
def reverb(x, seed, dec=1.1, dur=2.8):
    n = int(dur * SR); tt = np.arange(n) / SR
    ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-tt / dec)
    ir = np.convolve(ir, np.ones(7) / 7, "same"); ir /= np.sqrt((ir ** 2).sum())
    m = len(x) + n
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
L = L * pump + 0.45 * reverb(L * pump, 1); R = R * pump + 0.45 * reverb(R * pump, 2)

# ---------- forma geral ----------
curve = np.interp(t, [0, 2.0, 17.4, 17.8, 19.9, 20.4, 34.9, 35.2, 45.1, 45.6, 55.1, 55.4, 59.8, 62],
                  [0, .8, .8, .55, .55, .8, .9, 1.0, 1.0, .85, .9, 1.0, .9, 0])

# ---------- abaixa sob a voz ----------
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "public/diego/locucao.mp3"), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
v = np.frombuffer(pcm, "<i2").astype(float) / 32768
v = np.pad(v, (0, max(0, N - len(v))))[:N]
win = int(0.05 * SR)
rms = np.sqrt(np.convolve(v ** 2, np.ones(win) / win, "same"))
env = np.minimum(1, rms / (np.percentile(rms[rms > 1e-3], 70) + 1e-9))
sm = np.zeros(N); acc = 0.0; step = 48
au, ad = np.exp(-step / (0.06 * SR)), np.exp(-step / (0.5 * SR))
for i in range(0, N, step):
    e = env[i]; acc = au * acc + (1 - au) * e if e > acc else ad * acc + (1 - ad) * e
    sm[i:i + step] = acc
duck = 1 - 0.5 * sm

mix = np.stack([L, R], 1) * (curve * duck)[:, None]
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.1)
mix *= 0.07  # bem no fundo (~15 dB abaixo da voz)
out = os.path.join(ROOT, "public", "diego", "musica.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", out)
