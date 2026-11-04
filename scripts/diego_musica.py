"""Trilha ambiente minimalista (pads + notas esparsas), composta para o filme Diego Mudanças.
Sem bateria. Acordes acompanham os momentos da narração; a música abaixa sozinha sob a voz.
Gera public/diego/musica.wav (estéreo 48 kHz). Requer numpy e ffmpeg (para ler a locução).
Uso: python3 scripts/diego_musica.py
"""
import numpy as np, wave, os, subprocess

SR = 48000
DUR = 62.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(11)
ROOT = os.path.join(os.path.dirname(__file__), "..")


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------- acordes (tempo de início, notas MIDI) ----------
CH = {
    "Dmaj9": [38, 50, 54, 57, 61, 64], "D": [38, 50, 54, 57, 62, 66], "Bm7": [35, 47, 54, 57, 62, 66],
    "Gmaj7": [31, 43, 50, 54, 59, 62], "A": [33, 45, 52, 57, 61, 64], "Asus": [33, 45, 52, 57, 62, 64],
    "D/F#": [42, 50, 57, 62, 66], "A/C#": [37, 49, 52, 57, 61, 64], "Em7": [28, 40, 50, 55, 59, 62],
}
PROG = [(0.0, "Dmaj9"), (3.3, "Bm7"), (6.4, "Gmaj7"), (9.4, "A"), (12.4, "Gmaj7"), (15.8, "D/F#"),
        (17.5, "Bm7"), (19.6, "Gmaj7"), (23.1, "D"), (24.4, "A/C#"), (25.9, "Bm7"), (27.4, "Gmaj7"),
        (29.1, "Em7"), (30.85, "Asus"), (33.4, "A"), (35.16, "Dmaj9"), (38.4, "A/C#"), (40.4, "Bm7"),
        (42.6, "Gmaj7"), (44.6, "Asus"), (45.3, "Dmaj9"), (47.3, "Gmaj7"), (49.0, "Bm7"), (50.9, "A"),
        (52.4, "Gmaj7"), (54.4, "Asus"), (55.28, "Dmaj9")]

L = np.zeros(N); R = np.zeros(N)


def add(sig, start, gain, pan):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.cos((pan + 1) * np.pi / 4)
    R[i:i + len(sig)] += sig * np.sin((pan + 1) * np.pi / 4)


# ---------- pad: síntese aditiva com vozes levemente desafinadas ----------
def pad_note(f, d, bright):
    n = int(d * SR); tt = np.arange(n) / SR
    out = np.zeros(n)
    for det, ph in ((-0.004, 0.3), (0.0, 1.7), (0.0045, 4.1)):
        ff = f * (1 + det) * (1 + 0.0015 * np.sin(2 * np.pi * 0.21 * tt + ph))
        for h in range(1, 7):
            if f * h > 5000: break
            out += np.sin(2 * np.pi * ff * h * tt + ph * h) * (bright ** (h - 1)) / h ** 1.4
    return out


for k, (st, name) in enumerate(PROG):
    en = PROG[k + 1][0] if k + 1 < len(PROG) else DUR
    d = en - st + 1.6  # sobreposição para transição suave
    n = int(d * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 1.1) * np.clip((d - tt) / 1.5, 0, 1)
    bright = 0.42 if st < 31 else 0.5
    for j, m in enumerate(CH[name]):
        f = mtof(m)
        g = 0.55 if j == 0 else 0.22  # nota grave mais presente, como um drone
        sig = pad_note(f, d, 0.25 if j == 0 else bright) * env
        add(sig, max(0, st - 0.6), g / len(CH[name]), (-0.5 + j / max(1, len(CH[name]) - 1)) * 0.7)


# ---------- notas tipo piano abafado ----------
def pluck(f, vel):
    d = 3.2; n = int(d * SR); tt = np.arange(n) / SR
    a = np.minimum(1, tt / 0.006)
    s = (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 1.3) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.45)
         + 0.12 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt / 0.22))
    return s * a * vel


def chord_at(x):
    c = PROG[0][1]
    for st, name in PROG:
        if st <= x: c = name
    return c


