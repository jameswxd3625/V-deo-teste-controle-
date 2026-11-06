/* Diego Mudanças: comportamento do site, sem bibliotecas. */
(function () {
  "use strict";
  var D = window.DIEGO || {}, doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = doc.classList.contains("rm");

  /* contatos */
  var waUrl = function (t) { return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(t); };
  $$("[data-wa-msg]").forEach(function (a) { a.href = waUrl(a.getAttribute("data-wa-msg")); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa-label]").forEach(function (a) { a.textContent = "WhatsApp " + D.whatsappLabel; });
  $$("[data-ig]").forEach(function (a) { a.href = "https://www.instagram.com/" + D.instagram; });
  $$("[data-ig-label]").forEach(function (a) { a.textContent = "@" + D.instagram; });
  $$("[data-cidade]").forEach(function (a) { a.textContent = D.cidade; });
  $$("[data-ano]").forEach(function (a) { a.textContent = new Date().getFullYear(); });

  /* menu: quando fechado, fica com hidden (display:none), então não captura cliques */
  var mb = $(".menu-btn"), sheet = $("#menu");
  function setMenu(open) {
    mb.setAttribute("aria-expanded", open ? "true" : "false");
    mb.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    sheet.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }
  mb.addEventListener("click", function () { setMenu(sheet.hidden); });
  $$("a", sheet).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && !sheet.hidden) { setMenu(false); mb.focus(); } });
  matchMedia("(min-width:1061px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  /* link ativo no menu e botão flutuante */
  var navA = $$(".nav a");
  var so = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) navA.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); });
  }, {rootMargin: "-45% 0px -50% 0px"});
  $$("main section[id]").forEach(function (s) { so.observe(s); });
  var fab = $(".wa-fab"), hero = $(".hero"), quote = $("#orcamento"), heroOut = false, quoteIn = false;
  function fabUpd() { fab.classList.toggle("show", heroOut && !quoteIn); }
  new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; fabUpd(); }).observe(hero);
  new IntersectionObserver(function (es) { quoteIn = es[0].isIntersecting; fabUpd(); }, {threshold: 0.15}).observe(quote);

  /* entrada suave */
  var rvs = $$(".sec-head, .sv, .real figure, .cli > *, .faq-list, .form, .quote-l");
  rvs.forEach(function (el) { el.classList.add("rv"); });
  var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }); }, {rootMargin: "0px 0px -8% 0px"});
  rvs.forEach(function (el) { ro.observe(el); });

  /* animações: tocam só visíveis; podem ser pausadas; com movimento reduzido, só tocam se a pessoa pedir */
  function load(v) { if (!v.getAttribute("src")) { v.src = v.dataset.src; } }
  function play(v) { load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  function setBtn(btn, playing, labelPlay, labelPause, iconPlay) {
    btn.setAttribute("aria-label", playing ? labelPause : labelPlay);
    $("use", btn).setAttribute("href", playing ? "#i-pause" : (iconPlay || "#i-play"));
  }

  /* rota: em loop, etapas acompanham o vídeo */
  var rv = $("#routeVideo"), rBtn = $('[data-for="routeVideo"]'), rLbl = $(".ctrl-l", rBtn.parentNode), steps = $$("#routeSteps li"), userPaused = reduced, rVisible = false;
  var T = steps.map(function (li) { return parseFloat(li.dataset.t); });
  function stepAt(t) { var k = 0; T.forEach(function (x, i) { if (t >= x) k = i; }); return k; }
  function markStep(k) { steps.forEach(function (li, i) { li.classList.toggle("on", i === k); }); }
  markStep(reduced ? -1 : 0);
  rv.addEventListener("timeupdate", function () { markStep(stepAt(rv.currentTime)); });
  function rSync() { setBtn(rBtn, !rv.paused, "Reproduzir animação", "Pausar animação"); rLbl.textContent = rv.paused ? "Animação pausada" : "Animação do percurso"; }
  rv.addEventListener("play", rSync); rv.addEventListener("pause", rSync);
  setBtn(rBtn, false, "Reproduzir animação", "Pausar animação"); rLbl.textContent = reduced ? "Toque para ver a animação" : "Animação do percurso";
  rBtn.addEventListener("click", function () { if (rv.paused) { userPaused = false; play(rv); } else { userPaused = true; rv.pause(); } });
  new IntersectionObserver(function (es) { rVisible = es[0].isIntersecting; if (rVisible && !userPaused) play(rv); else if (!rVisible) rv.pause(); }, {threshold: 0.4}).observe(rv);
  steps.forEach(function (li, i) {
    $("button", li).addEventListener("click", function () {
      load(rv); markStep(i);
      var go = function () { rv.currentTime = T[i] + 0.05; if (!userPaused) play(rv); };
      if (rv.readyState >= 1) go(); else rv.addEventListener("loadedmetadata", go, {once: true});
    });
  });

  /* proteção: uma peça por vez */
  var PROT = {
    geladeira: {t: "Capa acolchoada, plástico stretch por cima e a frente identificada. Na descida, todo o cuidado para que ela não sofra impacto.", a: "a geladeira recebe a capa acolchoada da Diego e o plástico stretch"},
    sofa: {t: "A capa envolve braços, assento e encosto. Por cima, o plástico stretch mantém a capa firme no lugar até a casa nova.", a: "o sofá recebe a capa acolchoada da Diego e o plástico stretch"},
    cama: {t: "Base e colchão recebem a capa acolchoada e o plástico stretch antes de sair do quarto.", a: "a cama box recebe a capa acolchoada da Diego e o plástico stretch"}
  };
  var pv = $("#protVideo"), pBtn = $('[data-for="protVideo"]'), pLbl = $(".ctrl-l", pBtn.parentNode), tabs = $$('[role="tab"]'), ptext = $("#protText"), panel = $("#p-prot"), pSeen = false;
  function pSync() {
    if (pv.ended || (!pv.paused && false)) {}
    var playing = !pv.paused && !pv.ended;
    setBtn(pBtn, playing, pv.ended || pv.currentTime > 0 ? "Ver de novo" : "Reproduzir animação", "Pausar animação", pv.ended ? "#i-redo" : "#i-play");
    pLbl.textContent = playing ? "Pausar" : (pv.ended ? "Ver de novo" : "Reproduzir");
  }
  ["play", "pause", "ended"].forEach(function (ev) { pv.addEventListener(ev, pSync); });
  pBtn.addEventListener("click", function () { if (!pv.paused && !pv.ended) pv.pause(); else { if (pv.ended) pv.currentTime = 0; play(pv); } });
  function choose(k, autoplay) {
    tabs.forEach(function (b) { var on = b.dataset.k === k; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on) panel.setAttribute("aria-labelledby", b.id); });
    ptext.textContent = PROT[k].t;
    pv.setAttribute("aria-label", "Animação: " + PROT[k].a);
    pv.poster = "media/anim/capa-" + k + (reduced ? "-fim" : "-inicio") + ".webp";
    pv.dataset.src = "media/anim/capa-" + k + ".mp4";
    pv.removeAttribute("src"); pv.load();
    if (autoplay && !reduced) play(pv); else pSync();
  }
  tabs.forEach(function (b, i) {
    b.addEventListener("click", function () { choose(b.dataset.k, true); });
    b.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); choose(n.dataset.k, true);
    });
  });
  if (reduced) pv.poster = "media/anim/capa-geladeira-fim.webp";
  pSync();
  new IntersectionObserver(function (es) {
    if (es[0].isIntersecting && !pSeen && !reduced) { pSeen = true; play(pv); }
    else if (!es[0].isIntersecting) pv.pause();
  }, {threshold: 0.5}).observe(pv);

  /* player em tela cheia */
  var player = $("#player"), fv = $("video", player), lastFocus = null;
  function openVideo(src) {
    lastFocus = document.activeElement; fv.src = src;
    if (player.showModal) player.showModal(); else player.setAttribute("open", "");
    var p = fv.play(); if (p && p.catch) p.catch(function () {});
  }
  function closeVideo() { fv.pause(); fv.removeAttribute("src"); fv.load(); if (player.close) player.close(); else player.removeAttribute("open"); }
  $(".player-x").addEventListener("click", closeVideo);
  player.addEventListener("click", function (e) { if (e.target === player) closeVideo(); });
  player.addEventListener("close", function () { fv.pause(); if (lastFocus) lastFocus.focus(); });
  $$("[data-video]").forEach(function (b) { b.addEventListener("click", function () { openVideo(b.dataset.video); }); });

  /* vídeos: trilho com setas */
  var V = [
    ["media/ig/video-09", "Mais uma mudança entregue", "Palavra de cliente"],
    ["media/ig/video-02", "Como protegemos a geladeira", "Capa e plástico stretch"],
    ["media/ig/video-08", "Guarda-roupa embalado", "Capa e plástico stretch"],
    ["media/ig/video-01", "Guarda-móveis", "Proteção em camadas"],
    ["media/equipe-02-paqueta", "Equipe 02 em execução", "Bairro Paquetá, BH"],
    ["media/hora-de-descarregar", "Hora de descarregar", "Caminhão da frota"],
    ["media/ig/video-03", "Tudo em um só lugar", "Com o Diego"],
    ["media/ig/video-16", "Closet vazio, mudança pronta", "Antes e depois"],
    ["media/ig/video-05", "Uma nova fase na frota", "Novas plotagens"],
    ["media/ig/video-07", "Nossos caminhões", "Frota própria"],
    ["media/ig/video-25", "Bastidores", "Com o Diego"]
  ];
  var rail = $("#rail");
  rail.innerHTML = V.map(function (v) {
    return '<button class="vc" type="button" data-src="' + v[0] + '.mp4"><span class="th"><img src="' + v[0] + '.webp" alt="" loading="lazy" width="480" height="854"><span class="pl"><svg><use href="#i-play"/></svg></span></span><b>' + v[1] + "</b><span>" + v[2] + "</span></button>";
  }).join("");
  $$(".vc", rail).forEach(function (b) { b.setAttribute("aria-label", "Assistir: " + $("b", b).textContent); b.addEventListener("click", function () { openVideo(b.dataset.src); }); });
  var rn = $$(".rn");
  function railNav() { rn[0].disabled = rail.scrollLeft < 8; rn[1].disabled = rail.scrollLeft > rail.scrollWidth - rail.clientWidth - 8; }
  rn.forEach(function (b) { b.addEventListener("click", function () { rail.scrollBy({left: +b.dataset.dir * rail.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth"}); }); });
  rail.addEventListener("scroll", railNav, {passive: true}); addEventListener("resize", railNav); railNav();

  /* orçamento */
  var form = $("#form");
  function check(inp) { var ok = inp.value.trim().length > 1; inp.closest(".field").classList.toggle("bad", !ok); inp.setAttribute("aria-invalid", !ok); return ok; }
  $$("[required]", form).forEach(function (i) {
    i.addEventListener("blur", function () { if (i.value) check(i); });
    i.addEventListener("input", function () { if (i.closest(".bad")) check(i); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = $$("[required]", form).filter(function (i) { return !check(i); });
    if (bad.length) { bad[0].focus(); return; }
    var f = new FormData(form), g = function (k) { return (f.get(k) || "").trim(); };
    var t = "Olá! Meu nome é " + g("nome") + ".\nGostaria de um orçamento (" + f.get("tipo") + ").\nSaindo de: " + g("origem") + "\nIndo para: " + g("destino") +
      (g("itens") ? "\nPreciso levar: " + g("itens") : "") + (g("data") ? "\nData aproximada: " + g("data") : "") + "\n\n(Mensagem enviada pelo site)";
    var w = window.open(waUrl(t), "_blank"); if (w) w.opener = null; else location.href = waUrl(t);
  });
})();
