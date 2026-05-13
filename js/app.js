// ====== CONFIG ======
const WHATSAPP_NUMBER = "525567449830";

/*
  Base de comportamiento de QUOV IA.
  Si luego conectas una IA real por backend, esta es la personalidad/prompt base:
  - Eres QUOV IA, asistente de ventas de QUOV.
  - Hablas en español, breve, amable, natural y con energía de vendedor.
  - Tu objetivo es vender libros del catálogo de la página.
  - Solo respondes sobre el catálogo, precios, disponibilidad, recomendaciones y compra por WhatsApp.
  - Cuando un libro exista, confirma disponibilidad y di el precio exacto de la página.
  - Cuando un usuario pregunte “¿en cuánto está?” después de mencionar un libro, entiendes el contexto.
  - No hablas como IA general ni como Claude.
  - No inventas libros, precios ni stock.
  - Si no encuentras el libro, sugieres opciones parecidas del catálogo.
  - Siempre buscas cerrar con una acción simple: “si quieres, te lo aparto por WhatsApp”.
*/

const featured = [
  "poder-pensamiento-positivo",
  "poder-del-ahora",
  "habitos-atomicos-simple",
  "habitos-atomicos-completa",
];

// ====== CATÁLOGO ======
const catalog = [
  {
    id: "poder-pensamiento-positivo",
    title: "El Poder del Pensamiento Positivo",
    price: 220,
    status: "available",
    img: "../img/pensamiento-positivo.png",
    aliases: ["pensamiento positivo", "poder pensamiento positivo"],
    pitch: "Ideal si buscas mentalidad fuerte, motivación y enfoque."
  },
  {
    id: "1984",
    title: "1984 - George Orwell",
    price: 170,
    status: "available",
    img: "../img/1984.png",
    aliases: ["1984", "orwell", "george orwell"],
    pitch: "Una lectura clásica, intensa y de las que se quedan contigo."
  },
  {
    id: "habitos-atomicos-simple",
    title: "Hábitos Atómicos (versión simple)",
    price: 150,
    status: "available",
    img: "../img/habitos.png",
    aliases: ["habitos atomicos simple", "habitos atomicos version simple", "hábitos atómicos simple"],
    pitch: "Perfecto para empezar a trabajar disciplina, constancia y hábitos."
  },
  {
    id: "habitos-atomicos-completa",
    title: "Hábitos Atómicos (versión completa)",
    price: 350,
    status: "available",
    img: "../img/habitos-completa.png",
    aliases: ["habitos atomicos completa", "habitos atomicos version completa", "hábitos atómicos completa"],
    pitch: "La versión más completa si quieres ir con todo desde el inicio."
  },
  {
    id: "secretos-mente-millonaria",
    title: "Los Secretos de la Mente Millonaria",
    price: 250,
    status: "available",
    img: "../img/secretos-mente-millonaria.png",
    aliases: ["mente millonaria", "secretos mente millonaria"],
    pitch: "Muy bueno si te interesa dinero, mentalidad y crecimiento financiero."
  },
  {
    id: "piense-hagase-rico",
    title: "Piense y Hágase Rico",
    price: 250,
    status: "available",
    img: "../img/piense.png",
    aliases: ["piense y hagase rico", "piensa y hagase rico", "hagase rico"],
    pitch: "Un clásico de finanzas personales y mentalidad de éxito."
  },
  {
    id: "padre-rico-padre-pobre",
    title: "Padre Rico, Padre Pobre",
    price: 250,
    status: "available",
    img: "../img/padre-rico.png",
    aliases: ["padre rico padre pobre", "padre rico", "robert kiyosaki"],
    pitch: "De los más buscados para empezar en educación financiera."
  },
  {
    id: "poder-del-ahora",
    title: "El Poder del Ahora",
    price: 180,
    status: "available",
    img: "../img/poder-ahora.png",
    aliases: ["poder del ahora", "el ahora"],
    pitch: "Excelente si buscas paz mental, presencia y claridad."
  },
  {
    id: "inteligencia-emocional",
    title: "Inteligencia Emocional",
    price: 300,
    status: "available",
    img: "../img/inteligencia-emocional.png",
    aliases: ["inteligencia emocional", "daniel goleman", "goleman"],
    pitch: "Muy buena opción si quieres trabajar emociones, relaciones y autocontrol."
  },
  {
    id: "si-lo-crees-lo-creas",
    title: "Si lo Crees lo Creas",
    price: 200,
    status: "available",
    img: "../img/si-lo-crees.png",
    aliases: ["si lo crees lo creas"],
    pitch: "Una opción muy buena para motivación y crecimiento personal."
  },
  {
    id: "levedad-del-ser",
    title: "La Levedad del Ser",
    price: 200,
    status: "available",
    img: "../img/levedad-ser.png",
    aliases: ["levedad del ser", "la levedad del ser"],
    pitch: "Ideal si quieres algo más profundo, reflexivo y distinto."
  },
  {
    id: "hombre-rico-babilonia",
    title: "El Hombre Más Rico de Babilonia",
    price: 150,
    status: "available",
    img: "../img/hombre-babilonia.png",
    aliases: ["hombre mas rico de babilonia", "rico de babilonia", "babilonia"],
    pitch: "Muy recomendado si quieres empezar fácil en finanzas personales."
  },
];

