#!/usr/bin/env python3
"""Mixagem v3 -> public/mix3.wav. Narração = master (só ganho). Trilha com ducking. Efeitos por ação."""
import subprocess, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
A = "assets/audio"
KN = f"{A}/kenney_interface_CC0"
DUR = 29.6
MOFF = 9.48  # virada da trilha (17,40 s) cai em 7,92 s ("Na Conttrole")

WH = "atrim=0.55:1.75,asetpts=PTS-STARTPTS,afade=t=in:d=0.25,afade=t=out:st=0.85:d=0.35"  # pico ~0,75 s
IMP = "atrim=3.48:4.4,asetpts=PTS-STARTPTS,afade=t=out:st=0.4:d=0.5"

cut_t = [3.46 + (i - 1) * 0.087 for i in range(1, 12)]

# (arquivo, filtro, ganho dB, instante) — cada efeito acompanha uma ação
EV = [
    (f"{A}/impact_qubodup_CC0.ogg", IMP + ",lowpass=f=380", -4, 0.0),           # abertura
    (f"{KN}/maximize_006.ogg", "highpass=f=900", -19, 0.1),                      # luz mede os 12%
    (f"{KN}/switch_002.ogg", "", -8, 0.46),                                      # corte
    (f"{A}/air-whoosh_pyranostudios_CC0.wav", WH, -19, -0.05),                   # pedaço se destaca
    (f"{A}/air-whoosh_pyranostudios_CC0.wav", WH, -15, 1.85),                    # câmera recua para o ano
    *[(f"{KN}/tick_002.ogg", "", -17 + (2 if i % 4 == 0 else 0), t) for i, t in enumerate(cut_t)],  # 11 cortes mensais
    (f"{A}/impact_qubodup_CC0.ogg", IMP + ",lowpass=f=250", -16, 5.62),          # linhas se fundem
    (f"{A}/air-whoosh_pyranostudios_CC0.wav", WH, -18, 4.85),                    # câmera gira
    (f"{A}/impact_qubodup_CC0.ogg", IMP + ",lowpass=f=300", -5, 7.06),          # bloco do ano cai
    (f"{KN}/drop_004.ogg", "lowpass=f=1800", -12, 7.06),
    (f"{A}/air-whoosh_pyranostudios_CC0.wav", WH, -9, 7.2),                      # varredura (virada)
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
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", "[out]", "-t", str(DUR), "-ar", "44100", "public/mix3.wav"], check=True)
print("ok public/mix3.wav")
