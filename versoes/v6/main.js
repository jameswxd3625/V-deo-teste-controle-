/* Diego Mudanças — v4 */
(function () {
  "use strict";
  var D = window.DIEGO || {};
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* contatos */
  var waUrl = function (t) { return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(t); };
  $$("[data-wa-msg]").forEach(function (a) { a.href = waUrl(a.getAttribute("data-wa-msg")); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa-label]").forEach(function (a) { a.textContent = "WhatsApp " + D.whatsappLabel; });
  $$("[data-ig]").forEach(function (a) { a.href = "https://www.instagram.com/" + D.instagram; });
  $$("[data-ig-label]").forEach(function (a) { a.textContent = "@" + D.instagram; });
  $$("[data-cidade]").forEach(function (a) { a.textContent = D.cidade; });
  $$("[data-ano]").forEach(function (a) { a.textContent = new Date().getFullYear(); });

  /* menu */
  var mb = $(".menu-btn"), sheet = $("#menu");
  function setMenu(open) {
    mb.setAttribute("aria-expanded", open); mb.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add("open"); }); }
    else { sheet.classList.remove("open"); setTimeout(function () { if (mb.getAttribute("aria-expanded") === "false") sheet.hidden = true; }, 320); }
  }
  mb.addEventListener("click", function () { setMenu(mb.getAttribute("aria-expanded") !== "true"); });
  var sc = $(".sheet-close"); if (sc) sc.addEventListener("click", function () { setMenu(false); mb.focus(); });
  $$("a", sheet).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && mb.getAttribute("aria-expanded") === "true") { setMenu(false); mb.focus(); } });

  /* revelação suave (só o que está abaixo da primeira tela) */
  var rvEls = $$(".b-head, .frame, .panel, .tile, .steps li, .story-media, .story-copy, .card, .faq details, .vhead, .q-head, .form");
  rvEls.forEach(function (el, i) {
    if (el.getBoundingClientRect().top < innerHeight) return;
    el.classList.add("rv");
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty("--d", Math.min(sib, 5) * 0.06 + "s");
  });
  var rv = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }); }, {rootMargin: "0px 0px -8% 0px"});
  $$(".rv").forEach(function (el) { rv.observe(el); });

  /* ============ o percurso que atravessa a página ============ */
  var J = $("#journey"), jPaths = J ? $$("path", J) : [], jTruck = J && $(".j-truck", J), jMain = J && $(".j-b", J);
  var jLen = 0, jTop = 0, jBottom = 0;
  function absPos(el, fx, fy) { var r = el.getBoundingClientRect(); return [r.left + scrollX + r.width * fx, r.top + scrollY + r.height * fy]; }
  function buildJourney() {
    if (!J || !$(".hero-art")) return;
    var W = doc.clientWidth, mob = W < 980;
    var hero = $(".hero-art"), dest = $("#dest");
    var start = mob ? [13, absPos(hero, 0.5, 0.9)[1]] : absPos(hero, 0.92, 0.9); // sai da ilustração
    var end = mob ? [13, absPos(dest, 0.5, 0.92)[1]] : absPos(dest, 0.5, 0.92);
    var secs = ["#como-funciona", "#protecao", "#historia", "#servicos", "#videos", "#duvidas"].map(function (s) { return $(s); });
    var edgeL = mob ? 10 : Math.max(26, (W - 1200) / 2 - 40), edgeR = mob ? W - 10 : W - edgeL;
    var pts = [start];
    secs.forEach(function (s, i) {
      var r = s.getBoundingClientRect(), y = r.top + scrollY;
      var x = (i % 2 === 0) ? edgeR : edgeL;
      if (mob) x = 13;
      pts.push([x, y + 70]);
      pts.push([x, y + r.height - 70]);
    });
    pts.push(end);
    // curva suave: vertical nas margens, cruzando nas folgas entre seções
    var d = "M " + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], dy = (b[1] - a[1]) * 0.5;
      d += " C " + a[0].toFixed(1) + " " + (a[1] + dy).toFixed(1) + " " + b[0].toFixed(1) + " " + (b[1] - dy).toFixed(1) + " " + b[0].toFixed(1) + " " + b[1].toFixed(1);
    }
    var H = doc.scrollHeight;
    J.setAttribute("width", W); J.setAttribute("height", H); J.style.height = H + "px";
    J.setAttribute("viewBox", "0 0 " + W + " " + H);
    jPaths.forEach(function (p) { p.setAttribute("d", d); });
    jLen = jMain.getTotalLength(); jTop = start[1]; jBottom = end[1];
    drawJourney();
  }
  function drawJourney() {
    if (!jLen || !J) return;
    var target = scrollY + innerHeight * 0.62;
    var p = reduce ? 1 : Math.max(0, Math.min(1, (target - jTop) / (jBottom - jTop)));
    // progresso por distância vertical aproximada ao longo da curva
    var lo = 0, hi = jLen, pt;
    var yT = jTop + (jBottom - jTop) * p;
    for (var k = 0; k < 22; k++) { var mid = (lo + hi) / 2; pt = jMain.getPointAtLength(mid); if (pt.y < yT) lo = mid; else hi = mid; }
    var frac = lo / jLen;
    J.style.setProperty("--jp", frac.toFixed(4));
    var a = jMain.getPointAtLength(lo), b = jMain.getPointAtLength(Math.min(jLen, lo + 2));
    var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    var flip = Math.abs(ang) > 90;
    jTruck.setAttribute("transform", "translate(" + a.x.toFixed(1) + " " + a.y.toFixed(1) + ") rotate(" + (flip ? ang + 180 : ang).toFixed(1) + ")" + (flip ? " scale(-1 1)" : ""));
    jTruck.style.opacity = frac > 0.03 && frac < 0.995 && !reduce ? 1 : 0;
  }
  var ticking = false;
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { drawJourney(); onScroll(); ticking = false; }); } }, {passive: true});
  var rT; addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(buildJourney, 150); });
  addEventListener("load", buildJourney);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildJourney);
  buildJourney();

  /* topo, botão flutuante, link ativo */
  var top = $(".top"), fab = $(".wa-fab"), quote = $("#orcamento");
  function onScroll() {
    top.classList.toggle("solid", scrollY > 20);
    var q = quote.getBoundingClientRect();
    fab.classList.toggle("show", scrollY > innerHeight * 0.8 && !(q.top < innerHeight * 0.85));
  }
  onScroll();
  var navLinks = $$(".nav a");
  var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); }); }, {rootMargin: "-45% 0px -50% 0px"});
  $$("main section[id]").forEach(function (s) { so.observe(s); });

  /* ============ como funciona: etapas + percurso ============ */
  var steps = $$("#steps li"), sw = $("#stepsWrap"), stepTimer = null, cur = -1;
  function setStep(k) {
    cur = k;
    steps.forEach(function (li, i) { li.classList.toggle("on", i === k); li.classList.toggle("past", i < k); });
    sw.style.setProperty("--sp", steps[k].dataset.p);
  }
  function auto() { clearInterval(stepTimer); if (reduce) return; stepTimer = setInterval(function () { setStep((cur + 1) % steps.length); }, 2600); }
  steps.forEach(function (li, i) { $("button", li).addEventListener("click", function () { setStep(i); auto(); }); });
  new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { if (cur < 0) setStep(0); auto(); } else clearInterval(stepTimer); }); }, {threshold: 0.3}).observe(sw);
  if (reduce) setStep(3);

  /* ============ capas: Geladeira · Sofá · Cama ============ */
  var cv = $("#capas"), pBtns = $$("#pieces button[role=tab]"), pNote = $("#pieceNote");
  var pTimes = pBtns.map(function (b) { return parseFloat(b.dataset.at); });
  var NOTES = ["Geladeira: o tecido encontra primeiro as quinas e desce pelas laterais.", "Sofá: a capa se acomoda nos braços e depois no assento.", "Cama: a capa acompanha a espessura e os cantos do colchão."];
  var pCur = -1;
  function pSet(k) { if (k === pCur) return; pCur = k; pBtns.forEach(function (b, i) { b.setAttribute("aria-selected", i === k); }); pNote.textContent = NOTES[k]; }
  function pTick() { var t = cv.currentTime, k = 0; for (var i = 0; i < pTimes.length; i++) if (t >= pTimes[i] - 0.4) k = i; pSet(k); if (!cv.paused) requestAnimationFrame(pTick); }
  cv.addEventListener("play", function () { requestAnimationFrame(pTick); });
  cv.addEventListener("seeked", pTick);
  function playV(v) { if (reduce || v.dataset.user === "paused") return; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
  pBtns.forEach(function (b, i) { b.addEventListener("click", function () { if (!cv.src) cv.src = cv.dataset.src; cv.currentTime = pTimes[i] + 0.05; pSet(i); playV(cv); }); });
  pSet(0);
  new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; playV(v); } else v.pause(); }); }, {threshold: 0.25}).observe(cv);
  $$(".vtoggle").forEach(function (b) {
    var v = document.getElementById(b.dataset.for);
    function sync() { b.setAttribute("aria-label", v.paused ? "Reproduzir animação" : "Pausar animação"); $("use", b).setAttribute("href", v.paused ? "#i-play" : "#i-pause"); }
    b.addEventListener("click", function () { if (v.paused) { v.dataset.user = ""; if (!v.src) v.src = v.dataset.src; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else { v.dataset.user = "paused"; v.pause(); } });
    v.addEventListener("play", sync); v.addEventListener("pause", sync); sync();
  });

  /* ============ história: ouvir com som ============ */
  var sm = $("#storyMedia"), sPlay = $(".story-play", sm);
  function playStory() {
    $$("video").forEach(function (o) { if (!o.muted) o.pause(); });
    var v = $("video", sm);
    if (!v) { v = document.createElement("video"); v.src = sPlay.dataset.src; v.controls = true; v.playsInline = true; v.poster = $("img", sm).src; sm.appendChild(v); }
    sm.classList.add("on"); v.muted = false;
    var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    sm.scrollIntoView({block: "nearest", behavior: reduce ? "auto" : "smooth"});
  }
  sPlay.addEventListener("click", playStory);
  $("#storyBtn").addEventListener("click", playStory);

  /* ============ vídeos reais ============ */
  var V = [
    ["media/ig/video-06", "30 anos na mesma casa", "Seu Daniel"],
    ["media/ig/video-09", "Mais uma mudança entregue", "Palavra de cliente"],
    ["media/ig/video-04", "Embalagem completa", "Item por item"],
    ["media/ig/video-02", "A queridinha da casa", "A geladeira"],
    ["media/ig/video-01", "Guarda-móveis", "Proteção em camadas"],
    ["media/ig/video-03", "Tudo em um só lugar", "Frota e equipe"],
    ["media/equipe-02-paqueta", "Equipe 02 em execução", "Paquetá, BH"],
    ["media/hora-de-descarregar", "Hora de descarregar", "Nossos caminhões"],
    ["media/ig/video-16", "Como num passe de mágica", "Antes e depois"],
    ["media/ig/video-05", "Uma nova fase na frota", "Novas plotagens"],
    ["media/ig/video-07", "Nossos caminhões", "Frota própria"],
    ["media/ig/video-08", "Proteção e fé", "Salmo 139"]
  ];
  var rail = $("#vrail");
  rail.innerHTML = V.map(function (v) {
    return '<div class="vid" style="background-image:url(' + v[0] + '.webp)"><button class="play" type="button" data-src="' + v[0] + '.mp4" aria-label="Assistir: ' + v[1] + '"><i><svg><use href="#i-play"/></svg></i><b>' + v[1] + "</b><span>" + v[2] + "</span></button></div>";
  }).join("");
  $$(".vid .play", rail).forEach(function (b) {
    b.addEventListener("click", function () {
      $$("video", rail).forEach(function (o) { o.pause(); });
      var box = b.parentElement, v = $("video", box);
      if (!v) { v = document.createElement("video"); v.src = b.dataset.src; v.controls = true; v.playsInline = true; box.insertBefore(v, box.firstChild); }
      box.classList.add("on"); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    });
  });
  $$(".rn").forEach(function (b) { b.addEventListener("click", function () { rail.scrollBy({left: parseInt(b.dataset.dir, 10) * rail.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth"}); }); });

  /* ============ orçamento ============ */
  var form = $("#form");
  var gmOnly = $(".gm-only", form), lO = $("[data-l-origem]", form), lD = $("[data-l-destino]", form), dIn = form.elements.destino;
  function tipoChanged() {
    var gm = form.elements.tipo.value === "guarda-móveis";
    gmOnly.hidden = !gm;
    lO.textContent = gm ? "Onde os móveis estão" : "Saindo de";
    lD.innerHTML = gm ? 'Endereço final <small>(se já souber)</small>' : "Indo para";
    dIn.required = !gm; dIn.placeholder = gm ? "Ainda não sei / bairro e cidade" : "Bairro e cidade";
    if (gm) dIn.closest(".field").classList.remove("bad");
    buildJourney();
  }
  $$("input[name=tipo]", form).forEach(function (r) { r.addEventListener("change", tipoChanged); });
  $$("[data-tipo]").forEach(function (a) { a.addEventListener("click", function () { var r = $('input[name=tipo][value="' + a.dataset.tipo + '"]', form); if (r) { r.checked = true; tipoChanged(); } }); });
  function check(inp) { var ok = inp.value.trim().length > 1; inp.closest(".field").classList.toggle("bad", !ok); inp.setAttribute("aria-invalid", !ok); return ok; }
  $$("[name=origem],[name=destino],[name=nome]", form).forEach(function (i) {
    i.addEventListener("blur", function () { if (i.value && i.required) check(i); });
    i.addEventListener("input", function () { if (i.closest(".bad")) check(i); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = $$("[required]", form).filter(function (i) { return !check(i); });
    if (bad.length) { bad[0].focus(); return; }
    var f = new FormData(form), gm = f.get("tipo") === "guarda-móveis";
    var t = "Olá! Meu nome é " + f.get("nome").trim() + ".\n" +
      "Gostaria de um orçamento: " + (gm ? "guarda-móveis" : "mudança " + f.get("tipo")) + ".\n" +
      (gm ? "Os móveis estão em: " + f.get("origem").trim() + "\nEndereço final: " + (f.get("destino").trim() || "ainda não definido") + (f.get("tempo").trim() ? "\nPor quanto tempo: " + f.get("tempo").trim() : "")
          : "Saindo de: " + f.get("origem").trim() + "\nIndo para: " + f.get("destino").trim()) +
      (f.get("itens").trim() ? "\nPreciso levar: " + f.get("itens").trim() : "") +
      (f.get("data").trim() ? "\nData aproximada: " + f.get("data").trim() : "") +
      "\n\n(Mensagem enviada pelo site)";
    var w = window.open(waUrl(t), "_blank");
    if (w) w.opener = null; else location.href = waUrl(t);
  });
})();