const chatState = {
  lastBookId: null,
  lastCollection: null,
  lastShownBooks: [],
  lastIntent: null,
};

// ====== HELPERS ======
function normalize(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rememberShownBooks(bookIds = [], intent = null) {
  chatState.lastShownBooks = bookIds;
  chatState.lastIntent = intent;
}

function resolveOrdinalReference(text) {
  const q = normalize(text);

  if (!chatState.lastShownBooks.length) return null;

  if (q.includes("el primero") || q.includes("del primero")) {
    return getBookById(chatState.lastShownBooks[0]);
  }

  if (q.includes("el segundo") || q.includes("del segundo")) {
    return getBookById(chatState.lastShownBooks[1]);
  }

  if (q.includes("el tercero") || q.includes("del tercero")) {
    return getBookById(chatState.lastShownBooks[2]);
  }

  return null;
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAssistantMessage(text = "") {
  const safe = escapeHtml(text).replace(/\n/g, "<br>");

  return safe.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
    const isWhatsApp = url.includes("wa.me/");
    const isBookLink = url.includes("#book=");

    const label = isWhatsApp
      ? "Comprar por WhatsApp"
      : isBookLink
      ? "Ver libro"
      : "Abrir enlace";

    const targetAttrs = isBookLink
      ? ""
      : ' target="_blank" rel="noopener noreferrer"';

    return `<a href="${url}"${targetAttrs} style="color:#00BFFF;text-decoration:underline;font-weight:600;">${label}</a>`;
  });
}

function tokenize(str = "") {
  const stopWords = new Set([
    "de", "la", "el", "los", "las", "un", "una", "y", "o", "en", "por", "para",
    "que", "me", "lo", "la", "del", "al", "con", "es", "esta", "este", "tienes",
    "tengo", "hay", "cuanto", "cuesta", "vale", "precio", "libro", "quiero",
    "busco", "sobre", "uno", "una", "version"
  ]);

  return normalize(str)
    .split(" ")
    .filter(Boolean)
    .filter(token => !stopWords.has(token));
}

function getBookById(id) {
  return catalog.find(item => item.id === id) || null;
}

function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getProductLink(bookId) {
  return `${window.location.origin}${window.location.pathname}#book=${encodeURIComponent(bookId)}`;
}

