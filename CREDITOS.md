# Anúncio Conttrole Contabilidade — projeto e créditos

**Entrega:** `out/Conttrole_Anuncio_1080x1920.mp4` (1080×1920, 9:16, 30 fps, H.264 + AAC, 30 s)

## Como editar e renderizar
```bash
npm ci
python3 -I tools/audio.py public        # trilha (music.wav) e efeitos (sfx.wav)
tools/mix.sh                            # mix final -> public/mix.wav (-14 LUFS, -1,5 dBTP)
npx remotion studio src/index.jsx       # composição "ConttroleAd"
npx remotion render src/index.jsx ConttroleAd out/_video.mp4 --gl=swangle --codec=h264 --crf=14 --muted
ffmpeg -i out/_video.mp4 -i public/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/Conttrole_Anuncio_1080x1920.mp4
```
- Cenas e tempos: `src/ad/Ad.jsx` (tempos em segundos, sincronizados com `src/words.json`)
- Medidor 12% (anel → barra, proporção 12/100 preservada): `src/ad/Meter.jsx`
- Moedas 3D (three.js, geometria torneada + símbolo extrudado, PBR metálico): `src/ad/Coins3D.jsx`
- Ícones/escudo/fachada vetoriais: `src/ad/icons.jsx`
- Logo com alfa: `public/logo_alpha.png`, gerada a partir da logo enviada por `tools/key_logo.py` (chave de luminância contra o fundo navy, sem redesenho)

## Créditos dos assets
| Asset | Origem | Licença |
|---|---|---|
| Logo Conttrole Contabilidade | Arquivo do cliente | Propriedade do cliente |
| Locução | Arquivo do cliente (ElevenLabs, voz "Jessica") | Conforme conta do cliente |
| Fonte Montserrat | Julieta Ulanovsky et al., via @fontsource/montserrat | SIL Open Font License 1.1 (`public/fonts/OFL-Montserrat.txt`) |
| Fonte Helvetiker Bold (símbolos $ e % das moedas 3D) | three.js examples | MAGENTA Ltd. (MgOpen), licença permissiva incluída em three/examples/fonts/LICENSE |
| three.js, @react-three/fiber, Remotion | npm | MIT (three, r3f); Remotion: licença Remotion (gratuita p/ indivíduos e empresas de até 3 pessoas) |
| Trilha musical e efeitos sonoros | Sintetizados para este projeto (`tools/audio.py`) | Originais, sem terceiros |
| Ícones, escudo, fachada, gráficos | Desenhados em código para este projeto | Originais |
