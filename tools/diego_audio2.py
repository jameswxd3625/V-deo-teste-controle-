# Som imersivo SEM música: ambiências + foley sincronizado às ações do filme v2.
# Saída: diego/public/sfx2.wav (48 kHz estéreo, 62 s)
import numpy as np, sys
sys.argv = [sys.argv[0]]
exec(open("tools/diego_audio.py").read().split("fx = np.zeros((N, 2))")[0])  # reaproveita funções (load, place, whoosh, tape_rip, engine...)
A = "diego/assets_src/sfx_used/"
def tick(f=2000, d=0.03):
    t = tt(d * 3); return np.sin(2 * np.pi * f * t) * np.exp(-t / d) * 0.5
def S(n): return load(A + n)
def seg(x, t0, d, fi=0.6, fo=0.8):
    y = x[int(t0 * SR): int((t0 + d) * SR)].copy(); n = len(y)
    e = np.ones(n); a, b = int(fi * SR), int(fo * SR)
    e[:a] = np.linspace(0, 1, a); e[-b:] = np.linspace(1, 0, b)
    return y * e[:, None]
def loopto(x, d):
    n = int(d * SR); reps = n // len(x) + 1
    return np.concatenate([x] * reps)[:n]
tline = np.arange(N) / SR
fx = np.zeros((N, 2)); amb = np.zeros((N, 2))

# ---------------- ambiências ----------------
room = ambience(31.5, 60, 700)                 # tom de sala (noite)
city = ambience(31.5, 120, 1400)               # cidade distante
gn = np.interp(tline[:len(room)], [0, 1, 17.0, 18.6, 19.6, 28.5, 31.0, 31.5], [0, 1, 1, 0.25, 0.18, 0.18, 0.35, 0])
amb[:len(room)] += room * 0.030 * gn[:, None] + city * 0.022 * gn[:, None]
for tc in (3.2, 9.6, 12.8):  # carros passando ao longe
    car = stft_noise(3.0, lambda t: 300 + 200 * np.sin(np.pi * t / 3), lambda t: 1.0, lambda t: np.sin(np.pi * t / 3) ** 2)
    place(amb, car, tc, 0.010, pan=-0.5 + (tc % 2) * 0.5)
birds = S("ambience/birds-isaiah658_0.ogg"); park = S("ambience/park_birds_30s.ogg"); wind = S("ambience/park_wind_30s.ogg")
place(amb, seg(birds, 0, 5.2), 31.4, 0.10, pan=-0.4)                     # manhã do dia da mudança (janela)
place(amb, ambience(5.2, 80, 900), 31.4, 0.02)
place(amb, seg(park, 0, 4.1, 0.2, 0.4), 36.5, 0.22)                       # rua
place(amb, seg(stft_noise(4.1, lambda t: 500, lambda t: 1.6, lambda t: 1.0)[:, None].repeat(2, 1), 0, 4.1, 0.2, 0.3), 36.5, 0.03)
place(amb, seg(wind, 0, 4.6, 0.3, 0.3), 40.45, 0.04)                      # mapa: só ar
place(amb, seg(park, 5, 1.5, 0.2, 0.3), 44.95, 0.2)                       # chegada
place(amb, seg(park, 8, 2.8, 0.05, 0.4), 46.4, 0.32)                      # portas abrem: pássaros entram
place(amb, ambience(1.0, 60, 400), 46.0, 0.03)                            # interior do baú abafado
place(amb, seg(birds, 8, 3.6, 0.3, 0.6), 48.9, 0.06, pan=-0.5)          # novo lar (janela aberta)
place(amb, ambience(3.6, 80, 1200), 48.9, 0.02)
place(amb, seg(park, 12, 1.8, 0.1, 0.8), 52.3, 0.18)                      # rua, caminhão partindo

