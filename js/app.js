/**
 * ARTESANÍAS V.V — lógica del catálogo
 * Vanilla JS, sin dependencias. El carrito vive en localStorage:
 * si el cliente cierra la página sin querer, su pedido sigue ahí.
 */

// ══════════════ CONFIG ══════════════
const WHATSAPP_NUMBER = "5491138660490"; // +54 9 11 3866-0490 (código de país + número, sin + ni espacios)
const INSTAGRAM_URL = "https://www.instagram.com/artesaniasv.v";
const CART_KEY = "artesanias_vv_cart";

// ══════════════ ESTADO ══════════════
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}"); // { productId: cantidad }
let activeCategory = "all";
let searchTerm = "";

// ══════════════ HELPERS ══════════════
const $ = (s) => document.querySelector(s);
const fmtPrice = (n) => (n == null ? "A consultar" : "$" + n.toLocaleString("es-AR"));
const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);

/** Piezas publicadas: las marcadas como ocultas desde el admin no salen en el catálogo. */
const visibles = () => PRODUCTS.filter((p) => p.visible !== false);

/** Las destacadas van primero, sin alterar el orden del resto. */
function destacadasPrimero(lista) {
  return [...lista].sort((a, b) => (b.destacado === true) - (a.destacado === true));
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  actualizarFab();
}

function cartTotal() {
  let total = 0;
  let hasConsultar = false;
  for (const [id, qty] of Object.entries(cart)) {
    const p = getProduct(id);
    if (!p) continue;
    if (p.price == null) hasConsultar = true;
    else total += p.price * qty;
  }
  return { total, hasConsultar };
}

// ══════════════ TARJETA DE PIEZA ══════════════
/**
 * La pieza "flota" sobre el fondo de yeso: imagen en arco de hornacina,
 * sin caja blanca alrededor, y el control de cantidad cosido al borde.
 */
function cardProducto(p, ancho = "") {
  const qty = cart[p.id] || 0;
  const elegida = qty > 0;

  const control = elegida
    ? `<div class="flex items-center gap-0.5 superficie border border-camel-400 rounded-full shadow-pieza-sm animate-sello">
         <button onclick="cambiarCantidad('${p.id}', -1)" aria-label="Quitar uno"
           class="w-8 h-8 flex items-center justify-center text-tierra-700 active:scale-90 transition text-lg leading-none">−</button>
         <span class="min-w-[1rem] text-center text-sm font-semibold text-tierra-900">${qty}</span>
         <button onclick="cambiarCantidad('${p.id}', 1)" aria-label="Sumar uno"
           class="w-8 h-8 flex items-center justify-center text-tierra-700 active:scale-90 transition text-lg leading-none">+</button>
       </div>`
    : `<button onclick="agregarAlCarrito('${p.id}')" aria-label="Sumar ${p.name} al pedido"
         class="btn-sello w-9 h-9 flex items-center justify-center bg-tierra-800 text-yeso-100 rounded-full text-xl leading-none pb-0.5">+</button>`;

  return `
  <article class="${ancho} animate-surgir">
    <div class="relative">
      <div class="arco superficie border ${elegida ? "border-camel-400 ring-2 ring-camel-300/50" : "border-yeso-300"} overflow-hidden shadow-pieza-sm transition">
        <img src="${p.img}" alt="${p.name}" loading="lazy" decoding="async"
             class="w-full aspect-[4/5] object-cover" />
      </div>
      <div class="absolute -bottom-3 right-1.5">${control}</div>
    </div>
    <div class="pt-5 px-0.5">
      <h3 class="font-display text-[0.95rem] leading-snug font-semibold text-tierra-900 clamp-2">${p.name}</h3>
      <p class="mt-1 text-sm ${p.price == null ? "text-tierra-600/80" : "font-semibold text-terracota-600"}">${fmtPrice(p.price)}</p>
    </div>
  </article>`;
}

// ══════════════ RENDER: CHIPS DE CATEGORÍA ══════════════
function renderCategoryChips() {
  const nav = $("#category-chips");
  const chips = [{ id: "all", name: "Todo el catálogo" }, ...CATEGORIES];

  nav.innerHTML = chips
    .map((c) => {
      const active = c.id === activeCategory;
      return `<button data-cat="${c.id}"
        class="shrink-0 text-sm font-medium px-4 py-2 rounded-full border transition
        ${active
          ? "bg-tierra-800 text-yeso-100 border-tierra-800"
          : "superficie text-tierra-700 border-yeso-300 active:scale-95"}">
        ${c.name}
      </button>`;
    })
    .join("");

  nav.querySelectorAll("[data-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      searchTerm = "";
      $("#search-input").value = "";
      renderCategoryChips();
      renderContenido();
      window.scrollTo({ top: $("#barra").offsetTop - 8, behavior: "smooth" });
    });
  });
}

