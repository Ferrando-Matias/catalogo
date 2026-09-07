/**
 * ARTESANÍAS V.V — panel de administración
 * ============================================================
 * Permite cargar, editar, ordenar y eliminar piezas y categorías,
 * y descargar el archivo actualizado para subir al hosting.
 *
 * IMPORTANTE sobre la clave: este sitio no tiene servidor, así que
 * el ingreso solo evita que alguien entre "de casualidad". No es una
 * protección real: quien sepa buscar puede ver el código de la página.
 * Por eso el panel no debería usarse para nada sensible, y lo más
 * seguro es abrir admin.html desde la computadora (sin subirlo al
 * hosting) o borrarlo del sitio publicado.
 * ============================================================
 */

// ══════════════ CREDENCIALES (hash SHA-256) ══════════════
const USER_HASH = "a8e828c0999621c80951eb375ddaab0cd0bd5fe243b9266be52099627bc8219d";
const PASS_HASH = "b4327c48247f3519583052720ba9acc3236a715ddcc8f68a11e50ada0c2bde5a";

// Categorías que ya tienen dibujo propio en assets/img/
const PLACEHOLDERS = ["velas", "difusores", "bandejas", "floreros", "figuras", "centros-mesa", "yeso"];

// Tamaño al que se achican las fotos antes de guardarlas
const FOTO_MAX_LADO = 900;
const FOTO_CALIDAD = 0.8;

// ══════════════ ESTADO ══════════════
let datos = { categorias: [], productos: [] };
let editandoId = null;      // id de la pieza que se está editando (null = nueva)
let fotoPendiente = null;   // { dataUrl, ext } cargada en el editor
let filtroCat = "all";
let busqueda = "";
let hayBorrador = false;

const $ = (s) => document.querySelector(s);
const slug = (t) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "pieza";

const fmtPrecio = (n) => (n == null ? "A consultar" : "$" + Number(n).toLocaleString("es-AR"));

// ══════════════ GUARDADO DEL BORRADOR ══════════════
/** Intenta IndexedDB; si no está disponible (por ejemplo abriendo el archivo
 *  directo en algunos navegadores), cae en localStorage. */