function findBestBook(text) {
  const q = normalize(text);
  const qTokens = tokenize(text);

  if (!q) return null;

  let bestBook = null;
  let bestScore = 0;

  catalog.forEach(item => {
    let score = 0;
    const phrases = [
      item.title,
      item.id.replace(/-/g, " "),
      ...(item.aliases || [])
    ];

    phrases.forEach(phrase => {
      const p = normalize(phrase);
      const pTokens = tokenize(phrase);

      if (!p) return;

      if (q === p) score = Math.max(score, 140);
      if (q.includes(p)) score = Math.max(score, 120 + Math.min(p.length, 20));
      if (p.includes(q) && q.length >= 5) score = Math.max(score, 85);

      const overlap = pTokens.filter(token => qTokens.includes(token)).length;
      if (overlap > 0) {
        let overlapScore = overlap * 18;
        if (overlap === pTokens.length) overlapScore += 25;
        score = Math.max(score, overlapScore);
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestBook = item;
    }
  });

  return bestScore >= 30 ? bestBook : null;
}

function detectHabitosAtomicosGroup(text) {
  const q = normalize(text);
  const isHabits = q.includes("habitos atomicos");
  const specific = q.includes("simple") || q.includes("completa");
  if (isHabits && !specific) {
    return catalog.filter(item => item.id.startsWith("habitos-atomicos"));
  }
  return null;
}

function getRelatedBooks(bookId) {
  const map = {
    "piense-hagase-rico": ["padre-rico-padre-pobre", "hombre-rico-babilonia"],
    "padre-rico-padre-pobre": ["piense-hagase-rico", "secretos-mente-millonaria"],
    "hombre-rico-babilonia": ["padre-rico-padre-pobre", "piense-hagase-rico"],
    "secretos-mente-millonaria": ["padre-rico-padre-pobre", "piense-hagase-rico"],
    "habitos-atomicos-simple": ["habitos-atomicos-completa", "poder-del-ahora"],
    "habitos-atomicos-completa": ["habitos-atomicos-simple", "poder-del-ahora"],
    "poder-del-ahora": ["inteligencia-emocional", "si-lo-crees-lo-creas"],
  };

  return (map[bookId] || [])
    .map(getBookById)
    .filter(Boolean);
}

function buildBookResponse(book, userText) {
  const q = normalize(userText);

  const wantsPrice = /(cuanto|cuesta|vale|precio|en cuanto|cost[oó])/.test(q);
  const wantsAvailability = /(tienes|hay|disponible|stock|lo manejas|cuentas con)/.test(q);
  const wantsBuy = /(comprar|apartar|apartalo|apartarlo|lo quiero|me interesa|pedido|ordeno|ordenar|llevar)/.test(q);
  const wantsWhereToBuy = /(donde lo compro|donde comprar|donde se compra|link|enlace|mandame el link|manda el link|pasame el link|pásame el link)/.test(q);

  if (book.status !== "available") {
    return `Ahorita ese título no lo tengo disponible 😕\nSi quieres, te puedo avisar cuando llegue.`;
  }

  const productLink = getProductLink(book.id);
  const wa = getWhatsAppLink(`Hola QUOV 👋 Me interesa "${book.title}" por $${book.price}. ¿Sigue disponible?`);

  if (wantsBuy || wantsWhereToBuy) {
    return `Sí lo tengo disponible ✅
"${book.title}" está en $${book.price}.
${book.pitch}

Ver libro:
${productLink}

Comprar por WhatsApp:
${wa}`;
  }

  if (wantsPrice && !wantsAvailability) {
    return `"${book.title}" está en $${book.price} ✅
${book.pitch}

Ver libro:
${productLink}

Comprar por WhatsApp:
${wa}`;
  }

  if (wantsAvailability && !wantsPrice) {
    return `Siii, sí lo tengo disponible ✅
"${book.title}" está en $${book.price}.
${book.pitch}

Ver libro:
${productLink}

Comprar por WhatsApp:
${wa}`;
  }

  return `Sí, sí lo tengo ✅
"${book.title}" está en $${book.price}.
${book.pitch}

Ver libro:
${productLink}

Comprar por WhatsApp:
${wa}`;
}

function buildHabitosVariantsResponse(items) {
  const simple = items.find(item => item.id === "habitos-atomicos-simple");
  const completa = items.find(item => item.id === "habitos-atomicos-completa");

  return `Sí, tengo 2 versiones de "Hábitos Atómicos" ✅

• Versión simple: $${simple?.price ?? "—"}
• Versión completa: $${completa?.price ?? "—"}

Si quieres, te digo cuál te conviene más según lo que busques.`;
}

function buildCatalogResponse() {
  const picks = [
    "padre-rico-padre-pobre",
    "piense-hagase-rico",
    "hombre-rico-babilonia",
    "habitos-atomicos-simple",
    "poder-del-ahora",
    "1984",
  ]
    .map(getBookById)
    .filter(Boolean);

  const lines = picks.map(book => `• ${book.title} — $${book.price}`);

  return `Claro 👋 Estos son algunos libros que tengo ahorita:

${lines.join("\n")}

Si quieres, dime el título exacto y te digo si está disponible y en cuánto está.`;
}

function buildFeaturedResponse() {
  const items = featured.map(getBookById).filter(Boolean);
  const lines = items.map(book => `• ${book.title} — $${book.price}`);
  return `Estos son algunos de los más vendidos 🔥

${lines.join("\n")}

Si quieres, te recomiendo uno según lo que estés buscando.`;
}

function buildRecommendationResponse(userText) {
  const q = normalize(userText);
  let picks = [];

  if (/(finanzas|dinero|rico|millonaria|inversion|inversiones|negocio|negocios)/.test(q)) {
    picks = [
      getBookById("padre-rico-padre-pobre"),
      getBookById("piense-hagase-rico"),
      getBookById("hombre-rico-babilonia"),
    ];
  } else if (/(habitos|disciplina|productividad|rutina|constancia|enfoque)/.test(q)) {
    picks = [
      getBookById("habitos-atomicos-simple"),
      getBookById("habitos-atomicos-completa"),
      getBookById("poder-pensamiento-positivo"),
    ];
  } else if (/(ansiedad|paz|mente|emocional|emociones|presente|calma|bienestar)/.test(q)) {
    picks = [
      getBookById("poder-del-ahora"),
      getBookById("inteligencia-emocional"),
      getBookById("si-lo-crees-lo-creas"),
    ];
  } else {
    picks = featured.map(getBookById).filter(Boolean);
  }

  picks = picks.filter(Boolean);

  rememberShownBooks(
    picks.map(book => book.id),
    "recommendation"
  );

  const lines = picks.slice(0, 3).map(book => `• ${book.title} — $${book.price}`);

  return `Te recomiendo estos 👇

${lines.join("\n")}

Si quieres, te digo cuál te conviene más según si buscas finanzas, hábitos o crecimiento personal.`;
}

function buildShippingResponse() {
  return `Por ahora entregamos en CDMX ✅\nSi quieres apartar un libro, te ayudo por WhatsApp.`;
}

function buildContactResponse() {
  return `Claro 👋 Puedes escribirnos por WhatsApp aquí:\nhttps://wa.me/${WHATSAPP_NUMBER}`;
}

function buildFallbackResponse() {
  return `Te ayudo con eso 👋

Puedes preguntarme cosas como:
• "¿Tienes Padre Rico, Padre Pobre?"
• "¿En cuánto está Piense y Hágase Rico?"
• "Recomiéndame un libro de finanzas"

Y yo te digo disponibilidad y precio exacto.`;
}

function resolveBookFromMessage(userText) {
  const group = detectHabitosAtomicosGroup(userText);
  if (group) return { type: "group", items: group };
  const ordinalBook = resolveOrdinalReference(userText);
  if (ordinalBook) {
  chatState.lastBookId = ordinalBook.id;
  return { type: "single", item: ordinalBook };
}

  const matched = findBestBook(userText);
  if (matched) {
    chatState.lastBookId = matched.id;
    return { type: "single", item: matched };
  }

  const q = normalize(userText);
  const followUp = /(cuanto|cuesta|vale|precio|en cuanto|disponible|lo tienes|y ese|y ese libro|me interesa|lo quiero|apartalo|apartarlo)/.test(q);

  if (followUp && chatState.lastBookId) {
    const previous = getBookById(chatState.lastBookId);
    if (previous) {
      return { type: "single", item: previous };
    }
  }

  return null;
}

function generateSalesResponse(userText) {
  const q = normalize(userText);
  const resolved = resolveBookFromMessage(userText);

  if (resolved?.type === "group") {
    return buildHabitosVariantsResponse(resolved.items);
  }

  if (resolved?.type === "single") {
    return buildBookResponse(resolved.item, userText);
  }

  if (/(hola|holi|buenas|hey|que onda|qué onda)/.test(q)) {
    return `Hola 👋 Soy QUOV IA.\nDime qué libro buscas y te digo si lo tengo y en cuánto está.`;
  }

  if (/(gracias|muchas gracias|perfecto|excelente|listo)/.test(q)) {
    return `Con gusto ✨\nSi quieres, también te recomiendo otro del mismo estilo.`;
  }

  if (/(mas vendidos|m[aá]s vendidos|destacados)/.test(q)) {
    return buildFeaturedResponse();
  }

  if (/(catalogo|cat[aá]logo|que libros tienes|qué libros tienes|libros disponibles|muestrame|mu[eé]strame)/.test(q)) {
    return buildCatalogResponse();
  }

  if (/(recomiend|sugier|quiero empezar|busco algo|que me recomiendas|qué me recomiendas)/.test(q)) {
    return buildRecommendationResponse(userText);
  }

  if (/(envio|env[ií]o|entrega|cdmx|fuera de cdmx|mandan a domicilio|domicilio)/.test(q)) {
    return buildShippingResponse();
  }

  if (/(whatsapp|wsp|contacto|contactarte|comprar|apartar|pedido|ordenar)/.test(q)) {
    return buildContactResponse();
  }

  if (/(cuanto|cuesta|vale|precio|en cuanto)/.test(q)) {
    return `Claro 👋 Dime el título del libro y te digo el precio exacto.`;
  }

  return buildFallbackResponse();
}

// ====== CURSOR PERSONALIZADO ======
function initCursor() {
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  function setCursorMode(mode) {
    document.body.classList.toggle("cursor-blue", mode === "blue");
    document.body.classList.toggle("cursor-white", mode === "white");
  }

  setCursorMode("blue");

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;

    const target = document.elementFromPoint(mouseX, mouseY);
    if (!target) return;

    let mode = "blue";

    if (target.closest('[data-cursor="blue"]')) {
      mode = "blue";
    } else if (target.closest('[data-cursor="white"]')) {
      mode = "white";
    } else if (target.closest(".hero-section")) {
      mode = "white";
    } else {
      mode = "blue";
    }

    setCursorMode(mode);

    const interactive = target.closest(
      'a, button, input, textarea, [data-id], .search-bar-pro, #chatFab, #chatHint'
    );

    document.body.classList.toggle("cursor-hover", !!interactive);
  });

  document.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-hover");
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }

  animateRing();
}

