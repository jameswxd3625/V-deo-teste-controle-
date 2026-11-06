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
  var rvs = $$(".sec-head, .sv, .attitudes li, .cli > *, .exp-intro, .faq-list, .form, .quote-l");
  rvs.forEach(function (el) { el.classList.add("rv"); });
  var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }); }, {rootMargin: "0px 0px -8% 0px"});
  rvs.forEach(function (el) { ro.observe(el); });

  /* ---------- proteção: começa pelo toque do visitante ---------- */
  var P = {
    geladeira: {my: "minha geladeira", your: "sua geladeira", done: "Geladeira protegida"},
    sofa: {my: "meu sofá", your: "seu sofá", done: "Sofá protegido"},
    cama: {my: "minha cama", your: "sua cama", done: "Cama protegida"}
  };
  var pv = $("#protVideo"), go = $("#protGo"), pst = $("#protStatus"), pdone = $("#protDone"), tabs = $$('[role="tab"]'), panel = $("#protScene");
  var cur = "geladeira", state = "idle";
  function setState(s) {
    state = s;
    var p = P[cur];
    go.hidden = s === "done";
    go.disabled = s === "playing";
    go.textContent = s === "playing" ? "Nossa equipe está protegendo " + p.your : "Proteger " + p.my;
    pdone.hidden = s !== "done";
    pst.className = "prot-status" + (s === "done" ? " ok" : "");
    pst.textContent = s === "done" ? "✓ " + p.done : "";
  }
  function choose(k) {
    if (k === cur && state === "idle") return;
    pv.pause(); cur = k;
    tabs.forEach(function (b) { var on = b.dataset.k === k; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on) panel.setAttribute("aria-labelledby", b.id); });
    pv.removeAttribute("src"); pv.load();
    pv.poster = "media/anim/p3-" + k + "-inicio.webp";
    pv.setAttribute("aria-label", "Demonstração: dois funcionários da Diego colocam a capa azul " + (k === "sofa" ? "no sofá" : k === "cama" ? "na cama box" : "na geladeira"));
    setState("idle");
  }
  function protPlay() {
    if (state === "playing") return;
    if (!pv.getAttribute("src")) pv.src = "media/anim/p3-" + cur + ".mp4";
    if (reduced) { pv.poster = "media/anim/p3-" + cur + "-fim.webp"; setState("done"); return; }
    pv.currentTime = 0; setState("playing");
    var p = pv.play(); if (p && p.catch) p.catch(function () { setState("idle"); });
  }
  go.addEventListener("click", protPlay);
  $("#protAgain").addEventListener("click", function () { if (reduced) { pv.poster = ""; } setState("idle"); reducedPlayOnce(); });
  function reducedPlayOnce() { if (!pv.getAttribute("src")) pv.src = "media/anim/p3-" + cur + ".mp4"; pv.currentTime = 0; setState("playing"); var p = pv.play(); if (p && p.catch) p.catch(function () { setState("idle"); }); }
  $("#protOther").addEventListener("click", function () { var i = tabs.findIndex(function (b) { return b.dataset.k === cur; }); var n = tabs[(i + 1) % tabs.length]; n.focus(); choose(n.dataset.k); });
  pv.addEventListener("ended", function () { setState("done"); });
  tabs.forEach(function (b, i) {
    b.addEventListener("click", function () { choose(b.dataset.k); });
    b.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); choose(n.dataset.k);
    });
  });
  // fora da tela, a demonstração pausa; ao voltar, continua de onde parou
  new IntersectionObserver(function (es) {
    if (state !== "playing") return;
    if (es[0].intersectionRatio < 0.3) pv.pause(); else if (pv.paused) { var p = pv.play(); if (p && p.catch) p.catch(function () {}); }
  }, {threshold: [0, 0.3, 0.6]}).observe(pv);
  setState("idle");

  // botão flutuante do WhatsApp sai do caminho quando os controles das cenas estão na tela
  var sceneVis = {};
  var so2 = new IntersectionObserver(function (es) {
    es.forEach(function (e) { sceneVis[e.target.id] = e.isIntersecting; });
    fab.classList.toggle("hide-for-scene", Object.keys(sceneVis).some(function (k) { return sceneVis[k]; }));
  }, {threshold: 0.15});
  so2.observe($("#protScene"));

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

  /* galeria: imagem ampliada */
  var ib = $("#imgbox"), ibImg = $("img", ib);
  $$(".gi").forEach(function (b) { b.addEventListener("click", function () { ibImg.src = b.dataset.full; ibImg.alt = $("img", b).alt; lastFocus = b; if (ib.showModal) ib.showModal(); else ib.setAttribute("open", ""); }); });
  $(".player-x", ib).addEventListener("click", function () { ib.close(); });
  ib.addEventListener("click", function (e) { if (e.target === ib) ib.close(); });
  ib.addEventListener("close", function () { if (lastFocus) lastFocus.focus(); });

  /* vídeos: trilho com setas */
  var V = [
    ["media/ig/video-09", "Mais uma mudança entregue", "Palavra de cliente"],
    ["media/ig/video-02", "Como protegemos a geladeira", "Capa e plástico stretch"],
    ["media/ig/video-08", "Guarda-roupa embalado", "Capa e plástico stretch"],
    ["media/ig/video-15", "Capa e stretch, passo a passo", "Proteção do guarda-roupa"],
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
