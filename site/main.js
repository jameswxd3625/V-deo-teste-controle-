/* Diego Mudanças — "A viagem". Sem bibliotecas: um único laço de animação guiado pela rolagem. */
(function () {
  "use strict";
  var D = window.DIEGO || {}, doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var motion = doc.classList.contains("motion"), lite = doc.classList.contains("lite");

  /* ---------- contatos ---------- */
  var waUrl = function (t) { return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(t); };
  $$("[data-wa-msg]").forEach(function (a) { a.href = waUrl(a.getAttribute("data-wa-msg")); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa-label]").forEach(function (a) { a.textContent = "WhatsApp " + D.whatsappLabel; });
  $$("[data-ig]").forEach(function (a) { a.href = "https://www.instagram.com/" + D.instagram; });
  $$("[data-ig-label]").forEach(function (a) { a.textContent = "@" + D.instagram; });
  $$("[data-cidade]").forEach(function (a) { a.textContent = D.cidade; });
  $$("[data-ano]").forEach(function (a) { a.textContent = new Date().getFullYear(); });

  var scene = $(".scene");

  /* ---------- cabeçalho e menu ---------- */
  var hd = $(".hd"), fab = $(".wa-fab"), mb = $(".menu-btn"), sheet = $("#menu");
  function setMenu(open) {
    mb.setAttribute("aria-expanded", open); mb.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { hd.classList.remove("away"); sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add("open"); }); }
    else { sheet.classList.remove("open"); setTimeout(function () { if (mb.getAttribute("aria-expanded") === "false") sheet.hidden = true; }, 350); }
  }
  mb.addEventListener("click", function () { setMenu(mb.getAttribute("aria-expanded") !== "true"); });
  $$("a", sheet).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && mb.getAttribute("aria-expanded") === "true") setMenu(false); });
  var navA = $$(".nav a");
  var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) navA.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); }); }, {rootMargin: "-45% 0px -50% 0px"});
  $$("main section[id]").forEach(function (s) { so.observe(s); });

  /* ---------- títulos que entram, pino que cai ---------- */
  var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }); }, {rootMargin: "0px 0px -12% 0px"});
  $$(".rv, .dest-pin").forEach(function (el) { ro.observe(el); });

  /* ---------- vídeos curtos: carregam e tocam só quando aparecem ---------- */
  var vo = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { if (!v.src) { v.preload = "auto"; v.src = v.dataset.src; } var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else if (v.src) v.pause();
    });
  }, {threshold: .2});
  if (motion && !lite) $$("video.auto").forEach(function (v) { vo.observe(v); });

  /* guarda-móveis: só anima quando aparece */
  var gmo = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle("play", e.isIntersecting); }); }, {threshold: .25});
  $$(".gm").forEach(function (el) { gmo.observe(el); });

  /* embalagem (animação SMIL): toca só quando aparece */
  $$(".emb-svg").forEach(function (sv) {
    if (!sv.pauseAnimations) return;
    sv.pauseAnimations();
    if (!motion) { sv.setCurrentTime(8.9); return; }
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) sv.unpauseAnimations(); else sv.pauseAnimations(); }, {threshold: .25}).observe(sv);
  });

  /* animações contínuas pausam fora da tela */
  var po = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle("paused", !e.isIntersecting); }); });
  $$(".hero, .faith").forEach(function (el) { po.observe(el); });

  /* ---------- player em tela cheia ---------- */
  var player = $("#player"), pv = $("video", player);
  function openVideo(src, poster) {
    pv.poster = poster || "";
    pv.src = src;
    if (player.showModal) player.showModal(); else player.setAttribute("open", "");
    var p = pv.play(); if (p && p.catch) p.catch(function () {});
  }
  function closeVideo() { pv.pause(); pv.removeAttribute("src"); pv.load(); if (player.close) player.close(); else player.removeAttribute("open"); }
  $(".player-x").addEventListener("click", closeVideo);
  player.addEventListener("click", function (e) { if (e.target === player) closeVideo(); });
  player.addEventListener("close", function () { pv.pause(); });
  $(".play-story").addEventListener("click", function () { openVideo(this.dataset.video, this.dataset.poster); });
  $$(".play-v").forEach(function (b) { b.addEventListener("click", function () { openVideo(this.dataset.video, this.dataset.poster); }); });

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
    return '<div class="card" data-bg="' + v[0] + '.webp"><button type="button" data-video="' + v[0] + '.mp4" ><i><svg aria-hidden="true"><use href="#i-play"/></svg></i><b>' + v[1] + "</b> <span>" + v[2] + "</span></button></div>";
  }).join("");
  var cards = $$(".card", flow);
  var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.style.backgroundImage = "url(" + e.target.dataset.bg + ")"; co.unobserve(e.target); } }); }, {root: flow, rootMargin: "0px 400px"});
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); cards.forEach(function (c) { co.observe(c); }); } }, {rootMargin: "600px 0px"}).observe(flow);
  $$("button", flow).forEach(function (b) { b.addEventListener("click", function () { openVideo(b.dataset.video); }); });
  function coverflow() {
    var c = flow.getBoundingClientRect(), mid = c.left + c.width / 2;
    var ds = cards.map(function (el) { var r = el.getBoundingClientRect(); return (r.left + r.width / 2 - mid) / r.width; });
    cards.forEach(function (el, i) {
      var d = ds[i]; if (Math.abs(d) > 3) return;
      el.style.setProperty("--ry", clamp(-d * 30, -48, 48).toFixed(1) + "deg");
      el.style.setProperty("--sc", (1 - Math.min(Math.abs(d) * .1, .2)).toFixed(3));
      el.style.setProperty("--op", (1 - Math.min(Math.abs(d) * .25, .55)).toFixed(3));
    });
  }
  if (motion) { var cfq = 0; flow.addEventListener("scroll", function () { if (!cfq) cfq = requestAnimationFrame(function () { cfq = 0; coverflow(); }); }, {passive: true}); coverflow(); }

  /* ---------- dúvidas com altura animada ---------- */
  $$(".faq details").forEach(function (d) {
    var s = $("summary", d), body = $("div", d);
    s.addEventListener("click", function (e) {
      if (!motion || !body.animate) return;
      e.preventDefault();
      if (d.open) { var h = body.offsetHeight; body.animate([{height: h + "px"}, {height: "0px"}], {duration: 380, easing: "cubic-bezier(.6,0,.3,1)"}).onfinish = function () { d.open = false; }; }
      else { d.open = true; var h2 = body.offsetHeight; body.animate([{height: "0px"}, {height: h2 + "px"}], {duration: 520, easing: "cubic-bezier(.16,1,.3,1)"}); }
    });
  });

  /* ---------- orçamento: a rota se completa ---------- */
  var form = $("#form"), rl = $(".route-line"), dpin = $(".dest-pin");
  var orig = form.elements.origem, dst = form.elements.destino;
  function routeFill() {
    var f = (orig.value.trim().length > 1 ? .5 : 0) + (dst.value.trim().length > 1 ? .5 : 0);
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
    var b = $("button[type=submit]", form); b.classList.remove("go"); void b.offsetWidth; b.classList.add("go");
    var w = window.open(waUrl(t), "_blank"); if (w) w.opener = null; else location.href = waUrl(t);
  });

  /* palavras que acendem */
  var lit = $(".lit"); lit.innerHTML = lit.textContent.split(" ").map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
  var words = $$(".w", lit);


  /* =================== JOGO: EMBALE O MÓVEL =================== */
  (function () {
    var items = $$(".prot .item"), picks = $$(".pick button"), btn = $(".play-btn"), badge = $(".prot .badge"), status = $(".prot .status"), scoreB = $(".score b");
    var clips = [0, 1, 2].map(function (i) { return $("#cv" + i + " rect"); }), shines = $$(".prot .item .sh");
    var A = $("#pa"), B = $("#pb"), Y = 263, HOME = [34, 70];
    var EDGE = [[163, 240], [114, 286], [117, 288]];
    var NAME = ["a geladeira", "o sofá", "a cama"], DONE = ["Geladeira protegida!", "Sofá protegido!", "Cama protegida!"];
    var cur = 0, busy = false, done = [false, false, false], pos = new Map();
    function place(p, x) { pos.set(p, x); p.setAttribute("transform", "translate(" + x.toFixed(1) + " " + Y + ")"); }
    place(A, HOME[0]); place(B, HOME[1]);
    function tween(ms, fn, ez) { return new Promise(function (res) { var t0 = performance.now(); (function step(n) { var t = Math.min(1, (n - t0) / ms); fn((ez || function (v) { return v < .5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; })(t)); if (t < 1) requestAnimationFrame(step); else res(); })(t0); }); }
    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function walk(p, x) {
      var x0 = pos.get(p), d = Math.abs(x - x0); if (d < 1) return Promise.resolve();
      p.classList.toggle("left", x < x0); p.classList.add("walk");
      return tween(d / .15, function (t) { place(p, x0 + (x - x0) * t); }, function (v) { return v; }).then(function () { p.classList.remove("walk"); });
    }
    function label() {
      btn.textContent = done[cur] ? "Embalar de novo" : "Embalar " + NAME[cur];
      badge.classList.toggle("on", done[cur]);
    }
    function select(k) {
      if (busy) return; cur = k;
      picks.forEach(function (b, i) { b.classList.toggle("on", i === k); b.setAttribute("aria-pressed", i === k); });
      items.forEach(function (it, i) { it.classList.toggle("on", i === k); });
      status.textContent = ""; label();
    }
    picks.forEach(function (b, i) { b.addEventListener("click", function () { select(i); }); });
    function finish(k) {
      done[k] = true; picks[k].classList.add("done");
      var n = done.filter(Boolean).length; scoreB.textContent = n;
      status.textContent = n === 3 ? "Tudo protegido! É assim na sua mudança." : DONE[k] + " Escolha outro móvel.";
      label();
    }
    btn.addEventListener("click", async function () {
      if (busy) return; busy = true; btn.disabled = true; picks.forEach(function (b) { b.disabled = true; });
      var k = cur, c = clips[k];
      badge.classList.remove("on"); c.setAttribute("height", 0); status.textContent = "A equipe está a caminho…";
      if (!motion) { c.setAttribute("height", 320); finish(k); badge.classList.add("on"); busy = false; btn.disabled = false; picks.forEach(function (b) { b.disabled = false; }); return; }
      await Promise.all([walk(A, EDGE[k][0] - 18), walk(B, EDGE[k][1] + 18)]);
      B.classList.add("left"); A.classList.remove("left");
      await wait(150);
      A.classList.add("lift"); B.classList.add("lift"); A.classList.add("empty");
      status.textContent = "Vestindo a capa…";
      await wait(300);
      await tween(1100, function (t) { c.setAttribute("height", (t * 320).toFixed(1)); });
      A.classList.remove("lift"); B.classList.remove("lift");
      tween(600, function (t) { shines[k].setAttribute("transform", "translate(" + (-80 + t * 440).toFixed(1) + " 0)"); });
      badge.classList.add("on"); A.classList.add("hop"); B.classList.add("hop");
      finish(k);
      await wait(1100);
      A.classList.remove("hop"); B.classList.remove("hop");
      await Promise.all([walk(A, HOME[0]), walk(B, HOME[1])]);
      A.classList.remove("left", "empty"); B.classList.remove("left");
      busy = false; btn.disabled = false; picks.forEach(function (b) { b.disabled = false; });
    });
    select(0);
  })();

  /* =================== A ESTRADA E AS CENAS =================== */
  var main = $("main"), road = $(".road"), paths = $$("path", road), litP = $(".road-lit"), rider = $(".rider");
  var hero = $(".hero"), story = $(".story"), sphoto = $(".story-photo"), arts = $(".arts"), artsRow = $(".arts-row"), faith = $(".faith"), fphoto = $(".faith-photo");
  var scards = $$(".scard");
  var truck = $(".truck");
  var vh = innerHeight, W = 0, mainTop = 0, len = 0, step = 6, LX = [], LY = [], stops = [];
  var lay = {}, Lcur = 0, lastY = scrollY, vel = 0, speed = 1, skew = 0, running = false, loops = [];

  function topOf(el) { return el.getBoundingClientRect().top + scrollY; }
  function layout() {
    vh = innerHeight; W = main.clientWidth;
    var mr = main.getBoundingClientRect(); mainTop = mr.top + scrollY;
    lay.hero = hero.offsetHeight;
    lay.story = topOf(story); lay.storyH = story.offsetHeight;
    lay.arts = topOf(arts); lay.artsH = arts.offsetHeight; lay.rowW = artsRow.scrollWidth;
    lay.faith = topOf(faith); lay.faithH = faith.offsetHeight;
    lay.stack = topOf($(".stack")); lay.stackH = $(".stack").offsetHeight;
    lay.dest = topOf($("#orcamento"));
    var r = sphoto.getBoundingClientRect(); lay.rmax = Math.hypot(Math.max(W * .5, W * .5), Math.max(r.height * .4, r.height * .6)) + 10;
    buildRoad(mr);
    frame();
  }

  function buildRoad(mr) {
    var rail = Math.max(14, $(".svc .head").getBoundingClientRect().left - mr.left - 32);
    var pts = [[rail, lay.hero - 6]]; stops = [];
    $$("[data-road]").forEach(function (el) {
      var r = el.getBoundingClientRect(), t = r.top - mr.top, b = r.bottom - mr.top, kind = el.dataset.road;
      if (kind === "curve") { pts.push([rail, t + 16], [W * parseFloat(el.dataset.x), (t + b) / 2], [rail, b - 16]); stops.push([(t + b) / 2, el]); }
      else if (kind === "end") pts.push([r.left - mr.left + r.width / 2, t + r.height / 2]);
      else { pts.push([rail, (t + b) / 2]); stops.push([(t + b) / 2, el.closest(".step") || el]); }
    });
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1), py = pts[0][1], px = pts[0][0];
    var fx = [px], fy = [py], fl = [0], tot = 0;
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i]; if (p[1] < py + 4) continue;
      var m = (p[1] - py) / 2;
      d += "C" + px.toFixed(1) + " " + (py + m).toFixed(1) + " " + p[0].toFixed(1) + " " + (p[1] - m).toFixed(1) + " " + p[0].toFixed(1) + " " + p[1].toFixed(1);
      /* a mesma curva, calculada aqui: evita milhares de consultas ao SVG */
      for (var n = Math.max(6, Math.ceil((p[1] - py) / 8)), k = 1; k <= n; k++) {
        var t = k / n, u = 1 - t, bx = u * u * u * px + 3 * u * u * t * px + 3 * u * t * t * p[0] + t * t * t * p[0],
          by = u * u * u * py + 3 * u * u * t * (py + m) + 3 * u * t * t * (p[1] - m) + t * t * t * p[1], j = fx.length - 1;
        tot += Math.hypot(bx - fx[j], by - fy[j]); fx.push(bx); fy.push(by); fl.push(tot);
      }
      px = p[0]; py = p[1];
    }
    road.setAttribute("height", Math.ceil(main.scrollHeight));
    road.setAttribute("viewBox", "0 0 " + W + " " + Math.ceil(main.scrollHeight));
    paths.forEach(function (p) { p.setAttribute("d", d); });
    len = litP.getTotalLength();
    LX = []; LY = [];
    for (var l = 0, c = 0, sc = (tot / len) || 1; l <= len; l += step) {
      var tl = l * sc; while (c < fl.length - 2 && fl[c + 1] < tl) c++;
      var f = (tl - fl[c]) / ((fl[c + 1] - fl[c]) || 1);
      LX.push(fx[c] + (fx[c + 1] - fx[c]) * f); LY.push(fy[c] + (fy[c + 1] - fy[c]) * f);
    }
    litP.style.strokeDasharray = len + " " + (len + 10);
    if (!motion) { litP.style.strokeDashoffset = 0; stops.forEach(function (s) { s[1].classList.add("passed"); }); }
  }
  function lenAtY(y) {
    var lo = 0, hi = LY.length - 1;
    if (y <= LY[0]) return 0; if (y >= LY[hi]) return len;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (LY[mid] < y) lo = mid; else hi = mid; }
    var f = (y - LY[lo]) / ((LY[hi] - LY[lo]) || 1);
    return (lo + f) * step;
  }
  function at(L) { var i = clamp(L / step, 0, LX.length - 1), a = Math.floor(i), b = Math.min(a + 1, LX.length - 1), f = i - a; return [LX[a] + (LX[b] - LX[a]) * f, LY[a] + (LY[b] - LY[a]) * f]; }

  function frame() {
    running = false;
    var y = scrollY, more = false;
    vel += ((y - lastY) - vel) * .3; lastY = y;
    hd.classList.toggle("solid", y > 20);
    if (y > vh && Math.abs(vel) > 1.5) hd.classList.toggle("away", vel > 0 && mb.getAttribute("aria-expanded") !== "true");
    if (y < vh) hd.classList.remove("away");
    fab.classList.toggle("show", y > vh && lay.dest - y > vh * .8);
    if (!motion) return;

    /* abertura: amanhece e o caminhão acelera com a rolagem */
    if (y < lay.hero) {
      var hp = clamp(y / (lay.hero - vh), 0, 1);
      hero.style.setProperty("--hp", hp.toFixed(3));
      hero.style.setProperty("--mk", clamp((hp - .42) / .28, 0, 1).toFixed(3));
      truck.style.setProperty("--tx", (clamp((hp - .55) / .45, 0, 1) * clamp((hp - .55) / .45, 0, 1) * W * 1.1).toFixed(1) + "px");
      if (!loops.length && scene.getAnimations) loops = scene.getAnimations({subtree: true}).filter(function (a) { return /slide|lane|spin/.test(a.animationName || ""); });
      var target = 1 + Math.min(Math.abs(vel) / 5, 5);
      speed += (target - speed) * .12;
      if (Math.abs(target - speed) > .02) more = true;
      for (var i = 0; i < loops.length; i++) loops[i].playbackRate = speed;
    }

    /* a estrada e o caminhãozinho */
    if (len) {
      var Lt = lenAtY(y + vh * .62 - mainTop);
      Lcur += (Lt - Lcur) * .2; if (Math.abs(Lt - Lcur) > .5) more = true; else Lcur = Lt;
      var p = at(Lcur), p2 = at(Lcur + 10), ang = Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 57.3 - 90;
      rider.style.transform = "translate3d(" + p[0].toFixed(1) + "px," + (p[1] + mainTop - y).toFixed(1) + "px,0) rotate(" + ang.toFixed(1) + "deg)";
      rider.classList.toggle("on", y + vh * .62 - mainTop > LY[0] - 30);
      if (Lcur > len - 3) arrive();
      rider.classList.toggle("parked", destEl.classList.contains("arrived") && Lcur > len - 3);
      litP.style.strokeDashoffset = (len - Lcur).toFixed(1);
      for (var s = 0; s < stops.length; s++) stops[s][1].classList.toggle("passed", p[1] >= stops[s][0] - 4);
    }

    /* cartões que empilham */
    if (y + vh > lay.stack && y < lay.stack + lay.stackH) {
      for (var c = 0; c < scards.length - 1; c++) {
        var nt = scards[c + 1].getBoundingClientRect().top, st = 64 + 12 + (c + 1) * 14;
        var t = clamp((vh - nt) / (vh - st), 0, 1);
        scards[c].style.setProperty("--s", (1 - .06 * t).toFixed(4));
        scards[c].style.setProperty("--dk", (.5 * t).toFixed(3));
      }
    }

    /* artes deslizam e inclinam com a velocidade */
    if (y + vh > lay.arts && y < lay.arts + lay.artsH) {
      var ap = clamp((y + vh - lay.arts) / (vh + lay.artsH), 0, 1);
      var sk = clamp(-vel * .25, -7, 7); skew += (sk - skew) * .15; if (Math.abs(skew) > .05) more = true;
      artsRow.style.transform = "translate3d(" + (-(lay.rowW - W * .85) * ap).toFixed(1) + "px,0,0) skewX(" + skew.toFixed(2) + "deg)";
    }

    /* seu Daniel: a foto surge e se afasta suavemente */
    if (y + vh > lay.story && y < lay.story + lay.storyH) {
      var sp = clamp((y - lay.story) / (lay.storyH - vh), 0, 1), e1 = ease(clamp(sp / .45, 0, 1));
      story.style.setProperty("--cf", (.25 + .75 * e1).toFixed(3));
      story.style.setProperty("--cs", (1.25 - .25 * e1).toFixed(3));
      story.style.setProperty("--co", clamp((sp - .3) / .2, 0, 1).toFixed(3));
      story.style.setProperty("--t1", clamp((sp - .38) / .12, 0, 1).toFixed(3));
      story.style.setProperty("--t2", clamp((sp - .48) / .06, 0, 1).toFixed(3));
      story.style.setProperty("--t3", clamp((sp - .86) / .08, 0, 1).toFixed(3));
      var n = Math.round(clamp((sp - .52) / .3, 0, 1) * words.length);
      for (var wi = 0; wi < words.length; wi++) words[wi].classList.toggle("on", wi < n);
    }

    /* lema: foto em paralaxe */
    if (y + vh > lay.faith && y < lay.faith + lay.faithH) fphoto.style.setProperty("--fy", ((y + vh - lay.faith) * -.12).toFixed(1) + "px");

    if (more) kick();
  }
  function arrive() { if (!destEl.classList.contains("arrived")) destEl.classList.add("arrived"); }
  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", kick, {passive: true});

  var destEl = $("#orcamento");
  if (!motion) destEl.classList.add("arrived");
  form.addEventListener("focusin", arrive);
  new IntersectionObserver(function (es) { if (es[0].intersectionRatio > .55) arrive(); }, {threshold: .55}).observe(form);
  var lt = 0;
  function relayout() { clearTimeout(lt); lt = setTimeout(layout, 120); }
  var lastW = innerWidth;
  addEventListener("resize", function () { if (innerWidth !== lastW || Math.abs(innerHeight - vh) > 120) { lastW = innerWidth; relayout(); } });
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(main);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  addEventListener("load", relayout);
  layout();
})();
