#!/usr/bin/env python3
"""Gera a versão publicada do site (leve): CSS e config embutidos no HTML, JS e CSS minificados.
Uso: python3 scripts/publicar_site.py <pasta-de-destino>   (requer: pip install rcssmin rjsmin)"""
import sys, os, re, shutil, hashlib, rcssmin, rjsmin
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")
DST = sys.argv[1]
for d, _, fs in os.walk(SRC):
    for f in fs:
        if f in ("LEIA-ME.md",): continue
        s = os.path.join(d, f); t = os.path.join(DST, os.path.relpath(s, SRC))
        os.makedirs(os.path.dirname(t), exist_ok=True)
        if not os.path.exists(t) or open(s, "rb").read() != open(t, "rb").read(): shutil.copy2(s, t)
rd = lambda n: open(os.path.join(SRC, n), encoding="utf-8").read()
html, css, cfg, js = rd("index.html"), rd("style.css"), rd("config.js"), rd("main.js")
js = rjsmin.jsmin(js); css = rcssmin.cssmin(css)
open(os.path.join(DST, "main.js"), "w", encoding="utf-8").write(js)
open(os.path.join(DST, "style.css"), "w", encoding="utf-8").write(css)
v = hashlib.md5(js.encode()).hexdigest()[:8]
a = '<link rel="stylesheet" href="style.css">'; assert a in html
html = html.replace(a, "<style>" + css + "</style>")
a = '<script src="config.js"></script>'; assert a in html
html = html.replace(a, "<script>" + rjsmin.jsmin(cfg) + "</script>")
a = '<script src="main.js" defer></script>'; assert a in html
html = html.replace(a, '<script src="main.js?v=%s" defer></script>' % v)
html = re.sub(r"\n\s+", "\n", html)
open(os.path.join(DST, "index.html"), "w", encoding="utf-8").write(html)
print("publicado em", DST, "| html", len(html) // 1024, "KB | js", len(js) // 1024, "KB | v=" + v)