// ====== SCROLL REVEAL ======
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => observer.observe(el));
}

// ====== PRODUCT MODAL ======
function openProductModal(item, options = {}) {
  const { dockWithChat = false } = options;

  const productOverlay = document.getElementById("productOverlay");
  const productTitle = document.getElementById("productTitle");
  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const productBadge = document.getElementById("productBadge");
  const productImage = document.getElementById("productImage");
  const productMeta = document.getElementById("productMeta");
  const buyBtn = document.getElementById("buyBtn");

  if (!productOverlay) return;

  if (productTitle) productTitle.textContent = "Detalle";
  if (productName) productName.textContent = item.title;
  if (productPrice) productPrice.textContent = `$${item.price}`;
  if (productBadge) productBadge.textContent = item.status === "available" ? "Disponible" : "Próximamente";
  if (productMeta) productMeta.textContent = item.pitch || "Segunda mano verificada";

  if (productImage) {
    if (item.img) {
      productImage.innerHTML = `<img src="${item.img}" alt="${escapeHtml(item.title)}" class="w-full rounded-2xl object-contain" />`;
      productImage.className = "rounded-2xl";
    } else {
      productImage.innerHTML = "";
      productImage.className = "h-64 rounded-2xl bg-neutral-100";
    }
  }

  const chatIsOpen = !document.getElementById("chatOverlay")?.classList.contains("hidden");
  const shouldDock = dockWithChat && chatIsOpen && window.innerWidth >= 1200;

  if (shouldDock) {
    enableChatBookLayout();
  } else {
    disableChatBookLayout();
  }

  const alreadyOpen = !productOverlay.classList.contains("hidden");

  if (!alreadyOpen) {
    openOverlay(productOverlay);
  } else {
    productOverlay.classList.remove("hidden");
    productOverlay.classList.add("flex");
  }

  if (buyBtn) {
    buyBtn.onclick = () => {
      const msg = `Hola QUOV 👋 Quiero comprar: ${item.title} por $${item.price}. ¿Sigue disponible?`;
      window.open(getWhatsAppLink(msg), "_blank");
    };
  }
}


