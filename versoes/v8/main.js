/* Diego Mudanças — versão cinética (GSAP + ScrollTrigger) */
(function () {
  "use strict";
  var D = window.DIEGO || {}, doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var G = window.gsap, ST = window.ScrollTrigger;
  if (!G || !ST) doc.classList.remove("motion");
  var motion = doc.classList.contains("motion");
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- contatos ---------- */
  var waUrl = function (t) { return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(t); };
  $$("[data-wa-msg]").forEach(function (a) { a.href = waUrl(a.getAttribute("data-wa-msg")); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa-label]").forEach(function (a) { a.textContent = "WhatsApp " + D.whatsappLabel; });
  $$("[data-ig]").forEach(function (a) { a.href = "https://www.instagram.com/" + D.instagram; });
  $$("[data-ig-label]").forEach(function (a) { a.textContent = "@" + D.instagram; });
  $$("[data-cidade]").forEach(function (a) { a.textContent = D.cidade; });
  $$("[data-ano]").forEach(function (a) { a.textContent = new Date().getFullYear(); });

  /* ---------- cabeçalho, estrada de progresso, botão flutuante ---------- */
  var hd = $(".hd"), road = $(".hd-road"), fab = $(".wa-fab"), dest = $("#orcamento"), tick = false;
  function onScroll() {
    var y = scrollY, h = doc.scrollHeight - innerHeight;
    hd.classList.toggle("solid", y > 30);
    road.style.setProperty("--p", h > 0 ? (y / h).toFixed(4) : 0);
    var q = dest.getBoundingClientRect();
    fab.classList.toggle("show", y > innerHeight && q.top > innerHeight * 0.7);
    tick = false;
  }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, {passive: true});
  onScroll();
  var navA = $$(".nav a");
  var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) navA.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); }); }, {rootMargin: "-45% 0px -50% 0px"});
  $$("main section[id]").forEach(function (s) { so.observe(s); });

  /* ---------- menu ---------- */
  var mb = $(".menu-btn"), sheet = $("#menu");
  function setMenu(open) {
    mb.setAttribute("aria-expanded", open); mb.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add("open"); }); }
    else { sheet.classList.remove("open"); setTimeout(function () { if (mb.getAttribute("aria-expanded") === "false") sheet.hidden = true; }, 350); }
  }
  mb.addEventListener("click", function () { setMenu(mb.getAttribute("aria-expanded") !== "true"); });
  $$("a", sheet).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && mb.getAttribute("aria-expanded") === "true") setMenu(false); });

  /* ---------- vídeos em loop: tocam só quando aparecem ---------- */
  var autos = $$("video.auto");
  var ao = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; if (motion) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
      else v.pause();
    });
  }, {threshold: 0.15});
  autos.forEach(function (v) { ao.observe(v); });
  if (!motion) autos.forEach(function (v) { v.controls = true; });

  /* ---------- player em tela cheia ---------- */
  var player = $("#player"), pv = $("video", player);
  function openVideo(src) {
    pv.src = src;
    if (player.showModal) player.showModal(); else player.setAttribute("open", "");
    var p = pv.play(); if (p && p.catch) p.catch(function () {});
  }
  function closeVideo() { pv.pause(); pv.removeAttribute("src"); pv.load(); if (player.close) player.close(); else player.removeAttribute("open"); }
  $(".player-x").addEventListener("click", closeVideo);
  player.addEventListener("click", function (e) { if (e.target === player) closeVideo(); });
  player.addEventListener("close", function () { pv.pause(); });
  $(".play-story").addEventListener("click", function () { openVideo(this.dataset.video); });

  /* ---------- vídeos: carrossel em 3D ---------- */
  var V = [
    ["media/filme-diego", "Conheça a Diego", "Filme institucional"],
    ["media/ig/video-09", "Mais uma mudança entregue", "Palavra de cliente"],
    ["media/ig/video-04", "Embalagem completa", "Item por item"],
    ["media/ig/video-02", "A queridinha da casa", "Proteção da geladeira"],
    ["media/ig/video-01", "Guarda-móveis", "Proteção em camadas"],
    ["media/ig/video-03", "Tudo em um só lugar", "Conectando destinos"],
    ["media/equipe-02-paqueta", "Equipe 02 em execução", "Bairro Paquetá, BH"],
    ["media/hora-de-descarregar", "Hora de descarregar", "Nossos caminhões"],
    ["media/ig/video-16", "Como num passe de mágica", "Antes e depois"],
    ["media/ig/video-05", "Uma nova fase na frota", "Novas plotagens"],
    ["media/ig/video-07", "Nossos caminhões", "Frota própria"],
    ["media/ig/video-08", "Proteção e fé", "Salmo 139"],
    ["media/ig/video-25", "Bastidores", "Com o Diego"]
  ];
  var flow = $("#flow");
  flow.innerHTML = V.map(function (v) {
    return '<div class="card" style="background-image:url(' + v[0] + '.webp' + ')"><button type="button" data-video="' + v[0] + '.mp4" aria-label="Assistir: ' + v[1] + '"><i><svg><use href="#i-play"/></svg></i><b>' + v[1] + "</b><span>" + v[2] + "</span></button></div>";
  }).join("");
  $$("button", flow).forEach(function (b) { b.addEventListener("click", function () { openVideo(b.dataset.video); }); });
  var cards = $$(".card", flow);
  function coverflow() {
    var c = flow.getBoundingClientRect(), mid = c.left + c.width / 2;
    cards.forEach(function (el) {
      var r = el.getBoundingClientRect(), d = (r.left + r.width / 2 - mid) / r.width;
      el.style.setProperty("--ry", clamp(-d * 32, -50, 50).toFixed(1) + "deg");
      el.style.setProperty("--sc", (1 - Math.min(Math.abs(d) * 0.1, 0.22)).toFixed(3));
      el.style.setProperty("--op", (1 - Math.min(Math.abs(d) * 0.22, 0.55)).toFixed(3));
    });
  }
  if (motion) { flow.addEventListener("scroll", function () { requestAnimationFrame(coverflow); }, {passive: true}); addEventListener("resize", coverflow); coverflow(); }

  /* ---------- dúvidas: abre com altura animada ---------- */
  $$(".faq details").forEach(function (d) {
    var s = $("summary", d), body = $("div", d);
    s.addEventListener("click", function (e) {
      if (!motion) return;
      e.preventDefault();
      if (d.open) { G.to(body, {height: 0, duration: 0.45, ease: "power3.inOut", onComplete: function () { d.open = false; body.style.height = ""; }}); }
      else { d.open = true; G.fromTo(body, {height: 0}, {height: "auto", duration: 0.6, ease: "expo.out", clearProps: "height"}); }
    });
  });

  /* ---------- orçamento: a rota se completa ---------- */
  var form = $("#form"), rl = $(".route-line"), dpin = $(".dest-pin");
  var orig = form.elements.origem, dst = form.elements.destino;
  function routeFill() {
    var f = (orig.value.trim().length > 1 ? 0.5 : 0) + (dst.value.trim().length > 1 ? 0.5 : 0);
    rl.style.setProperty("--f", f); dpin.classList.toggle("ok", f === 1);
  }
  [orig, dst].forEach(function (i) { i.addEventListener("input", routeFill); });
  function check(inp) { var ok = inp.value.trim().length > 1; inp.closest(".field").classList.toggle("bad", !ok); inp.setAttribute("aria-invalid", !ok); return ok; }
  $$("[required]", form).forEach(function (i) {
    i.addEventListener("blur", function () { if (i.value) check(i); });
    i.addEventListener("input", function () { if (i.closest(".bad")) check(i); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = $$("[required]", form).filter(function (i) { return !check(i); });
    if (bad.length) { bad[0].focus(); return; }
    var f = new FormData(form);
    var t = "Olá! Meu nome é " + f.get("nome").trim() + ".\nGostaria de um orçamento (" + f.get("tipo") + ").\nSaindo de: " + f.get("origem").trim() + "\nIndo para: " + f.get("destino").trim() +
      (f.get("itens").trim() ? "\nPreciso levar: " + f.get("itens").trim() : "") + (f.get("data").trim() ? "\nData aproximada: " + f.get("data").trim() : "") + "\n\n(Mensagem enviada pelo site)";
    var w = window.open(waUrl(t), "_blank"); if (w) w.opener = null; else location.href = waUrl(t);
  });

  /* palavras que acendem */
  $$(".lit-words").forEach(function (p) { p.innerHTML = p.textContent.split(" ").map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" "); });

  if (!motion) {
    $$("video.scrub").forEach(function (v) { v.controls = true; v.preload = "none"; v.src = v.dataset.src; });
    return;
  }

  /* =================== MOVIMENTO =================== */
  G.registerPlugin(ST);
  ST.config({ignoreMobileResize: true});
  var mobile = matchMedia("(max-width:900px)").matches;

  /* sequência de quadros comandada pela rolagem (suave no celular, sem quadro vazio) */
  function seq(cv, base, n) {
    var ctx = cv.getContext("2d"), imgs = [], started = false, want = 0, shown = -1;
    function best(i) {
      for (var d = 0; d < n; d++) {
        var a = imgs[i - d], c = imgs[i + d];
        if (a && a.ok) return i - d;
        if (c && c.ok) return i + d;
      }
      return -1;
    }
    function draw() { var k = best(want); if (k >= 0 && k !== shown) { ctx.drawImage(imgs[k], 0, 0, cv.width, cv.height); shown = k; } }
    function get(i) {
      if (imgs[i]) return; var im = new Image(); imgs[i] = im;
      im.onload = function () { im.ok = true; draw(); };
      im.src = base + ("00" + (i + 1)).slice(-3) + ".webp";
    }
    return {
      load: function () {
        if (started) return; started = true;
        [8, 4, 2, 1].forEach(function (s) { for (var i = 0; i < n; i += s) get(i); });
      },
      set: function (p) { want = Math.round(clamp(p, 0, 1) * (n - 1)); draw(); }
    };
  }
  function jumpTo(st, p) { scrollTo({top: st.start + (st.end - st.start) * p, behavior: "smooth"}); }

  /* 1. Abertura: a porta do baú sobe e o título entra */
  var tl = G.timeline({defaults: {ease: "expo.out"}});
  tl.from(".door img", {scale: 1.25, duration: 2.2, ease: "power3.out"}, 0)
    .to(".slats i", {scaleY: 0, duration: 0.9, ease: "power3.inOut", stagger: {each: 0.07, from: "end"}}, 0.15)
    .to(".hero h1 .ln>span", {y: 0, duration: 1.2, stagger: 0.09}, 0.35)
    .to(".hero-lead", {opacity: 1, duration: 0.8}, 1)
    .to(".hero-cta", {opacity: 1, duration: 0.8}, 1.1)
    .to(".cue", {opacity: 1, duration: 0.8}, 1.3);

  G.timeline({scrollTrigger: {trigger: ".hero", start: "top top", end: "bottom top", scrub: true}})
    .to(".door img", {scale: 1.18, yPercent: 8, ease: "none"}, 0)
    .to(".hero h1 .ln:nth-child(odd)", {xPercent: -18, ease: "none"}, 0)
    .to(".hero h1 .ln:nth-child(even)", {xPercent: 14, ease: "none"}, 0)
    .to(".hero-copy", {opacity: 0.15, ease: "none"}, 0);

  /* 2. Serviços: trilho horizontal com o caminhão percorrendo a estrada */
  var track = $(".svc-track"), spin = $(".svc-pin"), panels = $$(".panel-media");
  var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
  G.to(track, {
    x: function () { return -dist(); }, ease: "none",
    scrollTrigger: {
      trigger: spin, pin: true, start: "top top", end: function () { return "+=" + dist(); }, scrub: 0.3, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: function (s) {
        spin.style.setProperty("--rp", s.progress.toFixed(4));
      }
    }
  });

  /* 3. Como funciona: a rolagem conduz o percurso (0 a 8 s da animação) */
  var js = seq($("#journeySeq"), "media/seq/jornada/", 96), reel = $(".odo-reel"), hs = $$(".how-steps li"), hb = $$(".how-bar button"), jT = [0, 1, 2.2, 4.6], jk = -1;
  var howST = ST.create({
    trigger: ".how-pin", pin: true, start: "top top", end: "+=" + (mobile ? 170 : 200) + "%", scrub: true,
    onUpdate: function (s) {
      js.set(s.progress);
      var t = s.progress * 8, k = 0; for (var i = 0; i < jT.length; i++) if (t >= jT[i]) k = i;
      if (k !== jk) { jk = k; reel.style.setProperty("--k", k); hs.forEach(function (li, i) { li.classList.toggle("on", i === k); }); hb.forEach(function (b, i) { b.classList.toggle("on", i <= k); }); }
    }
  });
  hb.forEach(function (b, i) { b.addEventListener("click", function () { jumpTo(howST, i === 3 ? 0.8 : (jT[i] + 0.4) / 8); }); });
  hb[0].classList.add("on");
  js.set(0);
  ST.create({trigger: ".how", start: "top 160%", once: true, onEnter: function () { js.load(); }});

  /* 4. Proteção: a capa veste geladeira, sofá e cama (0 a 13,2 s) */
  var cs = seq($("#protectSeq"), "media/seq/protecao/", 132), pi = $$(".prot-items li"), pT = [0, 4.25, 8.85], pk = -1;
  var protST = ST.create({
    trigger: ".prot-pin", pin: true, start: "top top", end: "+=" + (mobile ? 190 : 220) + "%", scrub: true,
    onUpdate: function (s) {
      cs.set(s.progress);
      var t = s.progress * 13.2, k = 0; for (var i = 0; i < pT.length; i++) if (t >= pT[i]) k = i;
      if (k !== pk) { pk = k; pi.forEach(function (li, i) { li.classList.toggle("on", i === k); }); }
    }
  });
  pi.forEach(function (li, i) { $("button", li).addEventListener("click", function () { jumpTo(protST, [2.6, 7.2, 12.2][i] / 13.2); }); });
  cs.set(0);
  ST.create({trigger: ".prot", start: "top 160%", once: true, onEnter: function () { cs.load(); }});

  /* artes: deslizam com a rolagem e inclinam com a velocidade */
  var row = $(".arts-row");
  G.to(row, {
    x: function () { return -(row.scrollWidth - innerWidth * 0.92); }, ease: "none",
    scrollTrigger: {trigger: ".arts", start: "top bottom", end: "bottom top", scrub: 0.4, invalidateOnRefresh: true}
  });

  /* 5. Seu Daniel: a foto se abre até tomar a tela */
  var sf = $(".story-frame"), words = $$(".story .w");
  G.set(".story-copy h2, .story blockquote, .play-story", {opacity: 0, y: 40});
  var stl = G.timeline({scrollTrigger: {trigger: ".story-pin", pin: true, start: "top top", end: "+=150%", scrub: 0.5,
    onUpdate: function (s) { var n = Math.round(clamp((s.progress - 0.4) / 0.45, 0, 1) * words.length); words.forEach(function (w, i) { w.classList.toggle("lit", i < n); }); }}});
  stl.fromTo(sf, {"--ci": mobile ? "22%" : "16%", "--cx": mobile ? "10%" : "30%", "--cr": "32px", "--cs": 1.3, "--co": 0.15},
                 {"--ci": "0%", "--cx": "0%", "--cr": "0px", "--cs": 1, "--co": 1, ease: "power2.inOut", duration: 0.45}, 0)
     .to(".story-copy h2", {opacity: 1, y: 0, duration: 0.15}, 0.3)
     .to(".story blockquote", {opacity: 1, y: 0, duration: 0.1}, 0.38)
     .to(".play-story", {opacity: 1, y: 0, duration: 0.1}, 0.88)
     .to({}, {duration: 0.1});

  /* 6. Lema: letreiros gigantes correm em sentidos opostos */
  G.timeline({scrollTrigger: {trigger: ".faith", start: "top bottom", end: "bottom top", scrub: 0.5}})
    .fromTo(".r1", {xPercent: 0}, {xPercent: -38, ease: "none"}, 0)
    .fromTo(".r2", {xPercent: -42}, {xPercent: -4, ease: "none"}, 0)
    .fromTo(".faith-photo", {yPercent: -8}, {yPercent: 8, ease: "none"}, 0);

  /* 7. Destino: o pino cai no lugar */
  G.from(".dest-pin", {y: -140, opacity: 0, duration: 1.1, ease: "bounce.out", scrollTrigger: {trigger: ".dest", start: "top 70%"}});

  addEventListener("load", function () { ST.refresh(); });
})();