const Store = {
  KEY: "artesanias_vv_admin",
  db: null,

  async abrir() {
    if (this.db !== null) return this.db;
    try {
      this.db = await new Promise((res, rej) => {
        const req = indexedDB.open("artesanias_vv_admin", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("estado");
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
        setTimeout(() => rej(new Error("timeout")), 2000);
      });
    } catch (e) {
      this.db = false;
    }
    return this.db;
  },

  async leer() {
    const db = await this.abrir();
    if (db) {
      try {
        return await new Promise((res, rej) => {
          const req = db.transaction("estado", "readonly").objectStore("estado").get(this.KEY);
          req.onsuccess = () => res(req.result || null);
          req.onerror = () => rej(req.error);
        });
      } catch (e) { /* sigue al fallback */ }
    }
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  async escribir(valor) {
    const db = await this.abrir();
    if (db) {
      try {
        await new Promise((res, rej) => {
          const req = db.transaction("estado", "readwrite").objectStore("estado").put(valor, this.KEY);
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        });
        return true;
      } catch (e) { /* sigue al fallback */ }
    }
    try {
      localStorage.setItem(this.KEY, JSON.stringify(valor));
      return true;
    } catch (e) {
      mostrarAviso("No se pudo guardar el borrador en este navegador");
      return false;
    }
  },

  async borrar() {
    const db = await this.abrir();
    if (db) {
      try {
        await new Promise((res) => {
          const req = db.transaction("estado", "readwrite").objectStore("estado").delete(this.KEY);
          req.onsuccess = () => res();
          req.onerror = () => res();
        });
      } catch (e) { /* nada */ }
    }
    try { localStorage.removeItem(this.KEY); } catch (e) { /* nada */ }
  },
};

// ══════════════ INGRESO ══════════════
async function sha256(texto) {
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return null; // sin Web Crypto se compara distinto (ver validarIngreso)
}

async function validarIngreso(usuario, clave) {
  const hu = await sha256(usuario);
  if (hu !== null) {
    return hu === USER_HASH && (await sha256(clave)) === PASS_HASH;
  }
  // Respaldo para navegadores sin Web Crypto (por ejemplo con file:// en algunos casos)
  return btoa(usuario) === "VmVyb0FydGVzYW5pYXM=" && btoa(clave) === "QXJ0ZTIwMjZXZWI=";
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = $("#login-user").value.trim();
  const clave = $("#login-pass").value;
  const error = $("#login-error");

  if (await validarIngreso(usuario, clave)) {
    try { sessionStorage.setItem("vv_admin_ok", "1"); } catch (err) { /* nada */ }
    entrar();
  } else {
    error.textContent = "Usuario o contraseña incorrectos.";
    error.classList.remove("hidden");
    $("#login-pass").value = "";
    $("#login-pass").focus();
  }
});

function cerrarSesion() {
  try { sessionStorage.removeItem("vv_admin_ok"); } catch (e) { /* nada */ }
  location.reload();
}

async function entrar() {
  $("#login-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  await cargarDatos();
}

// ══════════════ CARGA DE DATOS ══════════════
async function cargarDatos() {
  const borrador = await Store.leer();
  if (borrador && borrador.productos) {
    datos = borrador;
    hayBorrador = true;
    $("#aviso-borrador").classList.remove("hidden");
  } else {
    datos = {
      categorias: JSON.parse(JSON.stringify(CATEGORIES)),
      productos: JSON.parse(JSON.stringify(PRODUCTS)).map((p) => ({
        visible: true,
        destacado: false,
        desc: "",
        ...p,
      })),
    };
  }
  renderFiltroCategorias();
  renderLista();
  actualizarEstado();
}

async function guardarBorrador() {
  hayBorrador = true;
  $("#aviso-borrador").classList.remove("hidden");
  await Store.escribir(datos);
  actualizarEstado();
}

function descartarBorrador() {
  pedirConfirmacion(
    "¿Descartar todos los cambios que no publicaste y volver a lo que está en el sitio?",
    "Descartar",
    async () => {
      await Store.borrar();
      hayBorrador = false;
      $("#aviso-borrador").classList.add("hidden");
      await cargarDatos();
      mostrarAviso("Cambios descartados");
    }
  );
}

function actualizarEstado() {
  const chip = $("#estado-cambios");
  if (hayBorrador) {
    chip.textContent = "Sin publicar";
    chip.classList.remove("hidden");
  } else {
    chip.classList.add("hidden");
  }
}

// ══════════════ LISTA DE PIEZAS ══════════════
function listaFiltrada() {
  const t = busqueda.trim().toLowerCase();
  return datos.productos.filter((p) => {
    const okCat = filtroCat === "all" || p.category === filtroCat;
    const okTexto = !t || p.name.toLowerCase().includes(t);
    return okCat && okTexto;
  });
}

function renderFiltroCategorias() {
  const sel = $("#admin-filtro-cat");
  sel.innerHTML =
    '<option value="all">Todas las categorías</option>' +
    datos.categorias.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  sel.value = filtroCat;
}

function renderLista() {
  const cont = $("#admin-lista");
  const vacio = $("#admin-vacio");
  const items = listaFiltrada();

  const ocultas = datos.productos.filter((p) => p.visible === false).length;
  const destacadas = datos.productos.filter((p) => p.destacado === true).length;
  $("#admin-resumen").textContent =
    `${datos.productos.length} piezas · ${destacadas} destacadas · ${ocultas} ocultas`;

  if (items.length === 0) {
    cont.innerHTML = "";
    vacio.classList.remove("hidden");
    return;
  }
  vacio.classList.add("hidden");

  cont.innerHTML = items
    .map((p, i) => {
      const cat = datos.categorias.find((c) => c.id === p.category);
      return `
      <div class="superficie border ${p.visible === false ? "border-yeso-300 opacity-60" : "border-yeso-300"} rounded-2xl p-3 flex items-center gap-3">
        <div class="flex flex-col gap-1 shrink-0">
          <button onclick="mover('${p.id}', -1)" ${i === 0 ? "disabled" : ""} aria-label="Subir"
            class="w-7 h-7 flex items-center justify-center bg-white border border-yeso-300 rounded-lg text-tierra-700 disabled:opacity-30 active:scale-90 transition text-xs">▲</button>
          <button onclick="mover('${p.id}', 1)" ${i === items.length - 1 ? "disabled" : ""} aria-label="Bajar"
            class="w-7 h-7 flex items-center justify-center bg-white border border-yeso-300 rounded-lg text-tierra-700 disabled:opacity-30 active:scale-90 transition text-xs">▼</button>
        </div>

        <div class="arco superficie border border-yeso-300 overflow-hidden w-12 shrink-0">
          <img src="${p.img}" alt="" class="w-full aspect-[4/5] object-cover" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <p class="font-display font-semibold text-sm text-tierra-900 truncate">${p.name}</p>
            ${p.destacado ? '<span class="text-[10px] bg-camel-400 text-tierra-900 font-semibold px-1.5 py-0.5 rounded">Destacada</span>' : ""}
            ${p.visible === false ? '<span class="text-[10px] bg-tierra-700 text-yeso-100 font-semibold px-1.5 py-0.5 rounded">Oculta</span>' : ""}
          </div>
          <p class="text-xs text-tierra-600 mt-0.5 truncate">${cat ? cat.name : "Sin categoría"}</p>
          <p class="text-sm font-semibold ${p.price == null ? "text-tierra-600 font-normal" : "text-terracota-600"} mt-0.5">${fmtPrecio(p.price)}</p>
        </div>

        <div class="flex flex-col gap-1 shrink-0">
          <button onclick="abrirEditor('${p.id}')"
            class="text-xs bg-tierra-800 text-yeso-100 font-medium rounded-lg px-3 py-1.5 active:scale-95 transition">Editar</button>
          <button onclick="eliminarPieza('${p.id}')"
            class="text-xs border border-yeso-300 bg-white text-terracota-600 rounded-lg px-3 py-1.5 active:scale-95 transition">Borrar</button>
        </div>
      </div>`;
    })
    .join("");
}

/** Mueve una pieza respecto a su vecina dentro de lo que se está viendo. */
function mover(id, delta) {
  const visibleIds = listaFiltrada().map((p) => p.id);
  const posVisible = visibleIds.indexOf(id);
  const vecinoId = visibleIds[posVisible + delta];
  if (!vecinoId) return;

  const a = datos.productos.findIndex((p) => p.id === id);
  const b = datos.productos.findIndex((p) => p.id === vecinoId);
  [datos.productos[a], datos.productos[b]] = [datos.productos[b], datos.productos[a]];

  renderLista();
  guardarBorrador();
}

// ══════════════ EDITOR DE PIEZA ══════════════
function placeholderDe(catId) {
  if (PLACEHOLDERS.includes(catId)) return `assets/img/placeholder-${catId}.svg`;
  const cat = datos.categorias.find((c) => c.id === catId);
  const nombre = cat ? cat.name : "Pieza";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">` +
    `<rect width="400" height="500" fill="#E9DCC9"/>` +
    `<circle cx="200" cy="215" r="120" fill="#F7F1E7" fill-opacity="0.6"/>` +
    `<text x="200" y="240" font-family="Georgia, serif" font-size="26" fill="#7A5B3D" text-anchor="middle">${nombre}</text>` +
    `</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function abrirEditor(id) {
  editandoId = id || null;
  fotoPendiente = null;

  $("#editor-categoria").innerHTML = datos.categorias
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");
  $("#editor-error").classList.add("hidden");
  $("#editor-foto-info").textContent = "Se achica y comprime sola para que el catálogo cargue rápido.";

  if (id) {
    const p = datos.productos.find((x) => x.id === id);
    $("#editor-titulo").textContent = "Editar pieza";
    $("#editor-nombre").value = p.name;
    $("#editor-precio").value = p.price == null ? "" : p.price;
    $("#editor-categoria").value = p.category;
    $("#editor-desc").value = p.desc || "";
    $("#editor-visible").checked = p.visible !== false;
    $("#editor-destacado").checked = p.destacado === true;
    $("#editor-preview").src = p.img;
    $("#editor-quitar-foto").classList.toggle("hidden", p.img.includes("placeholder"));
  } else {
    // Si se está mirando una categoría, la pieza nueva arranca en esa
    const primeraCat =
      filtroCat !== "all" && datos.categorias.some((c) => c.id === filtroCat)
        ? filtroCat
        : datos.categorias[0]
        ? datos.categorias[0].id
        : "";
    $("#editor-titulo").textContent = "Nueva pieza";
    $("#editor-nombre").value = "";
    $("#editor-precio").value = "";
    $("#editor-categoria").value = primeraCat;
    $("#editor-desc").value = "";
    $("#editor-visible").checked = true;
    $("#editor-destacado").checked = false;
    $("#editor-preview").src = placeholderDe(primeraCat);
    $("#editor-quitar-foto").classList.add("hidden");
  }

  $("#editor-overlay").classList.remove("opacity-0", "pointer-events-none");
  $("#editor").classList.remove("translate-y-full", "sm:translate-x-full");
  document.body.style.overflow = "hidden";
}

function cerrarEditor() {
  $("#editor-overlay").classList.add("opacity-0", "pointer-events-none");
  $("#editor").classList.add("translate-y-full", "sm:translate-x-full");
  document.body.style.overflow = "";
  fotoPendiente = null;
}

// Si cambia la categoría de una pieza sin foto propia, se actualiza el dibujo
$("#editor-categoria").addEventListener("change", (e) => {
  const src = $("#editor-preview").src;
  if (!fotoPendiente && (src.includes("placeholder") || src.startsWith("data:image/svg"))) {
    $("#editor-preview").src = placeholderDe(e.target.value);
  }
});

function quitarFoto() {
  fotoPendiente = null;
  $("#editor-preview").src = placeholderDe($("#editor-categoria").value);
  $("#editor-quitar-foto").classList.add("hidden");
  $("#editor-foto-info").textContent = "Va a mostrarse el dibujo de la categoría.";
}

// ---- Compresión de la foto elegida ----
$("#editor-foto").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  $("#editor-foto-info").textContent = "Optimizando la foto...";
  try {
    const resultado = await comprimirImagen(file);
    fotoPendiente = resultado;
    $("#editor-preview").src = resultado.dataUrl;
    $("#editor-quitar-foto").classList.remove("hidden");
    $("#editor-foto-info").textContent = `Lista: ${Math.round(resultado.peso / 1024)} KB (antes ${Math.round(file.size / 1024)} KB)`;
  } catch (err) {
    $("#editor-foto-info").textContent = "No se pudo procesar esa imagen. Probá con otra.";
  }
  e.target.value = "";
});

function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const escala = Math.min(1, FOTO_MAX_LADO / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // WebP pesa bastante menos; si el navegador no lo soporta, JPEG
      let dataUrl = canvas.toDataURL("image/webp", FOTO_CALIDAD);
      let ext = "webp";
      if (!dataUrl.startsWith("data:image/webp")) {
        dataUrl = canvas.toDataURL("image/jpeg", FOTO_CALIDAD);
        ext = "jpg";
      }
      const peso = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);
      resolve({ dataUrl, ext, peso });
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("imagen inválida")); };
    img.src = url;
  });
}

function guardarPieza() {
  const nombre = $("#editor-nombre").value.trim();
  const error = $("#editor-error");

  if (!nombre) {
    error.textContent = "Poné un nombre para la pieza.";
    error.classList.remove("hidden");
    $("#editor-nombre").focus();
    return;
  }

  const precioTexto = $("#editor-precio").value.trim();
  const precio = precioTexto === "" ? null : Number(precioTexto);
  if (precio !== null && (isNaN(precio) || precio < 0)) {
    error.textContent = "El precio tiene que ser un número (o quedar vacío).";
    error.classList.remove("hidden");
    return;
  }

  const categoria = $("#editor-categoria").value;
  const base = {
    name: nombre,
    category: categoria,
    price: precio,
    desc: $("#editor-desc").value.trim(),
    visible: $("#editor-visible").checked,
    destacado: $("#editor-destacado").checked,
  };

  if (editandoId) {
    const p = datos.productos.find((x) => x.id === editandoId);
    Object.assign(p, base);
    if (fotoPendiente) {
      p.img = fotoPendiente.dataUrl;
      p.fotoExt = fotoPendiente.ext;
    } else if ($("#editor-preview").src.startsWith("data:image/svg") || $("#editor-preview").src.includes("placeholder")) {
      p.img = placeholderDe(categoria);
      delete p.fotoExt;
    }
  } else {
    let id = slug(nombre);
    let n = 2;
    while (datos.productos.some((p) => p.id === id)) id = slug(nombre) + "-" + n++;

    datos.productos.push({
      id,
      ...base,
      img: fotoPendiente ? fotoPendiente.dataUrl : placeholderDe(categoria),
      ...(fotoPendiente ? { fotoExt: fotoPendiente.ext } : {}),
    });
  }

  cerrarEditor();
  renderLista();
  guardarBorrador();
  mostrarAviso(editandoId ? "Pieza actualizada" : "Pieza agregada");
}

function eliminarPieza(id) {
  const p = datos.productos.find((x) => x.id === id);
  pedirConfirmacion(`¿Borrar "${p.name}" del catálogo? No se puede deshacer.`, "Borrar", () => {
    datos.productos = datos.productos.filter((x) => x.id !== id);
    renderLista();
    guardarBorrador();
    mostrarAviso("Pieza borrada");
  });
}

// ══════════════ CATEGORÍAS ══════════════
function abrirCategorias() {
  renderCategorias();
  $("#cats-overlay").classList.remove("opacity-0", "pointer-events-none");
  $("#cats-panel").classList.remove("translate-y-full", "sm:translate-x-full");
  document.body.style.overflow = "hidden";
}

function cerrarCategorias() {
  $("#cats-overlay").classList.add("opacity-0", "pointer-events-none");
  $("#cats-panel").classList.add("translate-y-full", "sm:translate-x-full");
  document.body.style.overflow = "";
}

function renderCategorias() {
  $("#cats-lista").innerHTML = datos.categorias
    .map((c, i) => {
      const cuantas = datos.productos.filter((p) => p.category === c.id).length;
      return `
      <div class="superficie border border-yeso-300 rounded-xl p-3 flex items-center gap-2">
        <div class="flex flex-col gap-1 shrink-0">
          <button onclick="moverCategoria(${i}, -1)" ${i === 0 ? "disabled" : ""} aria-label="Subir"
            class="w-6 h-6 flex items-center justify-center bg-white border border-yeso-300 rounded text-[10px] text-tierra-700 disabled:opacity-30 active:scale-90 transition">▲</button>
          <button onclick="moverCategoria(${i}, 1)" ${i === datos.categorias.length - 1 ? "disabled" : ""} aria-label="Bajar"
            class="w-6 h-6 flex items-center justify-center bg-white border border-yeso-300 rounded text-[10px] text-tierra-700 disabled:opacity-30 active:scale-90 transition">▼</button>
        </div>
        <div class="flex-1 min-w-0">
          <input value="${c.name.replace(/"/g, "&quot;")}" onchange="renombrarCategoria('${c.id}', this.value)"
            class="w-full bg-white border border-yeso-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-camel-400 transition" />
          <p class="text-xs text-tierra-600 mt-1 px-1">${cuantas} pieza${cuantas === 1 ? "" : "s"}</p>
        </div>
        <button onclick="eliminarCategoria('${c.id}')"
          class="shrink-0 text-xs border border-yeso-300 bg-white text-terracota-600 rounded-lg px-3 py-2 active:scale-95 transition">Borrar</button>
      </div>`;
    })
    .join("");
}

function agregarCategoria() {
  const input = $("#cats-nueva");
  const nombre = input.value.trim();
  if (!nombre) return;

  let id = slug(nombre);
  let n = 2;
  while (datos.categorias.some((c) => c.id === id)) id = slug(nombre) + "-" + n++;

  datos.categorias.push({ id, name: nombre });
  input.value = "";
  renderCategorias();
  renderFiltroCategorias();
  guardarBorrador();
  mostrarAviso("Categoría agregada");
}

function renombrarCategoria(id, nombre) {
  const nuevo = nombre.trim();
  if (!nuevo) { renderCategorias(); return; }
  datos.categorias.find((c) => c.id === id).name = nuevo;
  renderCategorias();
  renderFiltroCategorias();
  renderLista();
  guardarBorrador();
}

function moverCategoria(i, delta) {
  const j = i + delta;
  if (j < 0 || j >= datos.categorias.length) return;
  [datos.categorias[i], datos.categorias[j]] = [datos.categorias[j], datos.categorias[i]];
  renderCategorias();
  renderFiltroCategorias();
  renderLista();
  guardarBorrador();
}

function eliminarCategoria(id) {
  const cat = datos.categorias.find((c) => c.id === id);
  const cuantas = datos.productos.filter((p) => p.category === id).length;

  if (cuantas > 0) {
    mostrarAviso(`"${cat.name}" tiene ${cuantas} pieza${cuantas === 1 ? "" : "s"}: movelas antes de borrarla`);
    return;
  }
  if (datos.categorias.length === 1) {
    mostrarAviso("Tiene que quedar al menos una categoría");
    return;
  }

  pedirConfirmacion(`¿Borrar la categoría "${cat.name}"?`, "Borrar", () => {
    datos.categorias = datos.categorias.filter((c) => c.id !== id);
    if (filtroCat === id) { filtroCat = "all"; }
    renderCategorias();
    renderFiltroCategorias();
    renderLista();
    guardarBorrador();
    mostrarAviso("Categoría borrada");
  });
}

// ══════════════ PUBLICAR: GENERAR ARCHIVOS ══════════════
function fotosNuevas() {
  return datos.productos.filter((p) => p.img && p.img.startsWith("data:image/") && p.fotoExt);
}

/** Nombre de archivo con sufijo de versión, para que no quede cacheada la foto vieja. */
function nombreArchivoFoto(p) {
  const version = Date.now().toString(36).slice(-4);
  return `${p.id}-${version}.${p.fotoExt}`;
}

function generarProductsJs(rutasFotos) {
  const linea = (p) => {
    const img = rutasFotos && rutasFotos[p.id] ? rutasFotos[p.id] : p.img;
    const desc = (p.desc || "").replace(/"/g, '\\"');
    const precio = p.price == null ? "null" : p.price;
    return `  { id: "${p.id}", name: "${p.name.replace(/"/g, '\\"')}", category: "${p.category}", price: ${precio}, desc: "${desc}", img: "${img}", visible: ${p.visible !== false}, destacado: ${p.destacado === true} },`;
  };

  let salida = `/**
 * ARTESANÍAS V.V — catálogo de productos
 * ============================================================
 * Archivo generado desde el panel de administración (admin.html)
 * el ${new Date().toLocaleString("es-AR")}.
 *
 * Se puede seguir editando desde el panel o a mano, respetando
 * las comas y las comillas.
 *
 * Campos: id (único) · name · category (id de CATEGORIES) ·
 * price (número o null = "A consultar") · desc · img ·
 * visible (se muestra o no) · destacado (aparece primero).
 * El orden de la lista es el orden en que aparecen las piezas.
 * ============================================================
 */

const CATEGORIES = [
`;
  salida += datos.categorias
    .map((c) => `  { id: "${c.id}", name: "${c.name.replace(/"/g, '\\"')}" },`)
    .join("\n");
  salida += "\n];\n\nconst PRODUCTS = [\n";

  datos.categorias.forEach((c) => {
    const items = datos.productos.filter((p) => p.category === c.id);
    if (items.length === 0) return;
    salida += `  // ---- ${c.name.toUpperCase()} ----\n`;
    salida += items.map(linea).join("\n") + "\n\n";
  });

  const huerfanos = datos.productos.filter((p) => !datos.categorias.some((c) => c.id === p.category));
  if (huerfanos.length > 0) {
    salida += "  // ---- SIN CATEGORÍA ----\n" + huerfanos.map(linea).join("\n") + "\n";
  }

  salida += "];\n";
  return salida;
}

