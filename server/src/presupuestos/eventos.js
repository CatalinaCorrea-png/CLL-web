// Validación de los eventos de analítica que manda el navegador (POST /eventos).
const { z } = require('zod');

// Los que puede mandar el navegador. presupuesto_enviado lo registra el server al crear el pedido.
const EVENTOS_DEL_NAVEGADOR = ['configurador_iniciado', 'configuracion_completa', 'whatsapp_click'];

const esquemaEvento = z.strictObject({
  evento: z.enum(EVENTOS_DEL_NAVEGADOR),
  sesion: z.uuid(),
  ref: z.string().regex(/^CLL-\d{4}-\d{4,}$/).optional(),
});

/**
 * Body de POST /eventos → { ok: true, evento } o { ok: false }.
 * Llega como texto (navigator.sendBeacon con text/plain no hace preflight de CORS) o como JSON.
 */
const validarEvento = (body) => {
  let datos = body;
  if (typeof body === 'string') {
    try {
      datos = JSON.parse(body);
    } catch {
      return { ok: false };
    }
  }
  const r = esquemaEvento.safeParse(datos);
  return r.success ? { ok: true, evento: r.data } : { ok: false };
};

module.exports = { validarEvento, EVENTOS_DEL_NAVEGADOR };