# ---------------- foley ----------------
place(fx, S("100-CC0-SFX_0/paper_02.ogg"), 2.7, 0.18, r=1.1)               # lista
place(fx, S("100-CC0-SFX_0/paper_01.ogg"), 4.35, 0.10, r=1.3)
place(fx, S("100-CC0-SFX_0/paper_02.ogg"), 5.64, 0.30, r=0.75)             # abas da caixa
place(fx, S("100-CC0-SFX_0/paper_01.ogg"), 5.86, 0.28, r=0.7)
place(fx, tape_rip(0.7), 6.15, 0.30)                                       # fita
place(fx, S("RPGsounds_Kenney/OGG/dropLeather.ogg"), 6.86, 0.22, r=1.2)    # mão assenta a fita
place(fx, S("MoreSounds/Cloth/Cloth_03.wav"), 7.1, 0.45)                   # lençol
place(fx, whoosh(0.6, 150, 900, 0.4), 7.08, 0.10)
place(fx, S("RPGsounds_Kenney/OGG/cloth1.ogg"), 7.62, 0.25)
place(fx, whoosh(0.4, 500, 2500, 0.5), 8.55, 0.06)                         # celular entra
for at in (9.0, 9.35, 9.7): place(fx, tick(2600, 0.012), at, 0.10)        # toques na tela
place(fx, S("RPGsounds_Kenney/OGG/creak1.ogg"), 10.4, 0.16, pan=-0.4, r=0.8) # pilha range
place(fx, S("RPGsounds_Kenney/OGG/creak2.ogg"), 11.25, 0.22, pan=-0.4, r=0.72)
for i, at in enumerate([11.88, 12.04, 12.2]): place(fx, S(f"RPGsounds_Kenney/OGG/footstep0{i}.ogg"), at, 0.30, pan=0.4 - i * 0.2)
place(fx, S("RPGsounds_Kenney/OGG/dropLeather.ogg"), 12.3, 0.26, pan=-0.3, r=0.9)  # mão segura a caixa
place(fx, S("RPGsounds_Kenney/OGG/dropLeather.ogg"), 12.45, 0.18, pan=-0.3, r=0.65)
place(fx, S("100-CC0-SFX_0/paper_02.ogg"), 14.55, 0.28, pan=0.3, r=0.8)    # abas abrem
place(fx, S("MoreSounds/Plastic/Plastic_05.wav"), 15.15, 0.14, pan=0.3)    # papel amassado
place(fx, S("RPGsounds_Kenney/OGG/cloth2.ogg"), 15.0, 0.18)
place(fx, S("RPGsounds_Kenney/OGG/handleSmallLeather.ogg"), 16.25, 0.40)   # álbum sai da caixa
place(fx, S("MoreSounds/Plastic/Plastic_08.wav"), 16.4, 0.10)
place(fx, S("RPGsounds_Kenney/OGG/cloth3.ogg"), 17.45, 0.16)               # álbum junto ao peito
place(fx, S("RPGsounds_Kenney/OGG/bookOpen.ogg"), 19.68, 0.55)
place(fx, S("book_flips_-_starninjas/book_flip.3.ogg"), 19.62, 0.30)
place(fx, S("book_flips_-_starninjas/book_flip.5.ogg"), 24.28, 0.50)
place(fx, S("book_flips_-_starninjas/book_flip.7.ogg"), 28.95, 0.25)
place(fx, S("RPGsounds_Kenney/OGG/bookClose.ogg"), 29.55, 0.55)
place(fx, S("RPGsounds_Kenney/OGG/cloth4.ogg"), 29.5, 0.20)
place(fx, S("RPGsounds_Kenney/OGG/bookPlace1.ogg"), 30.72, 0.40, r=0.85)   # álbum no fundo da caixa
place(fx, S("100-CC0-SFX_0/paper_01.ogg"), 30.82, 0.35, r=0.72)            # abas fecham
place(fx, S("100-CC0-SFX_0/paper_02.ogg"), 30.98, 0.30, r=0.8)
place(fx, tape_rip(0.32), 31.12, 0.32)
place(fx, S("RPGsounds_Kenney/OGG/dropLeather.ogg"), 31.27, 0.30, r=1.35)  # etiqueta
place(fx, S("RPGsounds_Kenney/OGG/doorOpen_1.ogg"), 31.62, 0.45, pan=0.4)
for i, at in enumerate([32.2, 32.45, 32.62, 32.85, 33.05, 33.28]): place(fx, S(f"RPGsounds_Kenney/OGG/footstep0{(i % 6) + 3}.ogg"), at, 0.24, pan=0.5 - i * 0.08)
place(fx, S("MoreSounds/Cloth/Cloth_03.wav"), 34.5, 0.50)                  # capa Diego desce
place(fx, whoosh(0.7, 150, 900, 0.5), 34.5, 0.12)
place(fx, S("Velcro_01.wav"), 35.4, 0.20)                                  # ajuste da capa
place(fx, engine(3.9, 34, 33, lambda u: 1.0), 36.55, 0.020)               # motor em marcha lenta (distante)
for i, at in enumerate([38.35, 38.62, 38.9, 39.18]): place(fx, S(f"RPGsounds_Kenney/OGG/footstep0{i + 1}.ogg"), at, 0.16, r=0.9)
for i in range(3): place(fx, S("100-CC0-wood-metal-SFX/metal_sheet_0%d.ogg" % (i + 1)), 39.0 + i * 0.12, 0.035)
place(fx, S("RPGsounds_Kenney/OGG/dropLeather.ogg"), 39.6, 0.14, r=0.8)    # caixa acomodada
place(fx, S("RPGsounds_Kenney/OGG/creak3.ogg"), 39.75, 0.22, r=0.7)
place(fx, S("100-CC0-wood-metal-SFX/metal_close_01.ogg"), 40.12, 0.50)
place(fx, S("RPGsounds_Kenney/OGG/metalLatch.ogg"), 40.3, 0.45)
place(fx, whoosh(0.6, 250, 1800, 0.4), 40.4, 0.06)
place(fx, S("100-CC0-SFX_0/plop_01.ogg"), 41.15, 0.25, pan=-0.3)
place(fx, engine(1.2, 90, 110, lambda u: np.sin(np.pi * u)), 42.2, 0.012)
place(fx, S("100-CC0-SFX_0/plop_02.ogg"), 42.85, 0.25, pan=0.3)
for i, at in enumerate([44.2, 44.35, 44.5]): place(fx, S("100-CC0-SFX_0/plop_01.ogg"), at, 0.16, r=1.15 + i * 0.1, pan=[-0.3, 0.3, 0][i])
place(fx, engine(1.3, 75, 34, lambda u: (1 - u) ** 0.5), 44.9, 0.06)       # chegada, desaceleração
place(fx, fftfilt(rng.standard_normal(int(0.6 * SR)), lo=2000, hi=8000) * np.exp(-tt(0.6) * 5), 46.0, 0.035)  # freio a ar
place(fx, S("RPGsounds_Kenney/OGG/metalLatch.ogg"), 46.42, 0.45, r=0.9)
place(fx, S("RPGsounds_Kenney/OGG/creak2.ogg"), 46.55, 0.22, r=0.7)
place(fx, whoosh(0.7, 300, 2500, 0.7), 48.4, 0.10)
for i, at in enumerate([49.05, 49.35, 49.65]): place(fx, S(f"RPGsounds_Kenney/OGG/footstep0{i + 6}.ogg"), at, 0.18, r=1.05)
place(fx, S("RPGsounds_Kenney/OGG/bookPlace1.ogg"), 50.6, 0.55, pan=0.3)   # álbum na estante
place(fx, S("RPGsounds_Kenney/OGG/cloth1.ogg"), 50.9, 0.14)
place(fx, engine(1.9, 34, 70, lambda u: np.minimum(1, u * 3) * (1 - u) ** 0.7), 52.2, 0.07)  # caminhão parte
place(fx, whoosh(1.0, 150, 2200, 0.55), 52.5, 0.22)                       # ondas da marca
t2 = tt(2.0); place(fx, np.sin(2 * np.pi * 52 * t2) * np.exp(-t2 * 2.6) * (1 - np.exp(-t2 * 300)), 55.22, 0.10)
place(fx, chime([830.6, 1046.5, 1244.5, 1661.2], 3.5), 55.25, 0.035)
place(fx, S("100-CC0-SFX_0/plop_01.ogg"), 58.5, 0.22, r=0.9)
out = fftfilt(fx + amb, lo=25)
write("diego/public/sfx2.wav", out / max(1.0, np.max(np.abs(out)) / 0.9))
print("ok")