function enableChatBookLayout() {
  if (window.innerWidth < 1200) return;

  const chatOverlay = document.getElementById("chatOverlay");
  const productOverlay = document.getElementById("productOverlay");

  if (!chatOverlay || !productOverlay) return;
  if (chatOverlay.classList.contains("hidden")) return;

  chatOverlay.classList.add("chat-side-mode");
  productOverlay.classList.add("side-docked");
}

function disableChatBookLayout() {
  document.getElementById("chatOverlay")?.classList.remove("chat-side-mode");
  document.getElementById("productOverlay")?.classList.remove("side-docked");
}

function openBookFromHash() {
  const hash = window.location.hash || "";
  if (!hash.startsWith("#book=")) return;

  const id = decodeURIComponent(hash.replace("#book=", ""));
  const item = getBookById(id);
  const chatIsOpen = !document.getElementById("chatOverlay")?.classList.contains("hidden");

  if (item) {
    openProductModal(item, { dockWithChat: chatIsOpen });
  }
}


// ====== RENDER FEATURED ======
function renderFeatured(ids) {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  const items = ids.map(id => catalog.find(x => x.id === id)).filter(Boolean);

  grid.innerHTML = items.map(item => `
    <article data-id="${item.id}" class="featured-card" style="cursor:pointer;" title="${escapeHtml(item.title)}">
      <div class="card-img-wrap">
        <img src="${item.img}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.style.display='none'" />
      </div>
      <div class="card-footer">
        <p class="card-title">${escapeHtml(item.title)}</p>
        <span class="card-price">$${item.price}</span>
      </div>
    </article>
  `).join("");
}

