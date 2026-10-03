// Captura del 3D para el pedido de presupuesto (prompt 10).
// El canvas de three es transparente (el fondo celeste es CSS): se copia sobre un fondo liso y se
// exporta en JPEG, más liviano que PNG (el backend acepta hasta 1,5 MB).

const ANCHO_MAXIMO = 1600;          // px; las capturas más grandes se achican
const FONDO = '#f4f9ff';            // --surface-soft de theme.css (el fondo del visor)
const CALIDAD_JPEG = 0.85;
const PROPORCION = 3 / 4;           // alto / ancho máximo: un visor alto (mobile, panel al costado) deja mucho
                                    // cielo arriba y piso abajo; se recorta una franja apaisada centrada,
                                    // donde Bounds dejó la línea

/**
 * Copia el canvas del 3D a una imagen JPEG.
 * El Canvas tiene que tener preserveDrawingBuffer (si no, la lectura sale en blanco).
 * @param {HTMLCanvasElement} origen
 * @returns {Promise<Blob | null>}
 */
export const canvasAJpeg = (origen) => {
  const altoRecorte = Math.min(origen.height, origen.width * PROPORCION);
  const yRecorte = (origen.height - altoRecorte) / 2;
  const escala = Math.min(1, ANCHO_MAXIMO / origen.width);
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(origen.width * escala);
  lienzo.height = Math.round(altoRecorte * escala);
  const ctx = lienzo.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  ctx.fillStyle = FONDO;
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.drawImage(origen, 0, yRecorte, origen.width, altoRecorte, 0, 0, lienzo.width, lienzo.height);
  return new Promise((resolver) => lienzo.toBlob(resolver, 'image/jpeg', CALIDAD_JPEG));
};

/**
 * Blob → data URL (base64), como lo recibe POST /presupuestos.
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export const blobADataUrl = (blob) =>
  new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result));
    lector.onerror = () => rechazar(lector.error);
    lector.readAsDataURL(blob);
  });

/** Espera n cuadros del navegador. */
export const esperarCuadros = (n = 2) =>
  new Promise((resolver) => {
    const paso = (/** @type {number} */ quedan) => (quedan <= 0 ? resolver(undefined) : requestAnimationFrame(() => paso(quedan - 1)));
    paso(n);
  });
