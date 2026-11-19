/* =========================================================
   CONFIGURAZIONE — modifica qui i dati del matrimonio
   ========================================================= */
const CONFIG = {
  // Data e ora della cerimonia (ora italiana)
  weddingDate: "2027-04-24T11:00:00+02:00",

  // Dove arrivano le conferme RSVP.
  // Opzione consigliata: Google Apps Script collegato a un Google Sheet (vedi README.md)
  // oppure un form gratuito di https://formspree.io (es. "https://formspree.io/f/abcdwxyz").
  // Se lasciato vuoto, il modulo apre un'email precompilata verso rsvpEmail.
  rsvpEndpoint: "",
  rsvpEmail: "tuaemail@esempio.it",

  // Evento per "Aggiungi al calendario"
  calendar: {
    title: "Matrimonio di Tommaso & Margherita",
    location: "[Nome della chiesa], [Città]",
    start: "20270424T090000Z", // 11:00 ora italiana
    end: "20270424T220000Z",
  },

  // Foto della galleria: metti i file nella cartella images/ con questi nomi.
  // size: "tall" (alta), "wide" (larga) oppure "" (normale)
  photos: [
    { src: "images/foto1.jpg", caption: "Il nostro primo viaggio", emoji: "✈️", size: "tall" },
    { src: "images/foto2.jpg", caption: "Tramonto al mare", emoji: "🌅", size: "" },
    { src: "images/foto3.jpg", caption: "In montagna", emoji: "🏔️", size: "" },
    { src: "images/foto4.jpg", caption: "Weekend in città", emoji: "🏛️", size: "wide" },
    { src: "images/foto5.jpg", caption: "Cene tra amici", emoji: "🍝", size: "" },
    { src: "images/foto6.jpg", caption: "Road trip", emoji: "🚗", size: "tall" },
    { src: "images/foto7.jpg", caption: "Il giorno della proposta", emoji: "💍", size: "wide" },
    { src: "images/foto8.jpg", caption: "Noi due", emoji: "❤️", size: "" },
  ],
};

/* ========================================================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-visible");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("is-visible"), 2800);
}

/* ---------- Countdown ---------- */
(function countdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  const els = {
    d: $("#cd-days"), h: $("#cd-hours"), m: $("#cd-minutes"), s: $("#cd-seconds"),
  };
  const pad = (n, l = 2) => String(n).padStart(l, "0");

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      $("#countdown").hidden = true;
      $("#countdown-done").hidden = false;
      return;
    }
    const s = Math.floor(diff / 1000);
    els.d.textContent = pad(Math.floor(s / 86400), 3);
    els.h.textContent = pad(Math.floor((s % 86400) / 3600));
    els.m.textContent = pad(Math.floor((s % 3600) / 60));
    els.s.textContent = pad(s % 60);
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();
})();

/* ---------- Nav ---------- */
(function nav() {
  const nav = $("#nav");
  const toggle = $(".nav__toggle");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 60);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  $$(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", false);
    })
  );
})();

/* ---------- Reveal on scroll ---------- */
(function reveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
})();

