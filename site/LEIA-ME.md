# Site Diego Mudanças

Site estático (HTML + CSS + JS, sem build). **No ar em:** https://jameswxd3625.github.io/V-deo-teste-controle-/ (publicar alterações: `scripts/publicar_site.sh`).

Para outra hospedagem, publique a pasta `site/` (Hostinger, Netlify, Vercel...).

## Editar
- **Contatos:** `config.js` (WhatsApp, Instagram, site, cidade). O botão, o formulário e o rodapé usam esses dados.
- **Textos:** `index.html`.
- **Vídeos da seção "Veja a Diego em ação":** lista no início de "trilho de vídeos reais" em `main.js` (arquivo, título, subtítulo, selo).

## Animações
As animações da abertura, de "Como funciona" e de "Proteção em camadas" foram feitas em Remotion (`src/site/SiteLoops.jsx`, composições `SiteHeroDesktop`, `SiteHeroMobile`, `SiteJourney`, `SiteProtect`) e exportadas como vídeos leves em `media/loops/`. Os passos ao lado das animações acendem sincronizados com elas, e tocar num passo leva a animação até ele.

Para gerar de novo (na raiz do projeto):
```bash
npx remotion render src/index.jsx SiteJourney site/media/loops/_jornada.mp4 --scale=0.75 --muted
ffmpeg -i site/media/loops/_jornada.mp4 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -an -movflags +faststart site/media/loops/jornada.mp4
```

## Acessibilidade e desempenho
- Quem prefere movimento reduzido vê imagens estáticas no lugar das animações. As animações também têm botão de pausa.
- Os vídeos só tocam quando aparecem na tela; os vídeos do trilho só carregam quando a pessoa toca em play.
- As fontes foram reduzidas a 16 KB cada (WOFF2) e as imagens estão em WebP.
