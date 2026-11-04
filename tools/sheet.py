import sys, glob
from PIL import Image, ImageDraw
fs = sorted(glob.glob(sys.argv[1] + "/f*.png")); out = sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
ims = [Image.open(f).convert("RGB") for f in fs]; w, h = ims[0].size; tw = 360; th = int(h * tw / w)
rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (cols * tw, rows * th), (0, 0, 0)); d = ImageDraw.Draw(S)
for i, (im, f) in enumerate(zip(ims, fs)):
    x, y = (i % cols) * tw, (i // cols) * th; S.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
    fr = int(f.split("/f")[-1][:4]); d.text((x + 6, y + 6), f"{fr} ({fr/30:.2f}s)", fill=(255, 80, 80))
S.save(out)