def tones(name, lo=72, hi=86):
    ts = sorted({m + 12 * o for m in CH[name][1:] for o in range(-2, 4) if lo <= m + 12 * o <= hi})
    return ts


# densidade e registro por trecho (início, fim, intervalo, padrão)
SECT = [(0.6, 12.3, 1.6, "up"), (13.85, 19.4, 2.6, "down"), (19.7, 30.8, 1.15, "wave"), (31.2, 35.0, 0.85, "rise"),
        (36.6, 44.5, 0.42, "arp"), (45.4, 52.2, 1.3, "wave"), (52.5, 55.0, 1.2, "up"), (55.3, 60.5, 0.95, "bloom")]
for a, b, step, pat in SECT:
    x = a; i = 0
    while x < b:
        ts = tones(chord_at(x), 69 if pat == "arp" else 72, 81 if pat == "arp" else 86)
        if pat == "up": m = ts[i % len(ts)]
        elif pat == "down": m = ts[-1 - (i % len(ts))]
        elif pat == "rise": m = ts[min(i, len(ts) - 1)]
        elif pat == "arp": m = ts[[0, 2, 1, 3, 2, 4, 3, 1][i % 8] % len(ts)]
        elif pat == "bloom": m = ts[[0, 2, 4, 3, 5, 2][i % 6] % len(ts)]
        else: m = ts[[1, 3, 2, 4, 3, 1][i % 6] % len(ts)]
        vel = (0.10 if pat == "arp" else 0.18) * (0.8 + 0.4 * rng.random())
        add(pluck(mtof(m), vel), x + rng.normal(0, 0.012), 1.0, rng.uniform(-0.45, 0.45))
        x += step * (1 + (0.08 * rng.normal() if pat not in ("arp",) else 0)); i += 1

# ---------- reverberação (convolução com cauda difusa) ----------
def reverb(x, seed):
    n = int(3.8 * SR); tt = np.arange(n) / SR
    ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-tt / 1.05)
    ir = np.convolve(ir, np.ones(9) / 9, "same")  # cauda mais escura
    ir[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    ir /= np.sqrt((ir ** 2).sum())
    m = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
    return y

wetL, wetR = reverb(L, 1), reverb(R, 2)
L = 0.55 * L + 0.9 * wetL; R = 0.55 * R + 0.9 * wetR

# ---------- dinâmica por trecho ----------
curve = np.interp(t, [0, 1.5, 12.4, 13.5, 17.5, 19.6, 30.8, 33.0, 35.16, 36.5, 44.8, 45.5, 52.3, 54.8, 55.3, 59.6, 62],
                  [0, .55, .6, .5, .42, .62, .72, .8, 1.0, .78, .78, .7, .8, .85, 1.0, .95, 0])

# ---------- abaixa sob a voz (ducking) ----------
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "public/diego/locucao.mp3"), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
v = np.frombuffer(pcm, "<i2").astype(float) / 32768
v = np.pad(v, (0, max(0, N - len(v))))[:N]
win = int(0.05 * SR)
rms = np.sqrt(np.convolve(v ** 2, np.ones(win) / win, "same"))
env = np.minimum(1, rms / (np.percentile(rms[rms > 1e-3], 75) + 1e-9))
sm = np.zeros(N); a_up, a_dn = np.exp(-1 / (0.08 * SR)), np.exp(-1 / (0.45 * SR))
acc = 0.0
step = 48  # suavização em blocos para velocidade
for i in range(0, N, step):
    e = env[i]
    acc = (a_up ** step) * acc + (1 - a_up ** step) * e if e > acc else (a_dn ** step) * acc + (1 - a_dn ** step) * e
    sm[i:i + step] = acc
duck = 1 - 0.42 * sm

mix = np.stack([L, R], 1) * (curve * duck)[:, None]
mix = mix / (np.abs(mix).max() + 1e-9) * 0.095  # cerca de 13 dB abaixo da voz: fica no fundo
out = os.path.join(ROOT, "public", "diego", "musica.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", out)