function abrirExportar() {
  const nuevas = fotosNuevas();
  const ocultas = datos.productos.filter((p) => p.visible === false).length;
  const sinPrecio = datos.productos.filter((p) => p.price == null).length;

  let resumen = `<p class="mb-2"><strong>${datos.productos.length} piezas</strong> en ${datos.categorias.length} categorías.</p><ul class="space-y-1 text-tierra-600">`;
  resumen += `<li>· ${nuevas.length} foto${nuevas.length === 1 ? "" : "s"} nueva${nuevas.length === 1 ? "" : "s"} para subir</li>`;
  if (sinPrecio > 0) resumen += `<li>· ${sinPrecio} pieza${sinPrecio === 1 ? "" : "s"} sin precio (van a decir "A consultar")</li>`;
  if (ocultas > 0) resumen += `<li>· ${ocultas} oculta${ocultas === 1 ? "" : "s"}, no se ven en el catálogo</li>`;
  resumen += "</ul>";
  $("#export-resumen").innerHTML = resumen;

  $("#export-overlay").classList.remove("opacity-0", "pointer-events-none");
  $("#export-panel").classList.remove("translate-y-full", "sm:translate-y-[calc(-50%+2rem)]", "sm:opacity-0", "sm:pointer-events-none");
  $("#export-panel").classList.add("sm:-translate-y-1/2");
  document.body.style.overflow = "hidden";
}

