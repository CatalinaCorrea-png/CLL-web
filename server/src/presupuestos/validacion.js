// Validación del pedido de presupuesto (POST /presupuestos).
// La configuración se revalida con el MISMO esquema y las MISMAS reglas que usa el configurador
// (copia del modelo del client en src/configurador/modelo/, npm run sync-modelo).
const crypto = require('crypto');
const { z } = require('zod');
const catalogo = require('../configurador/modelo/catalogo.json');

// El modelo es ESM: se carga una sola vez con import() y se reusa el esquema.
let esquemaConfig = null;
const cargarEsquema = async () => {
  if (!esquemaConfig) {
    const { crearEsquema } = await import('../configurador/modelo/esquema.js');
    esquemaConfig = crearEsquema(catalogo);
  }
  return esquemaConfig;
};

const texto = (max) => z.string().trim().min(1, 'Es obligatorio.').max(max, `Máximo ${max} caracteres.`);
const opcional = (max) => z.string().trim().max(max, `Máximo ${max} caracteres.`).optional()
  .transform((v) => (v ? v : undefined));

const esquemaContacto = z.object({
  nombre: texto(120),
  empresa: texto(120),
  email: z.string().trim().toLowerCase().max(160).pipe(z.email('El email no es válido.')),
  telefono: z.string().trim().min(6, 'El teléfono no es válido.').max(40).regex(/^[0-9+()\-\s]+$/, 'El teléfono no es válido.'),
  localidad: texto(120),
  plazo: texto(80),
  cuit: opcional(20).refine((v) => !v || /^\d{2}-?\d{8}-?\d$/.test(v), 'El CUIT no es válido (11 números).'),
  medidasEspeciales: opcional(2000),
});

const esquemaPedido = z.object({
  config: z.unknown(),
  versionCatalogo: z.coerce.number().int(),
  contacto: esquemaContacto,
  snapshot: z.string().optional().nullable(),
  // Antispam: campo oculto que una persona deja vacío, y cuánto tardó en completar el formulario (ms)
  sitioWeb: z.string().optional(),
  tiempoFormulario: z.coerce.number().optional(),
});

/** Errores de zod → lista legible { campo, mensaje }. */
const erroresLegibles = (error, prefijo = '') =>
  error.issues.map((i) => ({ campo: [prefijo, ...i.path].filter((p) => p !== '').join('.'), mensaje: i.message }));

/** ¿Lo mandó un bot? Honeypot con algo escrito o formulario completado en menos de 3 segundos. */
const TIEMPO_MINIMO_MS = 3000;
const esBot = (body) =>
  Boolean(body && typeof body.sitioWeb === 'string' && body.sitioWeb.trim() !== '') ||
  Boolean(body && body.tiempoFormulario !== undefined && Number(body.tiempoFormulario) < TIEMPO_MINIMO_MS);

/**
 * Valida el body completo. Devuelve { ok: true, pedido } o { ok: false, status, errores }.
 */
const validarPedido = async (body) => {
  const pedido = esquemaPedido.safeParse(body ?? {});
  if (!pedido.success) return { ok: false, status: 400, errores: erroresLegibles(pedido.error) };

  if (pedido.data.versionCatalogo !== catalogo.version) {
    return {
      ok: false,
      status: 409,
      errores: [{ campo: 'versionCatalogo', mensaje: 'El configurador se actualizó mientras armabas tu equipo. Recargá la página y volvé a enviarlo.' }],
    };
  }

  const esquema = await cargarEsquema();
  const config = esquema.safeParse(pedido.data.config);
  if (!config.success) return { ok: false, status: 400, errores: erroresLegibles(config.error, 'config') };

  return { ok: true, pedido: { ...pedido.data, config: config.data } };
};

/** JSON con las claves ordenadas: la misma configuración da siempre el mismo texto. */
const ordenar = (v) =>
  Array.isArray(v) ? v.map(ordenar)
    : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordenar(v[k])]))
      : v;

/**
 * Huella de la configuración (SHA-256), para detectar pedidos repetidos.
 * No incluye el color: no cambia el presupuesto, así que el mismo pedido con otro color es el mismo
 * pedido. Sí cuentan el material y dónde va el color (faldón, zócalo o los dos).
 */
const hashConfig = (config) => {
  const { color, ...linea } = config.linea ?? {}; // eslint-disable-line no-unused-vars
  return crypto.createHash('sha256').update(JSON.stringify(ordenar({ ...config, linea }))).digest('hex');
};

// ------------------------------------------------------------------ captura
const MAX_CAPTURA = 1.5 * 1024 * 1024; // 1,5 MB ya decodificada
const FORMATOS = [
  { tipo: 'image/png', extension: 'png', firma: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
  { tipo: 'image/jpeg', extension: 'jpg', firma: Buffer.from([0xff, 0xd8, 0xff]) },
];

/**
 * Data URL de la captura → { buffer, extension, tipo }, o null si no vino.
 * Verifica el formato por los bytes del archivo (no solo por lo que dice la data URL).
 * Tira un Error con `status` 400 o 413 si no sirve.
 */
const decodificarCaptura = (snapshot) => {
  if (!snapshot) return null;
  const m = /^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=\s]+)$/.exec(snapshot);
  const falla = (status, mensaje) => Object.assign(new Error(mensaje), { status });
  if (!m) throw falla(400, 'La captura tiene que ser una imagen PNG o JPEG.');
  const buffer = Buffer.from(m[2], 'base64');
  if (buffer.length > MAX_CAPTURA) throw falla(413, 'La captura es demasiado grande.');
  const formato = FORMATOS.find((f) => f.tipo === m[1] && buffer.subarray(0, f.firma.length).equals(f.firma));
  if (!formato) throw falla(400, 'La captura tiene que ser una imagen PNG o JPEG.');
  return { buffer, extension: formato.extension, tipo: formato.tipo };
};

module.exports = { validarPedido, esBot, hashConfig, decodificarCaptura, TIEMPO_MINIMO_MS };
