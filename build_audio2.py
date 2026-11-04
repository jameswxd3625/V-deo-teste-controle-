#!/usr/bin/env python3
"""Mixagem v2 -> public/mix2.wav. Narração = master (só ganho). Trilha com ducking. Efeitos por ação."""
import subprocess, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
A = "assets/audio"
KN = f"{A}/kenney_interface_CC0"
DUR = 29.6
MOFF = 9.48  # virada da trilha (17,40 s) cai em 7,92 s ("Na Conttrole")

WH = "atrim=0.55:1.75,asetpts=PTS-STARTPTS,afade=t=in:d=0.25,afade=t=out:st=0.85:d=0.35"  # pico ~0,75 s
IMP = "atrim=3.48:4.4,asetpts=PTS-STARTPTS,afade=t=out:st=0.4:d=0.5"

cut_t = [3.42 + 0.95 * ((i - 1) / 10) ** 0.85 for i in range(1, 12)]
land_t = [5.72 + i * 0.075 + 0.42 for i in range(12)]

# (arquivo, filtro, ganho dB, instante)
EV = [
    (f"{A}/impact_qubodup_CC0.ogg", IMP + ",lowpass=f=380", -3, 0.0),          # abertura (grave, não mascara a voz)
    (f"{KN}/maximize_006.ogg", "highpass=f=900", -20, 0.02),                     # anel de luz descendo
    (f"{KN}/switch_002.ogg", "", -9, 0.29),                                      # corte de 12%
    (f"{A}/air-whoosh_pyranostudios_CC0.wav", WH, -20, -0.25),                   # fatia sobe
    (f"{A}/air-whoosh_pyranostudios_CC0.wav", WH, -15, 1.9),                     # câmera recua / meses surgem
    *[(f"{KN}/tick_002.ogg", "", -17 + (2 if i % 4 == 0 else 0), t) for i, t in enumerate(cut_t)],  # cortes mensais
    *[(f"{KN}/drop_00{1 + i % 4}.ogg", "lowpass=f=2500", -19 + i * 0.6, t) for i, t in enumerate(land_t[:-1])],  # fatias empilhando
    (f"{KN}/drop_004.ogg", "lowpass=f=2000", -9, land_t[-1]),
    (f"{A}/impact_qubodup_CC0.ogg", IMP + ",lowpass=f=300", -8, land_t[-1]),    # última fatia: peso
    (f"{A}/air-whoosh_pyranostudios_CC0.wav", WH, -9, 7.2),                      # varredura de luz (virada)
    # (restante do filme será redesenhado após aprovação da prova)
]

inputs = ["-i", "public/narracao.mp3", "-ss", str(MOFF), "-t", str(DUR), "-i", f"{A}/Ouroboros_KevinMacLeod.mp3"]
fc = [
    f"[0:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=8dB,apad=whole_dur={DUR},asplit=2[vo][key]",
    f"[1:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=-14dB,afade=t=in:d=0.25,afade=t=out:st=27.4:d=2.2[mus]",
    "[mus][key]sidechaincompress=threshold=0.04:ratio=5:attack=25:release=350:makeup=1[duck]",
]
labels = ["[vo]", "[duck]"]
for k, (f, flt, g, t) in enumerate(EV):
    inputs += ["-i", f]
    idx = k + 2
    trim = ""
    if t < 0:  # começa no meio do arquivo
        trim = f"atrim=start={-t},asetpts=PTS-STARTPTS,"
        t = 0
    ms = int(round(t * 1000))
    chain = f"[{idx}:a]aformat=sample_rates=44100:channel_layouts=stereo," + (flt + "," if flt else "") + trim + f"volume={g}dB,adelay={ms}|{ms}[e{k}]"
    fc.append(chain)
    labels.append(f"[e{k}]")
fc.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first,alimiter=limit=0.89:level=false[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", "[out]", "-t", str(DUR), "-ar", "44100", "public/mix2.wav"], check=True)
print("ok public/mix2.wav")
