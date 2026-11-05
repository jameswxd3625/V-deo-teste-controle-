#!/bin/bash
# Publica a pasta site/ no GitHub Pages (branch gh-pages).
# Endereço: https://jameswxd3625.github.io/V-deo-teste-controle-/
set -e
cd "$(dirname "$0")/.."
TMP=$(mktemp -d); cp -r site/. "$TMP"/; rm -f "$TMP/LEIA-ME.md"; touch "$TMP/.nojekyll"
URL=$(git remote get-url origin)
cd "$TMP" && git init -q -b gh-pages && git add -A && git commit -q -m "Publicação do site" && git push -f -q "$URL" gh-pages
echo "Publicado: https://jameswxd3625.github.io/V-deo-teste-controle-/"