/* ---------- Gallery + lightbox ---------- */
(function gallery() {
  const grid = $("#gallery");
  const palette = [
    ["#c8743c", "#8b2e2a"], ["#d8b46a", "#c8743c"], ["#56664f", "#2f3b2b"],
    ["#8b2e2a", "#4a1a18"], ["#c9a45c", "#56664f"],
  ];
  const loaded = [];

  CONFIG.photos.forEach((p, i) => {
    const fig = document.createElement("button");
    fig.type = "button";
    fig.className = "gallery__item" + (p.size ? ` gallery__item--${p.size}` : "");
    const [c1, c2] = palette[i % palette.length];
    fig.style.setProperty("--c1", c1);
    fig.style.setProperty("--c2", c2);
    fig.innerHTML = `
      <img src="${p.src}" alt="${p.caption}" loading="lazy">
      <span class="gallery__ph">${p.emoji || "📷"}<small>Aggiungi ${p.src}</small></span>
      <figcaption>${p.caption}</figcaption>`;
    const img = $("img", fig);
    img.addEventListener("error", () => fig.classList.add("is-placeholder"));
    img.addEventListener("load", () => loaded.push(i));
    fig.addEventListener("click", () => {
      if (!fig.classList.contains("is-placeholder")) open(i);
    });
    grid.appendChild(fig);
  });

  const lb = $("#lightbox");
  const lbImg = $("#lightbox-img");
  const lbCap = $("#lightbox-caption");
  let current = 0;

  function show(i) {
    current = i;
    const p = CONFIG.photos[i];
    lbImg.src = p.src;
    lbImg.alt = p.caption;
    lbCap.textContent = p.caption;
  }
  function open(i) {
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.hidden = true;
    document.body.style.overflow = "";
  }
  function step(dir) {
    const available = [...loaded].sort((a, b) => a - b);
    if (!available.length) return;
    const pos = available.indexOf(current);
    show(available[(pos + dir + available.length) % available.length]);
  }

  $(".lightbox__close").addEventListener("click", close);
  $(".lightbox__prev").addEventListener("click", () => step(-1));
  $(".lightbox__next").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();

/* ---------- Aggiungi al calendario (.ics) ---------- */
$("#add-calendar").addEventListener("click", () => {
  const c = CONFIG.calendar;
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tommaso e Margherita//IT",
    "BEGIN:VEVENT",
    "UID:matrimonio-tommaso-margherita-20270424",
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${c.start}`, `DTEND:${c.end}`,
    `SUMMARY:${c.title}`, `LOCATION:${c.location}`,
    "DESCRIPTION:Non vediamo l'ora di festeggiare con te! 🌸",
    "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", "DESCRIPTION:Tra una settimana ci sposiamo!", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "matrimonio-tommaso-margherita.ics" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Evento scaricato: aprilo per aggiungerlo al calendario 📅");
});

/* ---------- RSVP ---------- */
(function rsvp() {
  const form = $("#rsvp-form");
  const extra = $("#rsvp-extra");
  const status = $("#rsvp-status");

  $$('input[name="presenza"]', form).forEach((r) =>
    r.addEventListener("change", () => extra.classList.toggle("is-hidden", r.value === "No" && r.checked))
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    ["#name", "#email"].forEach((sel) => {
      const el = $(sel, form);
      const bad = !el.value.trim();
      el.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!$('input[name="presenza"]:checked', form)) ok = false;
    if (!ok) {
      status.textContent = "Compila i campi obbligatori (*) 🙏";
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    if (data.presenza === "No") {
      ["adulti", "bambini", "accompagnatori", "alimentazione", "canzone"].forEach((k) => delete data[k]);
    }
    data.inviato = new Date().toLocaleString("it-IT");

    const btn = $("button[type=submit]", form);
    btn.disabled = true;
    status.textContent = "Invio in corso…";

    try {
      if (CONFIG.rsvpEndpoint) {
        const res = await fetch(CONFIG.rsvpEndpoint, {
          method: "POST",
          // Google Apps Script non restituisce header CORS: inviamo "alla cieca"
          mode: CONFIG.rsvpEndpoint.includes("script.google.com") ? "no-cors" : "cors",
          headers: { Accept: "application/json" },
          body: new URLSearchParams(data),
        });
        if (!res.ok && res.type !== "opaque") throw new Error(res.status);
      } else {
        const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
        location.href = `mailto:${CONFIG.rsvpEmail}?subject=${encodeURIComponent(
          `RSVP matrimonio — ${data.nome}`
        )}&body=${encodeURIComponent(body)}`;
      }
      const yes = data.presenza === "Sì";
      form.innerHTML = `
        <div class="rsvp__thanks">
          <h3>${yes ? "Evviva! 🎉" : "Ci mancherai 💛"}</h3>
          <p>${yes
            ? `Grazie ${data.nome.split(" ")[0]}, non vediamo l'ora di festeggiare con te il 24 aprile 2027!`
            : `Grazie ${data.nome.split(" ")[0]} per averci avvisato. Ti penseremo!`}</p>
        </div>`;
      if (yes) burst();
    } catch (err) {
      console.error(err);
      status.textContent = "Ops, qualcosa è andato storto. Riprova o scrivici direttamente!";
      btn.disabled = false;
    }
  });
})();

/* ---------- Copia IBAN ---------- */
$("#copy-iban").addEventListener("click", async () => {
  const iban = $("#iban").textContent.replace(/\s+/g, "");
  try {
    await navigator.clipboard.writeText(iban);
  } catch {
    const ta = Object.assign(document.createElement("textarea"), { value: iban });
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  toast("IBAN copiato! Grazie di cuore 🇯🇵");
});

/* ---------- Petali di ciliegio che cadono ---------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function spawnLeaf(emoji) {
  const box = $(".leaves");
  const leaf = document.createElement("span");
  leaf.className = "leaf";
  leaf.textContent = emoji || (Math.random() > 0.3 ? "🌸" : "💮");
  leaf.style.left = Math.random() * 100 + "vw";
  leaf.style.setProperty("--s", 12 + Math.random() * 16 + "px");
  leaf.style.setProperty("--d", 9 + Math.random() * 8 + "s");
  leaf.style.setProperty("--x", (Math.random() * 160 - 80).toFixed(0) + "px");
  box.appendChild(leaf);
  leaf.addEventListener("animationend", () => leaf.remove());
}
function burst() {
  if (reduceMotion) return;
  for (let i = 0; i < 40; i++) setTimeout(() => spawnLeaf(["🌸", "🎉", "💛", "💮"][i % 4]), i * 60);
}
if (!reduceMotion) {
  for (let i = 0; i < 4; i++) setTimeout(spawnLeaf, i * 900);
  setInterval(() => { if (!document.hidden) spawnLeaf(); }, 2600);
}
