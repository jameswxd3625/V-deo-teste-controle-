# Site Diego Mudanças

Site estático (HTML + CSS + JS, sem build). **No ar em:** https://jameswxd3625.github.io/V-deo-teste-controle-/ (publicar alterações: `scripts/publicar_site.sh`).

Para outra hospedagem, publique a pasta `site/` (Hostinger, Netlify, Vercel...).

## Editar
- **Contatos:** `config.js` (WhatsApp, Instagram, site, cidade). O botão, o formulário e o rodapé usam esses dados.
- **Textos:** `index.html`.
- **Vídeos da seção "Veja a Diego em ação":** lista no início de "trilho de vídeos reais" em `main.js` (arquivo, título, subtítulo, selo).

## Animações (Remotion, em `src/site/`)
- Abertura: foto fixa `media/v3/abertura-final.webp` (quadro final de `HeroReal.jsx`, o vídeo foi retirado do site). A composição `HeroReal` continua no projeto: gesto real com papel (vídeo 04, 35,3 s), revelação do caminhão real (`public/diego/caminhao_rua.jpg`) e a rota que nasce da faixa azul da cabine.
- `Scenes.jsx` (composição `ProtectV2`) → `media/v3/capas.mp4`: geladeira (0 s), sofá (4,6 s), cama (9,2 s) e o detalhe real da capa (13,8 s). Os botões Geladeira · Sofá · Cama usam esses tempos.
- `Scenes.jsx` (`SvHome`, `SvWrap`, `SvTruck`, `SvStorage`) → `media/v2/sv-*.mp4`, vídeos dos serviços.
- `SiteLoops.jsx` (`SiteJourney`) → `media/loops/jornada.mp4`, o percurso de "Como funciona".
- História do seu Daniel: `media/v3/historia-daniel.mp4`, trecho de 3,4 s a 35,4 s do vídeo 06, com som e legendas originais.

Renderizar de novo (na raiz do projeto):
```bash
npx remotion render src/index.jsx HeroReal site/media/v3/_a.mp4 --scale=0.75 --muted
ffmpeg -i site/media/v3/_a.mp4 -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -an -movflags +faststart site/media/v3/abertura.mp4
./scripts/publicar_site.sh
```

## Acessibilidade e desempenho
- Quem prefere movimento reduzido vê imagens estáticas no lugar das animações. As animações também têm botão de pausa.
- Os vídeos só tocam quando aparecem na tela; os vídeos do trilho só carregam quando a pessoa toca em play.
- As fontes foram reduzidas a 16 KB cada (WOFF2) e as imagens estão em WebP.
