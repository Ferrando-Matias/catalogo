/**
 * ARTESANÍAS V.V — catálogo de productos
 * ============================================================
 * Archivo generado desde el panel de administración (admin.html)
 * el 7/9/2026, 03:08:01.
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
  { id: "velas", name: "Velas" },
  { id: "difusores", name: "Difusores" },
  { id: "bandejas", name: "Bandejas" },
  { id: "floreros", name: "Floreros" },
  { id: "figuras", name: "Figuras 3D" },
  { id: "centros-mesa", name: "Centros de Mesa" },
  { id: "yeso", name: "Yeso (materia prima)" },
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
  { id: "bandeja-prueba", name: "Bandeja Prueba", category: "bandejas", price: 15000, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },
  { id: "bandeja-redonda", name: "Bandeja Redonda", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },
  { id: "bandeja-redonda-3d", name: "Bandeja Redonda 3D", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },
  { id: "bandeja-oval-3d", name: "Bandeja Oval 3D", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },
  { id: "bandeja-hoja-3d", name: "Bandeja Hoja 3D", category: "bandejas", price: null, desc: "", img: "assets/img/placeholder-bandejas.svg", visible: true, destacado: false },

  // ---- FLOREROS ----
  { id: "florero-lechero-yeso", name: "Florero Lechero de Yeso", category: "floreros", price: null, desc: "", img: "assets/img/placeholder-floreros.svg", visible: true, destacado: false },
  { id: "florero-3d", name: "Florero 3D", category: "floreros", price: null, desc: "", img: "assets/img/placeholder-floreros.svg", visible: true, destacado: false },

  // ---- FIGURAS 3D ----
  { id: "esculturas-3d", name: "Esculturas 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: false },
  { id: "elefante-chico-3d", name: "Elefante Chico 3D", category: "figuras", price: null, desc: "", img: "assets/img/placeholder-figuras.svg", visible: true, destacado: true },
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
  { id: "ying-yang-yeso", name: "Ying y Yang de Yeso", category: "yeso", price: null, desc: "", img: "assets/img/placeholder-yeso.svg", visible: true, destacado: false },
  { id: "yeso-basico", name: "Yeso Básico", category: "yeso", price: null, desc: "", img: "assets/img/placeholder-yeso.svg", visible: true, destacado: false },
  { id: "yeso-mediano", name: "Yeso Mediano", category: "yeso", price: null, desc: "", img: "assets/img/placeholder-yeso.svg", visible: true, destacado: false },
  { id: "yeso-extra", name: "Yeso Extra", category: "yeso", price: null, desc: "", img: "assets/img/placeholder-yeso.svg", visible: true, destacado: false },

];