// ====== RENDER CATALOG ======
function renderCatalog(items) {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <div class="col-span-full rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        No encontré ese libro en el catálogo 😕<br>
        Intenta con otro título o abre QUOV IA para ayudarte a buscar.
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => {
    const isSoon = item.status === "soon";

    const imageHtml = item.img
      ? `<img src="${item.img}" alt="${escapeHtml(item.title)}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
         <div class="w-full h-full bg-neutral-100 hidden" style="aspect-ratio:600/900"></div>`
      : `<div class="w-full bg-neutral-100" style="aspect-ratio:600/900"></div>`;

    return `
      <article data-id="${item.id}" class="book-card" style="cursor:pointer;">
        <div class="card-img-wrap">${imageHtml}</div>
        <div class="card-body">
          <div class="card-meta">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            ${isSoon
              ? `<span style="font-size:0.7rem;font-weight:600;border:1px solid #e5e5e5;border-radius:999px;padding:3px 10px;color:#666;white-space:nowrap;font-family:'Syne',sans-serif;">Pronto</span>`
              : `<span class="card-price">$${item.price}</span>`
            }
          </div>
          ${isSoon
            ? `<button data-action="notify" type="button"
                style="width:100%;border-radius:14px;background:#f5f5f5;border:none;padding:10px 0;font-size:0.8rem;font-weight:600;color:#444;font-family:'Syne',sans-serif;transition:background 0.15s;">
                Avisarme
               </button>`
            : ``
          }
        </div>
      </article>
    `;
  }).join("");
}

