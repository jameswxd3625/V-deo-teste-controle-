# Contexto do site Diego Mudanças (para continuar em outro chat)

## Links
- Site no ar: https://jameswxd3625.github.io/V-deo-teste-controle-/
- Versões anteriores (comparar): https://jameswxd3625.github.io/V-deo-teste-controle-/versoes/
- Repositório GitHub: jameswxd3625/V-deo-teste-controle-
  - Branch de trabalho: `ccr-ddf498f9-9jexgk` (também espelhado em `ccr-32449aa5-tt0b84`, a branch padrão)
  - Branch publicada (GitHub Pages): `gh-pages`, que contém a pasta `site/` na raiz e mais a pasta `versoes/`

## A empresa
- Diego Mudanças, de Belo Horizonte e região. Instagram @diegomudancasbh, WhatsApp (31) 98120-3121, site diegomudancas.com.br (domínio ainda não apontado).
- Serviços: mudanças residenciais e comerciais, intermunicipais e interestaduais, embalagem completa (frágeis um a um), capa acolchoada azul para cada móvel e guarda-móveis.
- Lemas: "Conectando destinos, transportando recomeços" e "Servir a Deus tem nos feito muito bem!" (este está pintado nos caminhões).
- Identidade: azul-marinho, azul intenso, ciano e branco; logo com o leão azul e o letreiro DiEGO MUDANÇAS; fonte Montserrat (títulos em 900, com destaque em itálico).
- Cliente real: seu Daniel, que morou 30 anos na mesma casa. Citações dele: "Mas na hora que eu cheguei, meus amigos… dá uma tranquilidade" e "Do jeito que veio, chegou" (sobre a cristaleira e a mesa de mármore). O vídeo é o `media/ig/video-06.mp4`.

## Versão atual no ar (base: "Versão 2", escura)
1. **Abertura:** foto da sede com dois caminhões (`site/media/hero/sede.webp`). No desktop ela fica à direita, fundida ao azul por máscara; no celular, em cima do texto. Título "Conectando destinos, transportando recomeços.", botões "Pedir orçamento" e "Ver como funciona" e os selos.
   - Observação: essa foto parece gerada por IA. Já avisei o usuário.
2. **Serviços:** composições animadas feitas em Remotion. Ficaram três: "Residenciais e comerciais" (casa formada por caixas), "Embalagem completa" (capa vestindo uma poltrona) e "Guarda-móveis". O cartão "Transporte" foi removido a pedido.
3. **Como funciona:** animação do percurso, origem → caminhão → destino. Tocar numa etapa leva a animação até ela. O usuário gosta muito dessa parte.
4. **Proteção:** "Uma capa para cada móvel", animação em Remotion de uma geladeira, um sofá e uma cama recebendo a capa. Embaixo, uma galeria de artes do Instagram.
5. **Por que confiar:** "Gente de verdade, caminhões da casa". Ficaram só o lema e o link do Instagram; os blocos "Frota própria" e "Equipe especializada" foram removidos a pedido.
6. **Vídeos:** trilho com 14 vídeos reais (Instagram e filmes), que só tocam quando a pessoa toca.
7. **Dúvidas:** 6 perguntas, com respostas tiradas dos vídeos da equipe.
8. **Orçamento:** formulário que abre o WhatsApp com a mensagem pronta, para a pessoa revisar antes de enviar.
- Também tem: menu do celular, botão flutuante do WhatsApp, modo de movimento reduzido e os contatos em `site/config.js`.

## Preferências do usuário (importante)
- Quer resultado de nível profissional. Acessa pelo celular e pede respostas diretas, sem desperdício.
- Rejeitou:
  - vídeo na abertura;
  - foto do caminhão na rua;
  - leão gigante de fundo;
  - ilustrações vetoriais com cara de desenho (sofá ou caminhão desenhados) como peça principal;
  - estilo editorial claro (papel e serifa);
  - estilo "galeria preta" (inspirado no guia de estilo da Apple que ele mandou), achou feio;
  - cartões em leque com três fotos na abertura.
- Gostou: da versão 2 (escura, azul, Montserrat), da animação do percurso e da ideia da capa vestindo os móveis.
- Pediu para não inventar depoimentos, números nem promessas.

## Como editar e publicar
- Arquivos do site: `site/index.html`, `site/style.css`, `site/main.js`, `site/config.js`, `site/media/`, `site/assets/`.
- Animações em Remotion: `src/site/Scenes.jsx` (serviços, proteção, abertura antiga), `src/site/SiteLoops.jsx` (jornada) e `src/site/HeroReal.jsx`. As composições estão registradas em `src/index.jsx`.
- Para publicar sem perder `versoes/`: monte uma pasta temporária com o conteúdo de `site/` (sem o LEIA-ME), mais a pasta `versoes/` vinda da branch `gh-pages` e um arquivo `.nojekyll`, e faça push forçado para `gh-pages`. O script `scripts/publicar_site.sh` publica só o `site/` e apaga a pasta `versoes/`.

## Pendências e ideias
- Apontar o domínio diegomudancas.com.br (falta saber onde ele está registrado).
- Material original em alta resolução, sobretudo o vídeo do seu Daniel, que hoje está em 480p.
- Confirmar se a foto da sede é real ou se precisa ser trocada.

## Atualização: direção de arte própria (versão atual)
- Paleta tirada da empresa: marinho do letreiro, azul royal da capa, ciano do uniforme e o alumínio branco do baú. Seções alternam marinho e alumínio.
- Sem brilhos, partículas ou neon; títulos sem itálico/degradê (itálico só no lema "Servir a Deus tem nos feito muito bem!", no rodapé).
- Serviços com fotos reais tiradas dos vídeos da equipe (`site/media/fotos/`).
- Animações novas em Remotion (`src/site/Craft.jsx`): `CoverFridge`, `CoverSofa`, `CoverBed` e `Route`. Vídeos em `site/media/anim/`.
- Foto da sede: textos ilegíveis corrigidos (arroba no capô, letreiros pequenos) e placas desfocadas.
- Sem GSAP: JS próprio em `site/main.js`. Menu fechado usa `hidden` (não captura cliques).
- Seção "Gente de verdade, caminhões da casa" removida.

## Atualização: cenas 3D e Experiência
- Cenas 3D em Remotion + three.js (`src/three/`): `P3Geladeira`, `P3Sofa`, `P3Cama` (dois funcionários colocam a capa; IK de braços e pernas; capa deformável em `cover.js`; coreografias em `plans.js`) e `Route3D` (bairro e caminhão da frota).
- Renderizar: `npx remotion render src/index.jsx P3Geladeira out/3d/P3Geladeira.mp4 --gl=swangle`. Vídeos do site em `site/media/anim/` (p3-*.mp4, rota3d.mp4 e pôsteres -inicio/-fim).
- Rota começa sozinha com 60% da cena visível e pausa fora da tela; proteção começa no toque ("Proteger minha geladeira").
- Nova seção "Experiência" (#experiencia) com o depoimento do seu Daniel.
- Fotos dos serviços em `site/media/fotos/` (recortes próprios para desktop e celular). Foto do guarda-móveis enviada pelo usuário (parece gerada por IA).