// ══════════════ RENDER: CONTENIDO PRINCIPAL ══════════════
function renderContenido() {
  const cont = $("#contenido");
  const noResults = $("#no-results");
  const term = searchTerm.trim().toLowerCase();

  // ---- 1. Hay búsqueda: grilla de resultados ----
  if (term) {
    const encontrados = visibles().filter((p) => {
      const cat = getCategory(p.category);
      return p.name.toLowerCase().includes(term) || (cat && cat.name.toLowerCase().includes(term));
    });

    if (encontrados.length === 0) {
      cont.innerHTML = "";
      noResults.classList.remove("hidden");
      return;
    }
    noResults.classList.add("hidden");

    cont.innerHTML = `
      <p class="text-sm text-tierra-600 mb-5">
        ${encontrados.length} pieza${encontrados.length === 1 ? "" : "s"} para "<span class="text-tierra-900 font-medium">${searchTerm.trim()}</span>"
      </p>
      <div class="grid grid-cols-2 gap-x-4 gap-y-8">
        ${encontrados.map((p) => cardProducto(p)).join("")}
      </div>`;
    return;
  }

  noResults.classList.add("hidden");

  // ---- 2. Una categoría elegida: grilla de 2 columnas ----
  if (activeCategory !== "all") {
    const cat = getCategory(activeCategory);
    const items = destacadasPrimero(visibles().filter((p) => p.category === activeCategory));

    cont.innerHTML = `
      <div class="mb-6">
        <h2 class="font-display text-3xl font-semibold text-tierra-900">${cat.name}</h2>
        <div class="trazo w-20 mt-2"></div>
        <p class="text-sm text-tierra-600 mt-2">${items.length} pieza${items.length === 1 ? "" : "s"} disponibles</p>
      </div>
      <div class="grid grid-cols-2 gap-x-4 gap-y-8">
        ${items.map((p) => cardProducto(p)).join("")}
      </div>`;
    return;
  }

  // ---- 3. Vista "Todo el catálogo": una fila deslizable por categoría ----
  const secciones = [];

  // Las piezas destacadas abren el catálogo, si hay alguna marcada desde el admin
  const destacadas = visibles().filter((p) => p.destacado === true);
  if (destacadas.length > 0) {
    secciones.push(`
    <section>
      <div class="mb-4">
        <h2 class="font-display text-2xl font-semibold text-tierra-900 leading-none">Destacadas</h2>
        <div class="trazo w-14 mt-2"></div>
      </div>
      <div class="fila-scroll flex gap-4 overflow-x-auto scrollbar-none -mx-5 px-5 pb-3">
        ${destacadas.map((p) => cardProducto(p, "w-[152px] shrink-0")).join("")}
      </div>
    </section>`);
  }

  CATEGORIES.forEach((cat) => {
    const items = visibles().filter((p) => p.category === cat.id);
    if (items.length === 0) return;

    secciones.push(`
    <section>
      <div class="flex items-end justify-between gap-3 mb-4">
        <div>
          <h2 class="font-display text-2xl font-semibold text-tierra-900 leading-none">${cat.name}</h2>
          <div class="trazo w-14 mt-2"></div>
        </div>
        <button onclick="verCategoria('${cat.id}')"
          class="shrink-0 text-sm font-medium text-camel-600 active:scale-95 transition">
          Ver las ${items.length} →
        </button>
      </div>
      <div class="fila-scroll flex gap-4 overflow-x-auto scrollbar-none -mx-5 px-5 pb-3">
        ${destacadasPrimero(items).map((p) => cardProducto(p, "w-[152px] shrink-0")).join("")}
      </div>
    </section>`);
  });

  cont.innerHTML = secciones
    .map((s, i) => (i === 0 ? s : s.replace("<section>", '<section class="mt-11">')))
    .join("");
}

function verCategoria(catId) {
  activeCategory = catId;
  searchTerm = "";
  $("#search-input").value = "";
  renderCategoryChips();
  renderContenido();
  window.scrollTo({ top: $("#barra").offsetTop - 8, behavior: "smooth" });
}

// ══════════════ CARRITO: acciones ══════════════
function agregarAlCarrito(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderContenido();
  mostrarToast("Sumado a tu pedido");
}

function cambiarCantidad(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderContenido();
  if (!$("#cart-drawer").classList.contains("translate-y-full")) renderCartItems();
}

function quitarDelCarrito(id) {
  delete cart[id];
  saveCart();
  renderContenido();
  renderCartItems();
}

// ══════════════ BOTÓN FLOTANTE ══════════════
function actualizarFab() {
  const count = cartCount();
  const fab = $("#fab-cart");
  $("#fab-badge").textContent = count;

  if (count > 0) {
    fab.classList.remove("translate-y-24", "opacity-0", "pointer-events-none");
  } else {
    fab.classList.add("translate-y-24", "opacity-0", "pointer-events-none");
  }
}

