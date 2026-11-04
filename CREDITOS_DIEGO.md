# Diego Mudanças: créditos e projeto

**Vídeo final:** `out/DiegoMudancas_1080x1920.mp4` (vertical 9:16, 1080×1920, 30 fps, 62 s, H.264 + AAC)

## Materiais utilizados

| Material | Origem | Uso |
|---|---|---|
| Nova logo quadrada (`public/diego/logo_diego.png`) | Enviada pelo cliente | Fonte da versão em camadas sem fundo branco: `logo_letreiro.png` (letreiro em versão branca), `logo_ondas.png` (ondas) e `leao.png` alinhado, gerados por `scripts/diego_logo_camadas.py`. Usada na apresentação da marca, na etiqueta da capa do álbum e no encerramento, com proporções preservadas |
| Leão sem fundo (`leao.png`) | Enviado pelo cliente | Camada independente: abertura (discreto), revelação por passagem de luz antes da marca e horizonte do mapa |
| Personagem Paulo (`paulo.png`) | Enviado pelo cliente | Apresentação "Esse aqui é o Paulo" e retorno em "Assim como o Paulo" |
| Caminhões plotados (`caminhoes.jpg`) | Post "Seja bem-vindo, Novembro" (@diegomudancasbh), plotagem original sem alterações | Cena "Veja nossos caminhões" (proporção original 1272×482) |
| Proteção (`diego_protecao.jpg`) | Recorte do Reels "A geladeira" (@diegomudancasbh), enquadrado acima da etiqueta antiga "Diego Fretes BH" | Carrossel: PROTEÇÃO |
| Capas de proteção (`capas.jpg`) | Recorte do post "Mudança sem dor de cabeça" (@diegomudancasbh) | Carrossel: ORGANIZAÇÃO |
| Locução (`locucao.mp3`) | Enviada pelo cliente (ElevenLabs, voz "Will") | Áudio principal, sem cortes nem alteração de velocidade |
| Casa ao entardecer (`u_casa.jpg`) | Unsplash, foto `photo-1494526585095-c41746248156` | Álbum: "a nossa casa" |
| Brinde/celebração (`u_conquistas.jpg`) | Unsplash, foto `photo-1527529482837-4698179dc6ce` | Álbum: "conquistas" |
| Família na praia (`u_familia.jpg`) | Unsplash, foto `photo-1511895426328-dc8714191300` | Álbum: "família" |
| Casa com sol (`u_casa2.jpg`) | Unsplash, foto `photo-1449844908441-8829872d2607` | Álbum: "nosso endereço" |
| Casal na cozinha (`u_cozinha.jpg`) | Unsplash, foto `photo-1556909114-f6e7ad7d3136` | Álbum: "domingos" |
| Sala da nova casa (`u_novacasa.jpg`) | Unsplash, foto `photo-1513694203232-719a280e022f` | Chegada na nova casa |
| Trilha eletrônica minimalista (`musica.wav`) | Composta e sintetizada para o projeto (`scripts/diego_musica.py`) | Pad que "respira", arpejo filtrado, pulso grave suave e ticks digitais, a 95,4 BPM, com compassos que caem nas revelações da marca. Fica cerca de 15 dB abaixo da voz e abaixa sozinha durante a fala |
| Fontes Montserrat e Caveat | Google Fonts (SIL Open Font License) | Tipografia |
| Efeitos sonoros (`sfx.wav`) | Sintetizados para o projeto (`scripts/diego_sfx.py`) | Paleta premium de interface: passagens de ar curtas, toques de vidro, bipes digitais, impactos graves suaves, brilhos e páginas |

As fotos do Unsplash seguem a [Licença Unsplash](https://unsplash.com/license): uso comercial gratuito, sem atribuição obrigatória. Cada foto pode ser consultada em `https://unsplash.com/photos/<id>`, ou pela imagem em `https://images.unsplash.com/<id>`.
O vídeo de referência serviu apenas para estudar a linguagem de movimento. Nenhum trecho dele foi incluído no filme.

## Projeto editável (Remotion)

- `src/diego/kit.jsx`: cores, fontes, easing, fundo com rede poligonal, faixas da marca, transição com ondas, ícones luminosos, caixa 3D, fotos e selos.
- `src/diego/Diego.jsx`: cenas sincronizadas com a locução, com tempos em segundos absolutos tirados de `src/diego_words.json`.
- `src/diego_words.json`: transcrição da locução com o tempo de cada palavra.
- `scripts/diego_logo_camadas.py`: separa a logo em camadas (letreiro, ondas e posição do leão) em `src/diego/logo_layout.json`.
- `scripts/diego_sfx.py`: gera `public/diego/sfx.wav` a partir da lista de eventos sonoros.
- `scripts/stills.mjs`: gera quadros de teste. Exemplo: `node scripts/stills.mjs pasta 0.4 2.2 12.2`

### Comandos

```bash
npm install
python3 scripts/diego_sfx.py                     # efeitos (requer numpy)
python3 scripts/diego_musica.py                  # trilha ambiente (requer numpy e ffmpeg)
npx remotion studio src/index.jsx                # edição/preview (composição "DiegoMudancas")
npx remotion render src/index.jsx DiegoMudancas out/_raw.mp4 --crf=18 --audio-bitrate=256k
# normalização para redes sociais (-15 LUFS), vídeo copiado sem recompressão
ffmpeg -i out/_raw.mp4 -c:v copy -af loudnorm=I=-15:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 256k out/DiegoMudancas_1080x1920.mp4
```