// ====== SEARCH ======
function initSearch() {
  const normalizeText = str => normalize(str);

  function filterCatalog(query) {
    const q = normalizeText(query.trim());
    const filtered = q
      ? catalog.filter(item => normalizeText(item.title).includes(q))
      : catalog;

    renderCatalog(filtered);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });

    const existing = document.getElementById("btnVolver");

    if (q && !existing) {
      const btn = document.createElement("button");
      btn.id = "btnVolver";
      btn.textContent = "← Regresar al catálogo";
      btn.type = "button";
      btn.style.cssText = "margin-bottom:16px;background:#000;color:#fff;border-radius:12px;padding:10px 20px;font-weight:600;font-size:0.85rem;font-family:'Syne',sans-serif;cursor:pointer;border:none;";
      btn.onclick = () => {
        renderCatalog(catalog);
        btn.remove();
        const heroInput = document.getElementById("searchInputHero");
        const mobileInput = document.getElementById("searchInputMobile");
        if (heroInput) heroInput.value = "";
        if (mobileInput) mobileInput.value = "";
      };
      document.getElementById("catalogGrid")?.before(btn);
    } else if (!q && existing) {
      existing.remove();
    }
  }

  const heroInput = document.getElementById("searchInputHero");
  const heroBtn = document.getElementById("searchBtnHero");
  const mobileInput = document.getElementById("searchInputMobile");

  heroBtn?.addEventListener("click", () => filterCatalog(heroInput?.value || ""));
  heroInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") filterCatalog(e.target.value);
  });
  mobileInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") filterCatalog(e.target.value);
  });
}

// ====== NOTIFY MODAL ======
function openNotifyModal(item) {
  const notifyOverlay = document.getElementById("notifyOverlay");
  const notifyBook = document.getElementById("notifyBook");
  const notifyInput = document.getElementById("notifyInput");
  const notifySave = document.getElementById("notifySave");

  if (notifyBook) notifyBook.textContent = item.title;
  if (notifyInput) notifyInput.value = "";
  openOverlay(notifyOverlay);

  if (notifySave) {
    notifySave.onclick = () => {
      const value = notifyInput?.value.trim() || "";
      if (!value) return alert("Escribe tu WhatsApp o email.");

      const key = "quov_notify_list";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({
        bookId: item.id,
        bookTitle: item.title,
        contact: value,
        ts: Date.now()
      });
      localStorage.setItem(key, JSON.stringify(list));

      alert("Listo ✅ Te avisaremos cuando esté disponible.");
      closeOverlay(notifyOverlay);
    };
  }
}

// ====== OVERLAY HELPERS ======
function openOverlay(el) {
  if (!el) return;
  el.classList.remove("hidden");
  el.classList.add("flex");
}

function closeOverlay(el) {
  if (!el) return;

  if (el.id === "productOverlay") {
    disableChatBookLayout();
    el.classList.remove("side-docked");
    el.classList.add("hidden");
    el.classList.remove("flex");

    if (window.location.hash.startsWith("#book=")) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    return;
  }

  if (el.id === "chatOverlay") {
    const productOverlay = document.getElementById("productOverlay");

    if (productOverlay && !productOverlay.classList.contains("hidden")) {
      productOverlay.classList.add("hidden");
      productOverlay.classList.remove("flex");
      productOverlay.classList.remove("side-docked");
    }

    disableChatBookLayout();
    el.classList.add("hidden");
    el.classList.remove("flex");
    return;
  }

  el.classList.add("hidden");
  el.classList.remove("flex");
}



// ====== CHAT ======
function addChatMessage(role, content, options = {}) {
  const mensajes = document.getElementById("chatMessages");
  if (!mensajes) return null;

  const div = document.createElement("div");
  const isUser = role === "user";

  div.className = isUser
    ? "ml-auto max-w-[85%] rounded-2xl bg-black text-white px-5 py-3 text-sm"
    : "max-w-[85%] rounded-2xl bg-neutral-100 px-5 py-3 text-sm";

  if (options.id) div.id = options.id;

  div.innerHTML = isUser
    ? escapeHtml(content).replace(/\n/g, "<br>")
    : formatAssistantMessage(content);

  mensajes.appendChild(div);
  mensajes.scrollTop = mensajes.scrollHeight;
  return div;
}