// ══════════════ RENDER: PEDIDO ══════════════
function renderCartItems() {
  const container = $("#cart-items");
  const empty = $("#cart-empty");
  const footer = $("#cart-footer");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    container.innerHTML = "";
    container.classList.add("hidden");
    empty.classList.remove("hidden");
    empty.classList.add("flex");
    footer.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  empty.classList.add("hidden");
  empty.classList.remove("flex");
  footer.classList.remove("hidden");

  container.innerHTML = entries
    .map(([id, qty]) => {
      const p = getProduct(id);
      if (!p) return "";
      const lineTotal = p.price == null ? "A consultar" : fmtPrice(p.price * qty);
      return `
      <div class="flex items-center gap-3.5 py-4 border-b border-yeso-200 last:border-0">
        <div class="arco superficie border border-yeso-300 overflow-hidden shrink-0 w-14">
          <img src="${p.img}" alt="${p.name}" class="w-full aspect-[4/5] object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-display font-semibold text-tierra-900 text-sm leading-snug">${p.name}</p>
          <p class="text-xs text-tierra-600 mt-0.5">${fmtPrice(p.price)} c/u</p>
          <div class="flex items-center gap-1 mt-2">
            <button onclick="cambiarCantidad('${id}', -1)" aria-label="Quitar uno"
              class="w-7 h-7 flex items-center justify-center superficie border border-yeso-300 rounded-full text-tierra-700 active:scale-90 transition leading-none">−</button>
            <span class="w-7 text-center text-sm font-semibold">${qty}</span>
            <button onclick="cambiarCantidad('${id}', 1)" aria-label="Sumar uno"
              class="w-7 h-7 flex items-center justify-center superficie border border-yeso-300 rounded-full text-tierra-700 active:scale-90 transition leading-none">+</button>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="${p.price == null ? "text-xs text-tierra-600/80" : "text-sm font-semibold text-terracota-600"}">${lineTotal}</p>
          <button onclick="quitarDelCarrito('${id}')" class="text-xs text-tierra-600/70 underline underline-offset-2 mt-1.5">quitar</button>
        </div>
      </div>`;
    })
    .join("");

  const { total, hasConsultar } = cartTotal();
  $("#cart-total").textContent = "$" + total.toLocaleString("es-AR");
  $("#cart-consultar-note").classList.toggle("hidden", !hasConsultar);
}

// ══════════════ AVISO FLOTANTE ══════════════
let toastTimeout;
function mostrarToast(texto) {
  const toast = $("#toast");
  toast.textContent = texto;
  toast.classList.remove("opacity-0", "translate-y-2");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add("opacity-0", "translate-y-2"), 1500);
}

// ══════════════ DRAWER ══════════════
function abrirCarrito() {
  renderCartItems();
  $("#cart-overlay").classList.remove("opacity-0", "pointer-events-none");
  $("#cart-drawer").classList.remove("translate-y-full", "sm:translate-x-full");
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  $("#cart-overlay").classList.add("opacity-0", "pointer-events-none");
  $("#cart-drawer").classList.add("translate-y-full", "sm:translate-x-full");
  document.body.style.overflow = "";
  $("#form-error").classList.add("hidden");
}

// ══════════════ ENVIAR PEDIDO POR WHATSAPP ══════════════
function enviarPedido() {
  const entries = Object.entries(cart);
  if (entries.length === 0) return;

  const nombre = $("#input-nombre").value.trim();
  const telefono = $("#input-telefono").value.trim();
  const error = $("#form-error");

  if (!nombre || !telefono) {
    error.textContent = !nombre
      ? "Necesitamos tu nombre para registrar el pedido."
      : "Dejanos un teléfono para poder contactarte.";
    error.classList.remove("hidden");
    (!nombre ? $("#input-nombre") : $("#input-telefono")).focus();
    return;
  }
  error.classList.add("hidden");

  const { total, hasConsultar } = cartTotal();

  const lineas = entries
    .map(([id, qty]) => {
      const p = getProduct(id);
      if (!p) return "";
      const precio = p.price == null ? "a consultar" : fmtPrice(p.price) + " c/u";
      return `• ${qty}x ${p.name} — ${precio}`;
    })
    .filter(Boolean)
    .join("\n");

  let msg = "*PEDIDO — ARTESANÍAS V.V*\n";
  msg += "———————————————\n\n";
  msg += `*Cliente:* ${nombre}\n`;
  msg += `*Teléfono:* ${telefono}\n\n`;
  msg += `*Piezas:*\n${lineas}\n\n`;
  msg += `*Total estimado:* $${total.toLocaleString("es-AR")}`;
  msg += hasConsultar ? " (+ piezas a consultar)\n\n" : "\n\n";
  msg += "———————————————\n";
  msg += "Entiendo que el pedido queda *pendiente de aprobación* y se confirma con *seña*. Coordinamos la entrega por acá.";

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

// ══════════════ EVENTOS ══════════════
$("#cart-overlay").addEventListener("click", cerrarCarrito);

$("#search-input").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  if (searchTerm.trim() && activeCategory !== "all") {
    activeCategory = "all";
    renderCategoryChips();
  }
  renderContenido();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarCarrito();
});

// ══════════════ INICIO ══════════════
$("#footer-wa").href = `https://wa.me/${WHATSAPP_NUMBER}`;
renderCategoryChips();
renderContenido();
actualizarFab();
