# Conttrole — filme "Pressão → Estrutura" (prévia 540×960)

Projeto: `src/conttrole/` (Remotion, composição-base 1080×1920 @30 fps, 888 quadros = 29,6 s).
Prévia: `npx remotion render src/conttrole/index.jsx Conttrole out/Conttrole_previa_540x960.mp4 --scale=0.5`
Final (quando aprovado): mesmo comando sem `--scale`.
Áudio: `bash build-audio.sh` gera `public/mix.wav` (narração master + trilha com ducking + efeitos).

## Mapa de cenas (s)
0–2,3 "12%" (anel = "O" da logo, fatia de 12%) · 2,3–7,9 piso infinito de meses (acúmulo/pressão) ·
7,9 varredura de luz → anéis colapsam em pontos · 8,9–13,1 três camadas analisadas (atividades/regime/operação) ·
13,2–16,9 grade: tecnologia → trajeto IA → estrutura contábil · 17–19,9 anel segmentado + seta ascendente ·
20–21,4 moldura "dentro da lei" · 21,6–24,4 pergunta / ponto de partida · 24,6–26 CNPJ · 26–29,6 trajetória conduz à logo.

## Fontes e licenças
- Narração: arquivo ElevenLabs fornecido pelo cliente (`public/narracao.mp3`), sem alteração de tempo/tom.
- Logo: arquivo oficial fornecido (`public/logo.png`).
- Trilha: "Ouroboros" — Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 4.0
  https://creativecommons.org/licenses/by/4.0/ — trecho a partir de 9,48 s. **Exige crédito na publicação.**
  Original: `assets/audio/Ouroboros_KevinMacLeod.mp3` (https://incompetech.com/music/royalty-free/mp3-royaltyfree/Ouroboros.mp3)
- Whoosh: "Air whoosh" — pyranostudios, OpenGameArt, CC0 (https://opengameart.org/content/air-whoosh)
- Impacto: "Impact" — qubodup, OpenGameArt, CC0 (https://opengameart.org/content/impact)
- Fonte: Montserrat (SIL OFL 1.1), via @fontsource — `public/fonts/`.

## v2 — "o faturamento e a fatia" (em andamento)
Projeto: `src/conttrole/Film2.jsx` + `engine3d.js` (3D próprio em SVG: perspectiva, luz, sombras, reflexo). Composição `ConttroleV2`.
Prova 0–8,5 s: `npx remotion render src/conttrole/index.jsx ConttroleV2 out/Conttrole_v2_prova_0-8s_540x960.mp4 --frames=0-254 --scale=0.5`
Áudio: `python3 build_audio2.py` -> `public/mix2.wav`.
- Efeitos de interface (corte, ticks mensais, encaixes): "Interface Sounds" — Kenney (www.kenney.nl), CC0 — `assets/audio/kenney_interface_CC0/`
  (https://opengameart.org/content/interface-sounds)

## v3 — prova 0–8,5 s (atual)
`src/conttrole/Film3.jsx` (composição `ConttroleV3`), áudio `python3 build_audio3.py` -> `public/mix3.wav`.
Render: `npx remotion render src/conttrole/index.jsx ConttroleV3 out/Conttrole_v3_prova_0-8s_540x960.mp4 --frames=0-254 --scale=0.5`
