/* Promemoria via email: striscia stagionale in alto, finestra in uscita (computer), barra discreta (telefono),
   riquadro in fondo a guide e strumenti, moduli "Avvisami". Nessun cookie: solo localStorage per non ripetere. */
(function () {
  "use strict";
  // Indirizzo del modulo Brevo (da impostare quando l'account e' pronto). Vuoto = modalita' anteprima, non invia nulla.
  var BREVO_URL = "";
  var PAGINE_ESCLUSE = /carica-report/;
  if (PAGINE_ESCLUSE.test(location.pathname)) return;

  var GIORNI_PAUSA = 30;
  var home = /(^\/$|index\.html$)/.test(location.pathname);
  function leggi(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function scrivi(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function inPausa(k) { var t = +leggi(k); return t && Date.now() - t < GIORNI_PAUSA * 864e5; }
  function iscritto() { return !!leggi("mtt_iscritto"); }

  var css = ".mtt-striscia{background:#10231C;color:#fff;font-size:14px;line-height:1.4;padding:9px 44px 9px 16px;text-align:center;position:relative}" +
    ".mtt-striscia a{color:#fff;font-weight:700;text-decoration:underline;text-underline-offset:3px;margin-left:6px}" +
    ".mtt-x{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:inherit;font-size:22px;line-height:1;cursor:pointer;padding:6px 10px}" +
    ".mtt-velo{position:fixed;inset:0;background:rgba(16,35,28,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:1000}" +
    ".mtt-finestra{background:#fff;border-radius:12px;max-width:440px;width:100%;padding:26px 24px 22px;position:relative;box-shadow:0 20px 50px rgba(0,0,0,.25)}" +
    ".mtt-finestra h2{margin:0 0 8px;font-size:22px;line-height:1.25;color:#10231C}.mtt-finestra p{margin:0 0 14px;color:#4b5b55}" +
    ".mtt-finestra .mtt-x{top:14px;transform:none;color:#4b5b55}" +
    ".mtt-modulo{display:grid;gap:12px}.mtt-modulo label{display:grid;gap:6px;font-size:14px;font-weight:600;color:#10231C}" +
    ".mtt-modulo input[type=email],.mtt-modulo select{font:inherit;font-weight:400;padding:11px 12px;border:1px solid #c9d6d0;border-radius:6px;background:#fff;color:#10231C}" +
    ".mtt-modulo .mtt-spunta{display:flex;gap:10px;align-items:flex-start;font-weight:500;font-size:13px}.mtt-modulo .mtt-spunta input{margin-top:3px}" +
    ".mtt-modulo button{font:inherit;font-weight:700;background:#16604A;color:#fff;border:0;border-radius:8px;padding:12px 16px;cursor:pointer}" +
    ".mtt-modulo button:focus-visible,.mtt-x:focus-visible,.mtt-barra button:focus-visible{outline:2px solid #16604A;outline-offset:2px}" +
    ".mtt-esito{margin:0;font-weight:600;color:#16604A;min-height:1.2em}" +
    ".mtt-barra{position:fixed;left:12px;right:12px;bottom:12px;background:#10231C;color:#fff;border-radius:10px;padding:10px 40px 10px 14px;display:flex;gap:10px;align-items:center;justify-content:space-between;font-size:14px;z-index:900;box-shadow:0 8px 24px rgba(0,0,0,.2)}" +
    ".mtt-barra button.mtt-apri{background:#fff;color:#10231C;border:0;border-radius:6px;font:inherit;font-weight:700;padding:8px 12px;white-space:nowrap;cursor:pointer}" +
    ".mtt-barra .mtt-x{right:2px}" +
    ".mtt-box{border:1px solid #c9d6d0;border-radius:10px;background:#EEF4F1;padding:22px;margin:28px 0;display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center}" +
    ".mtt-box h2{margin:0 0 6px;font-size:20px}.mtt-box p{margin:0;color:#4b5b55}" +
    "@media (max-width:760px){.mtt-box{grid-template-columns:1fr}}" +
    "@media (prefers-reduced-motion:no-preference){.mtt-finestra{animation:mttsu .18s ease-out}}@keyframes mttsu{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function modulo(prefisso) {
    return '<form class="mtt-modulo" novalidate>' +
      '<label>La tua email<input type="email" name="EMAIL" required autocomplete="email" placeholder="nome@esempio.it"></label>' +
      '<label>Il tuo broker principale<select name="BROKER"><option value="">Scegli (facoltativo)</option><option>Interactive Brokers</option><option>DEGIRO</option><option>Fineco</option><option>eToro</option><option>Trading 212</option><option>Altro</option></select></label>' +
      '<label class="mtt-spunta"><input type="checkbox" name="CONSENSO" required> <span>Voglio ricevere i promemoria. Ho letto la <a href="privacy.html#promemoria">privacy policy</a>.</span></label>' +
      '<button type="submit">Avvisami</button><p class="mtt-esito" role="status"></p></form>';
  }

  function collega(form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var esito = form.querySelector(".mtt-esito, .avvisami-esito");
      if (!form.reportValidity()) return;
      var ok = function () {
        scrivi("mtt_iscritto", String(Date.now()));
        esito.textContent = "Fatto! Controlla la tua email e conferma l'iscrizione con il link che ti abbiamo mandato.";
        form.reset();
        var b = document.querySelector(".mtt-barra"); if (b) b.remove();
      };
      if (!BREVO_URL) { ok(); return; }             // anteprima: non invia nulla
      var dati = new FormData(form);
      dati.set("OPT_IN", "1");
      fetch(BREVO_URL, { method: "POST", body: dati, mode: "no-cors" }).then(ok, function () {
        esito.textContent = "Non è stato possibile completare l'iscrizione. Riprova tra qualche minuto.";
      });
    });
  }

  // 1. striscia stagionale in alto
  var m = new Date().getMonth() + 1, testo, link, etichetta, chiave;
  if (m >= 11 || m === 1) { testo = "La dichiarazione è ancora lontana? Ti avvisiamo noi quando è il momento."; etichetta = "Avvisami"; link = "#avvisami-apri"; chiave = "inverno"; }
  else if (m <= 6) { testo = "I rendiconti annuali dei broker sono disponibili: prepara i quadri in pochi secondi."; etichetta = "Scegli il piano"; link = home ? "#prezzi" : "index.html#prezzi"; chiave = "stagione"; }
  else { testo = "Ultime settimane per il modello Redditi: i tuoi quadri in pochi secondi."; etichetta = "Scegli il piano"; link = home ? "#prezzi" : "index.html#prezzi"; chiave = "redditi"; }
  var kStr = "mtt_striscia_" + chiave + "_" + new Date().getFullYear();
  if (!leggi(kStr) && !(chiave === "inverno" && iscritto())) {
    var s = document.createElement("div");
    s.className = "mtt-striscia"; s.setAttribute("role", "region"); s.setAttribute("aria-label", "Avviso");
    s.innerHTML = testo + ' <a href="' + link + '">' + etichetta + '</a><button class="mtt-x" aria-label="Chiudi l\'avviso">×</button>';
    document.body.insertBefore(s, document.body.firstChild);
    s.querySelector(".mtt-x").addEventListener("click", function () { scrivi(kStr, "1"); s.remove(); });
    s.querySelector("a").addEventListener("click", function (e) {
      if (link === "#avvisami-apri") { e.preventDefault(); apriFinestra(); }
    });
  }

  // 2. finestra (usata dalla striscia, dalla barra del telefono e dall'uscita su computer)
  var aperta = null, prima = null;
  function apriFinestra() {
    if (aperta) return;
    prima = document.activeElement;
    var v = document.createElement("div");
    v.className = "mtt-velo";
    v.innerHTML = '<div class="mtt-finestra" role="dialog" aria-modal="true" aria-labelledby="mtt-titolo">' +
      '<button class="mtt-x" aria-label="Chiudi">×</button><h2 id="mtt-titolo">Ti avvisiamo quando è il momento</h2>' +
      '<p>Ti scriviamo quando i report del tuo broker sono pronti e prima delle scadenze della dichiarazione. Poche email all\'anno, ti cancelli con un clic.</p>' +
      modulo() + '</div>';
    document.body.appendChild(v); aperta = v;
    collega(v.querySelector("form"));
    v.querySelector("input[type=email]").focus();
    v.addEventListener("click", function (e) { if (e.target === v || e.target.classList.contains("mtt-x")) chiudi(); });
  }
  function chiudi() {
    if (!aperta) return;
    aperta.remove(); aperta = null; scrivi("mtt_finestra", String(Date.now()));
    if (prima && prima.focus) prima.focus();
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") chiudi(); });

  var computer = window.matchMedia("(pointer:fine) and (min-width: 900px)").matches;
  var inizio = Date.now();
  if (computer) {
    document.addEventListener("mouseout", function (e) {
      if (e.relatedTarget || e.clientY > 0) return;
      if (Date.now() - inizio < 8000 || iscritto() || inPausa("mtt_finestra") || aperta) return;
      apriFinestra();
    });
  } else if (!iscritto() && !inPausa("mtt_barra")) {
    // 3. barra discreta sul telefono, dopo meta' pagina
    var mostrata = false;
    window.addEventListener("scroll", function () {
      if (mostrata) return;
      var fatto = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (fatto < 0.5) return;
      mostrata = true;
      var b = document.createElement("div");
      b.className = "mtt-barra"; b.setAttribute("role", "region"); b.setAttribute("aria-label", "Promemoria");
      b.innerHTML = '<span>Ti avvisiamo quando è il momento della dichiarazione</span><button class="mtt-apri">Avvisami</button><button class="mtt-x" aria-label="Chiudi">×</button>';
      document.body.appendChild(b);
      b.querySelector(".mtt-apri").addEventListener("click", function () { b.remove(); apriFinestra(); });
      b.querySelector(".mtt-x").addEventListener("click", function () { scrivi("mtt_barra", String(Date.now())); b.remove(); });
    }, { passive: true });
  }

  // 4. riquadro in fondo a guide e strumenti (prima dell'avvertenza)
  var avv = document.querySelector("main .avvertenza");
  if (avv && !home) {
    var box = document.createElement("section");
    box.className = "mtt-box";
    box.innerHTML = '<div><h2>Ti avvisiamo quando è il momento</h2><p>Un\'email quando i report del tuo broker sono pronti e prima delle scadenze della dichiarazione. Poche all\'anno, ti cancelli con un clic.</p></div>' + modulo();
    avv.parentNode.insertBefore(box, avv);
    collega(box.querySelector("form"));
  }

  // 5. modulo gia' presente nella home
  var mh = document.getElementById("avvisami-modulo");
  if (mh) collega(mh);
})();
