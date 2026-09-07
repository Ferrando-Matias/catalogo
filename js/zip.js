/**
 * ARTESANÍAS V.V — armador de archivos .zip
 * ============================================================
 * Genera el paquete de cambios sin depender de ninguna librería
 * externa, así el panel funciona aunque no haya internet.
 *
 * Usa el modo "guardado" (sin compresión): las fotos ya vienen
 * comprimidas en WebP/JPEG, así que comprimirlas de nuevo no
 * ahorraría prácticamente nada.
 * ============================================================
 */

const Zip = (() => {
  // ---- Tabla CRC32 (la checksum que pide el formato zip) ----
  const TABLA_CRC = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = TABLA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  const textoABytes = (t) => new TextEncoder().encode(t);

  function base64ABytes(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  /** Fecha y hora en el formato MS-DOS que usa el zip. */
  function fechaDos(d) {
    const hora = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2);
    const fecha = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    return { hora: hora & 0xffff, fecha: fecha & 0xffff };
  }

  /**
   * @param {Array<{nombre: string, texto?: string, base64?: string}>} archivos
   * @returns {Blob} el .zip listo para descargar
   */
  function crear(archivos) {
    const ahora = fechaDos(new Date());
    const partes = [];       // trozos del cuerpo del zip
    const centrales = [];    // entradas del directorio central
    let offset = 0;

    archivos.forEach((archivo) => {
      const nombre = textoABytes(archivo.nombre);
      const datos = archivo.base64 ? base64ABytes(archivo.base64) : textoABytes(archivo.texto || "");
      const crc = crc32(datos);

      // --- Encabezado local ---
      const local = new Uint8Array(30 + nombre.length);
      const vl = new DataView(local.buffer);
      vl.setUint32(0, 0x04034b50, true);   // firma
      vl.setUint16(4, 20, true);           // versión necesaria
      vl.setUint16(6, 0x0800, true);       // bit 11: nombres en UTF-8
      vl.setUint16(8, 0, true);            // método: 0 = guardado
      vl.setUint16(10, ahora.hora, true);
      vl.setUint16(12, ahora.fecha, true);
      vl.setUint32(14, crc, true);
      vl.setUint32(18, datos.length, true); // tamaño comprimido
      vl.setUint32(22, datos.length, true); // tamaño original
      vl.setUint16(26, nombre.length, true);
      vl.setUint16(28, 0, true);            // sin campos extra
      local.set(nombre, 30);

      partes.push(local, datos);

      // --- Entrada del directorio central ---
      const central = new Uint8Array(46 + nombre.length);
      const vc = new DataView(central.buffer);
      vc.setUint32(0, 0x02014b50, true);
      vc.setUint16(4, 20, true);            // versión que lo creó
      vc.setUint16(6, 20, true);            // versión necesaria
      vc.setUint16(8, 0x0800, true);
      vc.setUint16(10, 0, true);
      vc.setUint16(12, ahora.hora, true);
      vc.setUint16(14, ahora.fecha, true);
      vc.setUint32(16, crc, true);
      vc.setUint32(20, datos.length, true);
      vc.setUint32(24, datos.length, true);
      vc.setUint16(28, nombre.length, true);
      vc.setUint32(42, offset, true);       // dónde empieza el encabezado local
      central.set(nombre, 46);

      centrales.push(central);
      offset += local.length + datos.length;
    });

    const tamañoCentral = centrales.reduce((s, c) => s + c.length, 0);

    // --- Cierre del directorio central ---
    const fin = new Uint8Array(22);
    const vf = new DataView(fin.buffer);
    vf.setUint32(0, 0x06054b50, true);
    vf.setUint16(8, archivos.length, true);
    vf.setUint16(10, archivos.length, true);
    vf.setUint32(12, tamañoCentral, true);
    vf.setUint32(16, offset, true);

    return new Blob([...partes, ...centrales, fin], { type: "application/zip" });
  }

  return { crear };
})();
