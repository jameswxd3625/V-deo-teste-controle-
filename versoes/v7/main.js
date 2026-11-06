/* Diego Mudanças — interações do site */
(function () {
  "use strict";
  var D = window.DIEGO || {};
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- contatos (config.js) ---------- */
  var waUrl = function (t) { return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(t); };
  $$("[data-wa-msg]").forEach(function (a) {
    a.href = waUrl(a.getAttribute("data-wa-msg"));
    a.target = "_blank"; a.rel = "noopener";
  });
  $$("[data-wa-label]").forEach(function (a) { a.textContent = "WhatsApp " + D.whatsappLabel; });
  $$("[data-ig]").forEach(function (a) { a.href = "https://www.instagram.com/" + D.instagram; });
  $$("[data-ig-label]").forEach(function (a) { a.textContent = "@" + D.instagram; });
  $$("[data-site]").forEach(function (a) { a.textContent = D.site; });
  $$("[data-cidade]").forEach(function (a) { a.textContent = D.cidade; });
  $$("[data-ano]").forEach(function (a) { a.textContent = new Date().getFullYear(); });

  /* ---------- topo, progresso, botão flutuante, link ativo ---------- */
  var top = $(".top"), bar = $(".progress span"), fab = $(".wa-fab"), quote = $("#orcamento");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = doc.scrollHeight - innerHeight;
    top.classList.toggle("solid", y > 24);
    bar.style.setProperty("--p", h > 0 ? (y / h).toFixed(4) : 0);
    var q = quote.getBoundingClientRect();
    fab.classList.toggle("show", y > innerHeight * 0.7 && !(q.top < innerHeight * 0.8 && q.bottom > 0));
    ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, {passive: true});
  onScroll();
  var navLinks = $$(".nav a");
  var secObs = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
    });
  }, {rootMargin: "-45% 0px -50% 0px"});
  $$("main section[id]").forEach(function (s) { secObs.observe(s); });

  /* ---------- menu do celular ---------- */
  var mb = $(".menu-btn"), sheet = $("#menu");
  function setMenu(open) {
    mb.setAttribute("aria-expanded", open);
    mb.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add("open"); }); $("a", sheet).focus(); }
    else { sheet.classList.remove("open"); setTimeout(function () { if (mb.getAttribute("aria-expanded") === "false") sheet.hidden = true; }, 350); }
  }
  mb.addEventListener("click", function () { setMenu(mb.getAttribute("aria-expanded") !== "true"); });
  $$("a", sheet).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && mb.getAttribute("aria-expanded") === "true") { setMenu(false); mb.focus(); } });

  /* ---------- revelação ao rolar (com escalonamento) ---------- */
  var groups = new Map();
  $$(".reveal").forEach(function (el) {
    var p = el.parentElement, i = groups.get(p) || 0;
    el.style.setProperty("--d", Math.min(i, 6) * 0.07 + "s");
    groups.set(p, i + 1);
  });
  var rv = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } });
  }, {rootMargin: "0px 0px -8% 0px", threshold: 0.08});
  $$(".reveal").forEach(function (el) { rv.observe(el); });

  /* ---------- brilho que segue o cursor nos cartões ---------- */
  $$(".card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- animações (vídeos Remotion em loop) ---------- */
  var loops = $$("video.loop");
  loops.forEach(function (v) { if (v.dataset.src) v.src = v.dataset.src; v.dataset.user = ""; });
  function tryPlay(v) { if (reduce.matches || v.dataset.user === "paused" || (v.classList.contains("once") && v.ended)) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  var lo = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) tryPlay(e.target); else e.target.pause(); });
  }, {threshold: 0.2});
  loops.forEach(function (v) { v.preload = "auto"; lo.observe(v); });
  $$(".loop-toggle").forEach(function (b) {
    var v = document.getElementById(b.dataset.for);
    function sync() {
      var paused = v.paused;
      b.setAttribute("aria-label", paused ? "Reproduzir animação" : "Pausar animação");
      $("use", b).setAttribute("href", paused ? "#i-play" : "#i-pause");
    }
    b.addEventListener("click", function () {
      if (v.ended) { v.currentTime = 0; v.dataset.user = ""; tryPlay(v); return; }
      if (v.paused) { v.dataset.user = ""; tryPlay(v); } else { v.dataset.user = "paused"; v.pause(); }
    });
    v.addEventListener("ended", function () { b.setAttribute("aria-label", "Ver a animação de novo"); $("use", b).setAttribute("href", "#i-play"); });
    v.addEventListener("play", sync); v.addEventListener("pause", sync); sync();
  });

  /* ---------- passos sincronizados com as animações ---------- */
  function syncList(video, items, times, end) {
    var cur = -1;
    function update() {
      var t = video.currentTime, k = 0;
      for (var i = 0; i < times.length; i++) if (t >= times[i]) k = i;
      if (end && t > end) k = -1;
      if (k !== cur) { items.forEach(function (li, i) { li.classList.toggle("on", i === k); }); cur = k; }
      if (!video.paused) requestAnimationFrame(update);
    }
    video.addEventListener("play", function () { requestAnimationFrame(update); });
    video.addEventListener("seeked", update);
    if (reduce.matches) items.forEach(function (li) { li.classList.remove("on"); });
    return update;
  }
  var jv = $("#journeyVideo"), jItems = $$("#journeySteps li");
  var jTimes = jItems.map(function (li) { return parseFloat(li.dataset.at); });
  var jUpdate = syncList(jv, jItems, jTimes, 8.6);
  jItems.forEach(function (li, i) {
    $("button", li).addEventListener("click", function () {
      jv.currentTime = jTimes[i] + 0.05; jUpdate();
      jItems.forEach(function (o, k) { o.classList.toggle("on", k === i); });
      if (jv.dataset.user !== "paused") tryPlay(jv);
    });
  });
  var pItems = $$("#protectSteps li");
  syncList($("#protectVideo"), pItems.concat([pItems[0]]), [0, 4.25, 8.85, 13.45]);
  // linha de percurso dos serviços: desenha conforme a rolagem
  var svc = $(".services"), svr = $(".svc-route");
  function routeDraw() {
    var r = svc.getBoundingClientRect(), vh = innerHeight;
    var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.2)));
    svr.style.setProperty("--rp", reduce.matches ? 1 : p.toFixed(3));
  }
  addEventListener("scroll", function () { requestAnimationFrame(routeDraw); }, {passive: true});
  routeDraw();

  /* abertura: leve paralaxe dos cartões com o ponteiro */
  var hx = document.getElementById("hxStack");
  if (hx && !reduce.matches && matchMedia("(pointer:fine)").matches) {
    hx.addEventListener("pointermove", function (e) {
      var r = hx.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      Array.prototype.forEach.call(hx.querySelectorAll(".hx-card"), function (c, i) { var k = (i + 1) * 6; c.style.setProperty("--px", (dx * k).toFixed(1) + "px"); c.style.setProperty("--py", (dy * k).toFixed(1) + "px"); });
    });
  }

  /* ---------- trilho de vídeos reais ---------- */
  var V = [
    ["media/filme-diego", "Conheça a Diego", "Filme institucional", "Novo"],
    ["media/ig/video-06", "30 anos na mesma casa", "Uma mudança especial", "Cliente"],
    ["media/ig/video-09", "Mais uma mudança entregue", "Palavra de cliente", "Cliente"],
    ["media/ig/video-04", "Embalagem completa", "Item por item", ""],
    ["media/ig/video-02", "A queridinha da casa", "Proteção da geladeira", ""],
    ["media/ig/video-01", "Guarda-móveis", "Proteção em camadas", ""],
    ["media/ig/video-03", "Tudo em um só lugar", "Conectando destinos", ""],
    ["media/equipe-02-paqueta", "Equipe 02 em execução", "Bairro Paquetá, BH", ""],
    ["media/hora-de-descarregar", "Hora de descarregar", "Nossos caminhões", ""],
    ["media/ig/video-16", "Como num passe de mágica", "Antes e depois", ""],
    ["media/ig/video-05", "Uma nova fase na frota", "Novas plotagens", ""],
    ["media/ig/video-07", "Nossos caminhões", "Frota própria", ""],
    ["media/ig/video-08", "Proteção e fé", "Salmo 139", ""],
    ["media/ig/video-25", "Bastidores", "Com o Diego", ""]
  ];
  var rail = $("#vrail");
  rail.innerHTML = V.map(function (v) {
    return '<div class="vid" style="background-image:url(' + v[0] + '.webp)">' +
      (v[3] ? '<span class="tag">' + v[3] + "</span>" : "") +
      '<button class="play" type="button" data-src="' + v[0] + '.mp4" aria-label="Assistir: ' + v[1] + '">' +
      '<i><svg><use href="#i-play"/></svg></i><b>' + v[1] + "</b><span>" + v[2] + "</span></button></div>";
  }).join("");
  $$(".vid .play", rail).forEach(function (b) {
    b.addEventListener("click", function () {
      $$("video", rail).forEach(function (o) { o.pause(); });
      var box = b.parentElement, v = $("video", box);
      if (!v) {
        v = document.createElement("video");
        v.src = b.dataset.src; v.controls = true; v.playsInline = true; v.preload = "auto";
        box.insertBefore(v, box.firstChild);
      }
      box.classList.add("on");
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      v.focus();
    });
  });
  $$(".rn").forEach(function (b) {
    b.addEventListener("click", function () {
      var r = document.getElementById(b.dataset.rail);
      r.scrollBy({left: parseInt(b.dataset.dir, 10) * r.clientWidth * 0.8, behavior: reduce.matches ? "auto" : "smooth"});
    });
  });

  /* ---------- orçamento: monta a mensagem e abre o WhatsApp ---------- */
  var form = $("#form");
  function check(inp) {
    var ok = inp.value.trim().length > 1;
    inp.closest(".field").classList.toggle("bad", !ok);
    inp.setAttribute("aria-invalid", !ok);
    return ok;
  }
  $$("[required]", form).forEach(function (i) {
    i.addEventListener("blur", function () { if (i.value) check(i); });
    i.addEventListener("input", function () { if (i.closest(".bad")) check(i); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = $$("[required]", form).filter(function (i) { return !check(i); });
    if (bad.length) { bad[0].focus(); return; }
    var f = new FormData(form);
    var t = "Olá! Meu nome é " + f.get("nome").trim() + ".\n" +
      "Gostaria de um orçamento (" + f.get("tipo") + ").\n" +
      "Saindo de: " + f.get("origem").trim() + "\n" +
      "Indo para: " + f.get("destino").trim() +
      (f.get("itens").trim() ? "\nPreciso levar: " + f.get("itens").trim() : "") +
      (f.get("data").trim() ? "\nData aproximada: " + f.get("data").trim() : "") +
      "\n\n(Mensagem enviada pelo site)";
    var w = window.open(waUrl(t), "_blank");
    if (w) w.opener = null; else location.href = waUrl(t);
  });
})();
