/**
 * ARTESANÍAS V.V — catálogo de productos
 * ============================================================
 * ESTE ARCHIVO SE PUEDE EDITAR DE DOS MANERAS:
 *
 *   1) Desde el panel de administración (recomendado):
 *      abrí admin.html en el navegador, entrá con tu usuario y
 *      contraseña, cargá los cambios y descargá el archivo
 *      actualizado. No hace falta tocar nada de código.
 *
 *   2) A mano, editando la lista de abajo (respetando comas y comillas).
 * ============================================================
 *
 * Campos de cada producto:
 *   id        -> identificador único, no repetir (texto sin espacios)
 *   name      -> nombre que ve el cliente
 *   category  -> tiene que ser uno de los "id" de CATEGORIES
 *   price     -> precio en pesos, SOLO NÚMERO (sin puntos ni $). Ej: 8500
 *                Si todavía no está definido, dejalo en null: el catálogo
 *                muestra "A consultar" y no lo suma al total.
 *   desc      -> descripción corta (opcional, puede quedar "")
 *   img       -> ruta a la foto (o el placeholder de la categoría)
 *   visible   -> true = se muestra en el catálogo / false = queda oculto
 *   destacado -> true = aparece primero y en la fila "Destacadas"
 *
 * El ORDEN de esta lista es el orden en que aparecen las piezas.
 */

const CATEGORIES = [
  { id: "velas", name: "Velas", icon: "🕯️" },
  { id: "difusores", name: "Difusores", icon: "💧" },
  { id: "bandejas", name: "Bandejas", icon: "🍽️" },
  { id: "floreros", name: "Floreros", icon: "🌿" },
  { id: "figuras", name: "Figuras 3D", icon: "🗿" },
  { id: "centros-mesa", name: "Centros de Mesa", icon: "🕊️" },
  { id: "yeso", name: "Yeso (materia prima)", icon: "🧱" },
];

const PRODUCTS = [
  // ---- VELAS ----
  { id: "vela-vidrio", name: "Vela de Vidrio", category: "velas", price: null, desc: "", img: "assets/img/placeholder-velas.svg", visible: true, destacado: false },
  { id: "vela-molde-grande", name: "Vela Molde Grande", category: "velas", price: null, desc: "", img: "assets/img/placeholder-velas.svg", visible: true, destacado: false },
  { id: "vela-molde-mediana", name: "Vela Molde Mediana", category: "velas", price: null, desc: "", img: "assets/img/placeholder-velas.svg", visible: true, destacado: false },
  { id: "vela-molde-chica", name: "Vela Molde Chica", category: "velas", price: null, desc: "", img: "assets/img/placeholder-velas.svg", visible: true, destacado: false },
  { id: "vela-exagonal-yeso", name: "Vela Exagonal de Yeso", category: "velas", price: null, desc: "", img: "assets/img/placeholder-velas.svg", visible: true, destacado: false },
  { id: "vela-vidrio-princesa-grande", name: "Vela Vidrio Princesa Grande", category: "velas", price: null, desc: "", img: "assets/img/placeholder-velas.svg", visible: true, destacado: false },
  { id: "vela-preciosa-chica", name: "Vela Preciosa Chica", category: "velas", price: null, desc: "", img: "assets/img/placeholder-velas.svg", visible: true, destacado: false },
  { id: "velas-3d", name: "Velas 3D", category: "velas", price: null, desc: "", img: "assets/img/placeholder-velas.svg", visible: true, destacado: false },

  // ---- DIFUSORES ----
  { id: "difusores-3d", name: "Difusores 3D", category: "difusores", price: null, desc: "", img: "assets/img/placeholder-difusores.svg", visible: true, destacado: false },
  { id: "difusores-vidrio", name: "Difusores de Vidrio", category: "difusores", price: null, desc: "", img: "assets/img/placeholder-difusores.svg", visible: true, destacado: false },

  // ---- BANDEJAS ----
  { id: "bandeja-oval-yeso", name: "Bandeja Oval de Yeso", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },
  { id: "bandeja-cuadrada-yeso", name: "Bandeja Cuadrada de Yeso", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },
  { id: "bandeja-redonda", name: "Bandeja Redonda", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },
  { id: "bandeja-redonda-3d", name: "Bandeja Redonda 3D", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },
  { id: "bandeja-oval-3d", name: "Bandeja Oval 3D", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },
  { id: "bandeja-hoja-3d", name: "Bandeja Hoja 3D", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },

  // ---- FLOREROS ----
  { id: "florero-lechero-yeso", name: "Florero Lechero de Yeso", category: "floreros", price: null, desc: "", img: "assets/img/placeholder-floreros.svg", visible: true, destacado: false },
  { id: "florero-3d", name: "Florero 3D", category: "floreros", price: null, desc: "", img: "assets/img/placeholder-floreros.svg", visible: true, destacado: false },

  // ---- FIGURAS 3D ----
  { id: "ying-yang-yeso", name: "Ying y Yang de Yeso", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "esculturas-3d", name: "Esculturas 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "elefante-chico-3d", name: "Elefante Chico 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "elefante-grande-3d", name: "Elefante Grande 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "cara-3d", name: "Cara 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "caballo-3d", name: "Caballo 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "perro-3d", name: "Perro 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "gato-3d", name: "Gato 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "cola-ballena-3d", name: "Cola de Ballena 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "budas-3d", name: "Budas 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "torre-paris", name: "Torre de París", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "torre-pizza", name: "Torre de Pizza", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "venus-3d", name: "Venus 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "espiga-3d", name: "Espiga 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },

  // ---- CENTROS DE MESA ----
  { id: "juego-centro-mesa", name: "Juego de Centro de Mesa", category: "centros-mesa", price: null, desc: "", img: "assets/img/placeholder-centros-mesa.svg", visible: true, destacado: false },
  { id: "centro-mesa-3d", name: "Centro de Mesa 3D", category: "centros-mesa", price: null, desc: "", img: "assets/img/placeholder-centros-mesa.svg", visible: true, destacado: false },

  // ---- YESO (MATERIA PRIMA) ----
  { id: "yeso-basico", name: "Yeso Básico", category: "yeso", price: null, desc: "", img: "assets/img/placeholder-yeso.svg", visible: true, destacado: false },
  { id: "yeso-mediano", name: "Yeso Mediano", category: "yeso", price: null, desc: "", img: "assets/img/placeholder-yeso.svg", visible: true, destacado: false },
  { id: "yeso-extra", name: "Yeso Extra", category: "yeso", price: null, desc: "", img: "assets/img/placeholder-yeso.svg", visible: true, destacado: false },
];
