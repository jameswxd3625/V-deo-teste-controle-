# Diego Mudanças: "O próximo capítulo"

Filme publicitário em 9:16, 1080×1920, 30 fps, 62 s.

**Entrega:** `diego/out/DiegoMudancas_ProximoCapitulo_1080x1920.mp4` (vídeo H.264 com áudio AAC)

## Roteiro visual (sincronizado à locução)
| Tempo | Fala | Imagem |
|---|---|---|
| 0–5 s | "Eu sei que você está pensando em se mudar… aquela lista" | Sala antiga ao entardecer, com a serra e a cidade na janela; entra o bloco "Lista da mudança". |
| 5,7–12,5 s | Caixas, móveis, transporte, "torcer pra dar certo" | Os itens são escritos na fala; as caixas caem no lugar e a pilha balança. |
| 13–19,4 s | "Esse aqui é o Paulo… álbum de família… parou por um instante" | Paulo segura a pilha, tira o álbum da caixa e para; a luz esquenta. |
| 19,6–31 s | "Não é só levar as coisas… casa… conquistas… construir… cuidado" | Close no álbum: capa abre, páginas com fotos (casa, formatura, pintura da casa), álbum fecha sob as mãos, vai para a caixa "FRÁGIL" e a caixa é lacrada com fita. |
| 31,5–36,5 s | "Na hora de escolher… conheça a Diego Mudanças" | A equipe uniformizada chega; a capa acolchoada azul se abre para a câmera com a marca. |
| 36,6–40,3 s | "Veja nossos caminhões, acompanhe nosso trabalho" | Caminhão com a pintura da marca; equipe carrega o sofá protegido e a caixa do álbum; as portas fecham. |
| 40,3–45 s | "De onde você está saindo, para onde vai, o que precisa levar" | Mapa com origem, rota, destino e itens. |
| 45–49 s | "Assim como o Paulo, você tem uma nova história pela frente" | O caminhão chega; de dentro do baú, as portas se abrem para a casa nova e a família. |
| 49–52,3 s | "O próximo capítulo da sua vida já tem endereço" | Paulo coloca o álbum na estante da casa nova. |
| 52,4–62 s | "Vamos conversar… Diego Mudanças… peça seu orçamento" | Ondas da marca, revelação do selo oficial e CTA com @diegomudancasbh e www.diegomudancas.com.br. |

Informações da marca usadas: o selo oficial; o lettering; o uniforme marinho com faixas; as capas acolchoadas azuis com a marca; a pintura do caminhão, com a frase "Servir a Deus tem nos feito muito bem!" e "Transporte com segurança e qualidade"; o Instagram e o site da bio. Não usei números de telefone, porque eles variam entre as artes; também não há depoimentos, garantias nem preços.

## Projeto editável
```bash
npm ci
python3 -I tools/diego_brand.py           # selo limpo, lettering e leão a partir do selo enviado
python3 tools/diego_audio.py              # efeitos + trilha -> diego/public/sfx.wav, music.wav
tools/diego_mix.sh                        # mix final -> diego/public/mix.wav (-14 LUFS, -1,5 dBTP)
npx remotion studio diego/src/index.jsx --public-dir=diego/public      # composição "DiegoFilm"
npx remotion render diego/src/index.jsx DiegoFilm diego/out/_video.mp4 --public-dir=diego/public --codec=h264 --crf=15 --muted
ffmpeg -i diego/out/_video.mp4 -i diego/public/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart diego/out/DiegoMudancas_ProximoCapitulo_1080x1920.mp4
```
- Cenas: `diego/src/s_old.jsx` (sala, lista, Paulo, álbum), `s_album.jsx`, `s_door.jsx`, `s_street.jsx` (caminhão e portas), `s_map.jsx`, `s_new.jsx` (chegada, ponto de vista de dentro do baú, novo lar), `s_brand.jsx`.
- Personagens articulados (Paulo, Ana, filha, equipe Diego): `diego/src/Character.jsx`. Objetos: `props.jsx`. Caminhão: `Truck.jsx`.
- Tempos da fala: `diego/words.json`, transcrito com faster-whisper.

## Créditos
| Asset | Origem | Licença |
|---|---|---|
| Selo, lettering e leão Diego Mudanças | Arquivos e prints do cliente | Propriedade do cliente |
| Locução | Arquivo do cliente (ElevenLabs, voz "Will") | Conforme a conta do cliente |
| Trilha "Reunited" | Kevin MacLeod (incompetech.com) | Licenciado sob Creative Commons: By Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/) |
| Efeitos "50 RPG sound effects" (livro, tecido, porta, passos, trava, rangidos) | Kenney (kenney.nl), via OpenGameArt | CC0 |
| "10 Book Page Flips" | starninjas, via OpenGameArt | CC0 |
| "100 CC0 SFX" e "100 CC0 metal and wood SFX" (papel, plop, metal) | rubberduck, via OpenGameArt | CC0 |
| "202 More Sound Effects" (tecido, plástico) | Owlish Media, via OpenGameArt | CC0 |
| Ambiências, whooshes, fita adesiva, motor, sinos e pad final | Sintetizados para o projeto (`tools/diego_audio.py`) | Originais |
| Fonte Montserrat | Julieta Ulanovsky et al. (@fontsource/montserrat) | SIL OFL 1.1 |
| Ilustrações, personagens, cenários e caminhão | Desenhados em código para o projeto | Originais |
| Remotion | remotion.dev | Licença Remotion (gratuita para pessoas físicas e empresas com até 3 funcionários) |

Os personagens são fictícios. A equipe uniformizada é genérica e não retrata pessoas reais.
