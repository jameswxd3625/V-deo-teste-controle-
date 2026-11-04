# Diego Mudanças: "O próximo capítulo" (versão 2)

Filme publicitário vertical 9:16, 1080×1920, 30 fps, 62 s, **sem música**.

**Entrega:** `diego/out/DiegoMudancas_ProximoCapitulo_v2_1080x1920.mp4` (H.264 + AAC)

## O que mudou na v2
- **Base visual reconstruída**
  - Objetos, ambientes e caminhão agora são 3D com perspectiva real (CSS 3D, sem WebGL):
    - abas das caixas dobram nas dobradiças;
    - capa e páginas do álbum giram sobre a lombada;
    - portas do baú e da sala abrem no eixo;
    - rodas são cilindros;
    - a plotagem acompanha a superfície do baú.
  - Personagens refeitos (`diego/src/v2/Person.jsx`):
    - silhueta contínua, com ombros integrados ao tronco e sem articulações aparentes;
    - mangas que acompanham o braço, com dobras;
    - mãos com dedos e com poses de segurar, apoiar e polegar à frente;
    - cinemática inversa para levar as mãos exatamente até álbum, caixas e estante;
    - antebraços em escorço ao segurar objetos e postura que responde ao peso;
    - rosto com olhar dirigido.
- **Narrativa**
  - A lista vira ações: fechar e lacrar caixa com fita, cobrir o sofá, buscar transporte no celular, a pilha balançando.
  - Close das mãos retirando o álbum e pausa com luz quente.
  - Álbum em 3D com páginas e fotos dos mesmos personagens.
  - O álbum vai para a caixa "FRÁGIL" e acompanha a mudança até a estante da casa nova.
  - A equipe Diego cobre o sofá com a capa da marca, carrega o sofá e acomoda a caixa do álbum no baú.
  - Mapa 3D com o caminhão percorrendo a rota.
  - De dentro do baú, as portas se abrem para a casa nova.
  - O caminhão parte e suas ondas viram o encerramento da marca.
- **Legendas:** 30 unidades cobrindo toda a locução até 55,3 s, com destaque da palavra falada, posição conforme cada composição e fundo de contraste. A assinatura "Diego Mudanças." e o convite final aparecem como a própria tipografia do encerramento.
- **Som:** sem música. Ambiências (sala à noite, cidade distante, manhã com pássaros, rua, interior abafado do baú) e foley sincronizado com as ações. O ambiente é reduzido na pausa do álbum e baixa suavemente sob a voz.

## Projeto editável
```bash
npm ci
python3 -I tools/diego_brand.py          # selo, lettering e leão a partir do selo enviado
python3 tools/diego_audio2.py            # ambiências + foley -> diego/public/sfx2.wav
tools/diego_mix2.sh                      # mix final -> diego/public/mix2.wav (-14 LUFS, -1,5 dBTP)
npx remotion studio diego/src/index.jsx --public-dir=diego/public          # composição "DiegoFilm2"
npx remotion render diego/src/index.jsx DiegoFilm2 diego/out/_video2.mp4 --public-dir=diego/public --codec=h264 --crf=18 --muted
ffmpeg -i diego/out/_video2.mp4 -i diego/public/mix2.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart diego/out/DiegoMudancas_ProximoCapitulo_v2_1080x1920.mp4
```
Arquivos do projeto:
- **Motor 3D:** `diego/src/v2/three.jsx`.
- **Caminhão:** `Truck3D.jsx`.
- **Objetos:** `props3d.jsx`.
- **Ambientes:** `env3d.jsx`.
- **Personagens:** `Person.jsx`.
- **Planos:**
  - `s1_open.jsx` (0–14,5 s);
  - `s2_album.jsx` (14,5–31,5 s);
  - `s3_diego.jsx` (31,5–40,5 s);
  - `s4_end.jsx` (40,5–62 s).
- **Legendas:** `subs.jsx`.

A versão 1 continua disponível na composição `DiegoFilm`; a v2 é `DiegoFilm2`.

## Créditos
| Asset | Origem | Licença |
|---|---|---|
| Selo, lettering e leão Diego Mudanças | Arquivos e prints do cliente | Propriedade do cliente |
| Locução | Arquivo do cliente (ElevenLabs, voz "Will") | Conforme a conta do cliente |
| "50 RPG sound effects" (livro, tecido, porta, passos, trava, rangidos) | Kenney, via OpenGameArt | CC0 |
| "10 Book Page Flips" | starninjas, via OpenGameArt | CC0 |
| "100 CC0 SFX" e "100 CC0 metal and wood SFX" | rubberduck, via OpenGameArt | CC0 |
| "202 More Sound Effects" (tecido, plástico, velcro) | Owlish Media, via OpenGameArt | CC0 |
| "Ambient Bird Sounds" | isaiah658, via OpenGameArt | CC0 |
| "Park ambiences" (pássaros, vento; trechos de 30 s) | thimras, via OpenGameArt | CC0 |
| Tom de sala, cidade distante, fita adesiva, motor, freio, whooshes | Sintetizados (`tools/diego_audio.py`, `tools/diego_audio2.py`) | Originais |
| Fonte Montserrat | Julieta Ulanovsky et al. (@fontsource/montserrat) | SIL OFL 1.1 |
| Personagens, objetos, caminhão e cenários | Construídos em código para o projeto | Originais |
| Remotion | remotion.dev | Licença Remotion |

A trilha "Reunited" (Kevin MacLeod) foi usada só na v1. A v2 não tem música.
Os personagens são fictícios; a equipe uniformizada é genérica.