function cerrarExportar() {
  $("#export-overlay").classList.add("opacity-0", "pointer-events-none");
  $("#export-panel").classList.add("translate-y-full", "sm:translate-y-[calc(-50%+2rem)]", "sm:opacity-0", "sm:pointer-events-none");
  $("#export-panel").classList.remove("sm:-translate-y-1/2");
  document.body.style.overflow = "";
}

function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function descargarProductsJs() {
  const nuevas = fotosNuevas();
  if (nuevas.length > 0) {
    mostrarAviso(`Tenés ${nuevas.length} foto${nuevas.length === 1 ? "" : "s"} nueva${nuevas.length === 1 ? "" : "s"}: descargá el paquete completo`);
    return;
  }
  descargar(new Blob([generarProductsJs(null)], { type: "text/javascript" }), "products.js");
  mostrarAviso("Archivo descargado");
}

async function descargarPaquete() {
  const boton = $("#btn-zip");
  boton.disabled = true;

  try {
    const nuevas = fotosNuevas();
    const rutas = {};
    const archivos = [];

    nuevas.forEach((p) => {
      const archivo = nombreArchivoFoto(p);
      rutas[p.id] = `assets/img/${archivo}`;
      archivos.push({ nombre: `assets/img/${archivo}`, base64: p.img.split(",")[1] });
    });

    archivos.push({ nombre: "js/products.js", texto: generarProductsJs(rutas) });
    archivos.push({
      nombre: "LEEME.txt",
      texto:
        `ARTESANÍAS V.V — cambios del ${new Date().toLocaleString("es-AR")}\n\n` +
        `CÓMO PUBLICAR ESTOS CAMBIOS:\n\n` +
        `1. Descomprimí este archivo.\n` +
        `2. Copiá "js/products.js" sobre el del sitio (reemplazando el que está).\n` +
        `3. Copiá las fotos de "assets/img/" dentro de la carpeta "assets/img" del sitio.\n` +
        `4. Subí la carpeta completa del sitio al hosting.\n` +
        `   En GitHub Pages: entrá al repositorio, "Add file > Upload files",\n` +
        `   arrastrá los archivos y tocá "Commit changes".\n\n` +
        `Piezas: ${datos.productos.length}\n` +
        `Fotos nuevas en este paquete: ${nuevas.length}\n`,
    });

    const blob = Zip.crear(archivos);
    const fecha = new Date().toISOString().slice(0, 10);
    descargar(blob, `artesanias-vv-${fecha}.zip`);

    // Una vez descargadas, las fotos ya tienen su ruta definitiva
    nuevas.forEach((p) => {
      p.img = rutas[p.id];
      delete p.fotoExt;
    });
    await Store.escribir(datos);
    renderLista();

    mostrarAviso("Paquete descargado");
    cerrarExportar();
  } catch (err) {
    mostrarAviso("No se pudo generar el paquete");
  } finally {
    boton.disabled = false;
  }
}