function autoResizeChatInput() {
  const input = document.getElementById("chatInput");
  if (!input) return;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
}

window.enviarMensaje = async function enviarMensaje() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const texto = input.value.trim();
  if (!texto) return;

  addChatMessage("user", texto);
  input.value = "";
  autoResizeChatInput();

  const typing = addChatMessage("assistant", "Escribiendo...", { id: "typing" });

  await new Promise(resolve => setTimeout(resolve, 450));

  typing?.remove();

  const respuesta = generateSalesResponse(texto);
  addChatMessage("assistant", respuesta);
};

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initReveal();
  initSearch();
  renderFeatured(featured);
  renderCatalog(catalog);

  openBookFromHash();
  window.addEventListener("hashchange", openBookFromHash);

  const featuredGrid = document.getElementById("featuredGrid");
  const catalogGrid = document.getElementById("catalogGrid");

  featuredGrid?.addEventListener("click", (e) => {
    const card = e.target.closest("article[data-id]");
    if (!card) return;
    const item = catalog.find(x => x.id === card.getAttribute("data-id"));
    if (item) openProductModal(item);
  });

  catalogGrid?.addEventListener("click", (e) => {
    const notifyBtn = e.target.closest("button[data-action='notify']");
    if (notifyBtn) {
      const card = notifyBtn.closest("article[data-id]");
      const item = catalog.find(x => x.id === card?.getAttribute("data-id"));
      if (item) openNotifyModal(item);
      return;
    }

    const card = e.target.closest("article[data-id]");
    if (!card) return;
    const item = catalog.find(x => x.id === card.getAttribute("data-id"));
    if (item && item.status !== "soon") openProductModal(item);
  });

  const chatFab = document.getElementById("chatFab");
  const chatOverlay = document.getElementById("chatOverlay");
  const chatClose = document.getElementById("chatClose");
  const chatHint = document.getElementById("chatHint");
  const chatInput = document.getElementById("chatInput");

  const chatMessages = document.getElementById("chatMessages");

chatMessages?.addEventListener("click", (e) => {
  const link = e.target.closest('a[href*="#book="]');
  if (!link) return;

  e.preventDefault();

  const href = link.getAttribute("href") || "";
  const hashIndex = href.indexOf("#book=");
  if (hashIndex === -1) return;

  const hash = href.slice(hashIndex);
  const id = decodeURIComponent(hash.replace("#book=", ""));
  const item = getBookById(id);
  if (!item) return;

  history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}#book=${encodeURIComponent(id)}`
  );

  openProductModal(item, { dockWithChat: false });
});
  window.addEventListener("load", () => {
    if (!chatHint) return;
    chatHint.classList.remove("hidden");
    setTimeout(() => chatHint.classList.add("hidden"), 4500);
  });

  chatFab?.addEventListener("click", () => {
    openOverlay(chatOverlay);
    setTimeout(() => chatInput?.focus(), 80);
  });

  chatClose?.addEventListener("click", () => closeOverlay(chatOverlay));
  chatOverlay?.addEventListener("click", e => {
    if (e.target === chatOverlay) closeOverlay(chatOverlay);
  });

  const productOverlay = document.getElementById("productOverlay");
  const productClose = document.getElementById("productClose");
  const secondaryBtn = document.getElementById("secondaryBtn");
  const notifyOverlay = document.getElementById("notifyOverlay");
  const notifyClose = document.getElementById("notifyClose");

  productClose?.addEventListener("click", () => closeOverlay(productOverlay));
  secondaryBtn?.addEventListener("click", () => closeOverlay(productOverlay));
  productOverlay?.addEventListener("click", e => {
    if (e.target === productOverlay) closeOverlay(productOverlay);
  });

  notifyClose?.addEventListener("click", () => closeOverlay(notifyOverlay));
  notifyOverlay?.addEventListener("click", e => {
    if (e.target === notifyOverlay) closeOverlay(notifyOverlay);
  });

  chatInput?.addEventListener("input", autoResizeChatInput);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeOverlay(chatOverlay);
    closeOverlay(productOverlay);
    closeOverlay(notifyOverlay);
  });
});
