import sys, json
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[3] if len(sys.argv) > 3 else "small", device="cpu", compute_type="int8")
import subprocess, numpy as np
raw = subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-f","f32le","-ac","1","-ar","16000","-"],capture_output=True).stdout
audio = np.frombuffer(raw, np.float32)
segs, info = m.transcribe(audio, language="pt", word_timestamps=True, beam_size=5)
W = []
for s in segs:
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}")
    for w in s.words: W.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
json.dump(W, open(sys.argv[2], "w"), ensure_ascii=False)