// ══════════════ AVISOS Y CONFIRMACIÓN ══════════════
let avisoTimeout;
function mostrarAviso(texto) {
  const t = $("#admin-toast");
  t.textContent = texto;
  t.classList.remove("opacity-0");
  clearTimeout(avisoTimeout);
  avisoTimeout = setTimeout(() => t.classList.add("opacity-0"), 2600);
}

let confirmarAccion = null;
function pedirConfirmacion(texto, etiqueta, accion) {
  $("#confirm-texto").textContent = texto;
  $("#confirm-si").textContent = etiqueta;
  confirmarAccion = accion;
  $("#confirm-overlay").classList.remove("opacity-0", "pointer-events-none");
}

function cerrarConfirmacion() {
  $("#confirm-overlay").classList.add("opacity-0", "pointer-events-none");
  confirmarAccion = null;
}

$("#confirm-si").addEventListener("click", () => {
  if (confirmarAccion) confirmarAccion();
  cerrarConfirmacion();
});
$("#confirm-no").addEventListener("click", cerrarConfirmacion);

// ══════════════ EVENTOS ══════════════
$("#admin-search").addEventListener("input", (e) => { busqueda = e.target.value; renderLista(); });
$("#admin-filtro-cat").addEventListener("change", (e) => { filtroCat = e.target.value; renderLista(); });
$("#editor-overlay").addEventListener("click", cerrarEditor);
$("#cats-overlay").addEventListener("click", cerrarCategorias);
$("#export-overlay").addEventListener("click", cerrarExportar);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  cerrarEditor();
  cerrarCategorias();
  cerrarExportar();
  cerrarConfirmacion();
});

// ══════════════ INICIO ══════════════
try {
  if (sessionStorage.getItem("vv_admin_ok") === "1") entrar();
} catch (e) { /* nada */ }
