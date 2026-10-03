// Analítica básica del configurador (prompt 11): manda eventos a POST /eventos.
// Sin cookies ni datos personales: solo el nombre del evento, un id al azar por pestaña y, si hay,
// la referencia del pedido. presupuesto_enviado lo registra el server al crear el pedido.
// Nunca rompe nada: si falla, no pasa nada.

const API = import.meta.env.VITE_API_URL;

/** @typedef {'configurador_iniciado' | 'configuracion_completa' | 'whatsapp_click'} Evento */

/** Id al azar de esta pestaña (sessionStorage), para contar sesiones sin cookies. */
const idSesion = () => {
  try {
    let id = sessionStorage.getItem('cll-sesion');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('cll-sesion', id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
};

/**
 * Registra un evento. Usa sendBeacon (sobrevive a la navegación, por ejemplo al abrir WhatsApp) con
 * text/plain, que no dispara el preflight de CORS; si no hay beacon, fetch con keepalive.
 * @param {Evento} evento
 * @param {{ ref?: string }} [datos]
 */
export const registrar = (evento, datos = {}) => {
  if (!API) return;
  try {
    const cuerpo = JSON.stringify({ evento, sesion: idSesion(), ...(datos.ref ? { ref: datos.ref } : {}) });
    const url = `${API}/eventos`;
    const enviado = navigator.sendBeacon?.(url, new Blob([cuerpo], { type: 'text/plain' }));
    if (!enviado) fetch(url, { method: 'POST', body: cuerpo, headers: { 'Content-Type': 'text/plain' }, keepalive: true }).catch(() => {});
  } catch {
    // la analítica nunca interrumpe al usuario
  }
};

/**
 * Registra un evento una sola vez por pestaña (p. ej. configurador_iniciado, aunque se recargue el componente).
 * @param {Evento} evento
 */
export const registrarUnaVez = (evento) => {
  try {
    const clave = `cll-evento-${evento}`;
    if (sessionStorage.getItem(clave)) return;
    sessionStorage.setItem(clave, '1');
  } catch {
    // sin sessionStorage se registra igual
  }
  registrar(evento);
};
