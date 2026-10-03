// Mails del pedido de presupuesto: uno a ventas (con la captura) y la confirmación al cliente.
// El resumen de la configuración sale de resumenConfiguracion() del modelo compartido (textos.js),
// así los textos son los mismos que ve el cliente en el configurador. Sin precios.
const catalogo = require('../configurador/modelo/catalogo.json');

// Colores de theme.css del sitio (los mails no leen variables CSS)
const COLOR = { marca: '#224870', acento: '#5387c0', borde: '#d6e4f3', fondo: '#f4f9ff', alerta: '#b3261e', alertaFondo: '#fdecea' };

const escapar = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const tabla = (titulo, filas) => `
  <h3 style="margin:24px 0 8px;font-size:15px;color:${COLOR.marca}">${escapar(titulo)}</h3>
  <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
    ${filas.map(({ nombre, valor }) => `
    <tr>
      <td style="padding:6px 10px;border:1px solid ${COLOR.borde};background:${COLOR.fondo};width:40%;color:#4a5c72">${escapar(nombre)}</td>
      <td style="padding:6px 10px;border:1px solid ${COLOR.borde};color:#16202e">${escapar(valor)}</td>
    </tr>`).join('')}
  </table>`;

const marco = (contenido) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#16202e">
  <div style="max-width:640px;margin:0 auto">
    <div style="padding:16px 20px;background:${COLOR.marca};color:#ffffff;border-radius:8px 8px 0 0">
      <strong style="font-size:18px">CLL Heladeras</strong>
    </div>
    <div style="padding:8px 20px 24px;border:1px solid ${COLOR.borde};border-top:0;border-radius:0 0 8px 8px">
      ${contenido}
    </div>
  </div>
</body></html>`;

const textoPlano = (titulo, filas) => `${titulo}\n${filas.map(({ nombre, valor }) => `  ${nombre}: ${valor}`).join('\n')}\n`;

/** Una línea corta que describe la línea: "2 bateas, esquina" (para el asunto). */
const descripcionCorta = (config) => {
  const bateas = config.modulos.filter((m) => m.tipo === 'batea').length;
  const extras = [...new Set(config.modulos.filter((m) => ['esquina', 'mostrador'].includes(m.tipo)).map((m) => m.tipo))];
  return [`${bateas} ${bateas === 1 ? 'batea' : 'bateas'}`, ...extras].join(', ');
};

/**
 * Arma los dos mails. Devuelve objetos para transportes.enviar().
 * @param {object} p
 * @param {string} p.ref
 * @param {object} p.config                 configuración validada
 * @param {object} p.contacto               datos del cliente (validados)
 * @param {{ buffer: Buffer, extension: string, tipo: string } | null} p.captura
 * @param {{ ventas: string, remitente: string, tiempoRespuesta: string }} p.destinos
 */
const armarMails = async ({ ref, config, contacto, captura, destinos }) => {
  const { resumenConfiguracion } = await import('../configurador/modelo/textos.js');
  const resumen = resumenConfiguracion(config, catalogo);
  const especial = Boolean(contacto.medidasEspeciales);

  const filasContacto = [
    { nombre: 'Nombre', valor: contacto.nombre },
    { nombre: 'Empresa', valor: contacto.empresa },
    { nombre: 'Email', valor: contacto.email },
    { nombre: 'Teléfono', valor: contacto.telefono },
    { nombre: 'Localidad de instalación', valor: contacto.localidad },
    { nombre: 'Plazo', valor: contacto.plazo },
    ...(contacto.cuit ? [{ nombre: 'CUIT', valor: contacto.cuit }] : []),
  ];

  const htmlConfig = [
    tabla('Opciones generales', resumen.linea),
    ...resumen.modulos.map((m) => tabla(m.nombre, m.filas)),
  ].join('');
  const textoConfig = [
    textoPlano('Opciones generales', resumen.linea),
    ...resumen.modulos.map((m) => textoPlano(m.nombre, m.filas)),
  ].join('\n');

  const recuadroEspecial = especial ? `
    <div style="margin:20px 0 0;padding:12px 16px;border:2px solid ${COLOR.alerta};background:${COLOR.alertaFondo};border-radius:6px">
      <strong style="color:${COLOR.alerta}">📝 NOTAS DEL CLIENTE</strong>
      <p style="margin:6px 0 0;white-space:pre-wrap">${escapar(contacto.medidasEspeciales)}</p>
    </div>` : '';

  // ------------------------------------------------------------ a ventas
  const ventas = {
    from: destinos.remitente,
    to: destinos.ventas,
    replyTo: `${contacto.nombre} <${contacto.email}>`,
    subject: `${especial ? '📝 NOTAS DEL CLIENTE · ' : ''}[${ref}] Pedido de presupuesto – ${descripcionCorta(config)} – ${contacto.empresa}`,
    html: marco(`
      <h2 style="margin:16px 0 4px;font-size:20px;color:${COLOR.marca}">Nuevo pedido de presupuesto</h2>
      <p style="margin:0;color:#4a5c72">Referencia <strong style="color:${COLOR.marca}">${escapar(ref)}</strong> · desde el configurador 3D</p>
      ${recuadroEspecial}
      ${tabla('Datos de contacto', filasContacto)}
      ${htmlConfig}
      <p style="margin:24px 0 0;font-size:13px;color:#4a5c72">${captura ? 'La captura del 3D va adjunta.' : 'Sin captura: el cliente usó la versión sin 3D.'}
      Respondé este mail para escribirle directamente al cliente.</p>`),
    text: [
      `Nuevo pedido de presupuesto ${ref}`,
      especial ? `\n📝 NOTAS DEL CLIENTE:\n${contacto.medidasEspeciales}\n` : '',
      textoPlano('Datos de contacto', filasContacto),
      textoConfig,
    ].join('\n'),
    attachments: captura ? [{ filename: `${ref}.${captura.extension}`, content: captura.buffer, contentType: captura.tipo }] : [],
  };

  // ------------------------------------------------------------ al cliente
  const cliente = {
    from: destinos.remitente,
    to: contacto.email,
    replyTo: destinos.ventas,
    subject: `Recibimos tu pedido de presupuesto ${ref} – CLL Heladeras`,
    html: marco(`
      <h2 style="margin:16px 0 4px;font-size:20px;color:${COLOR.marca}">¡Gracias, ${escapar(contacto.nombre)}!</h2>
      <p style="margin:0 0 4px">Recibimos tu pedido de presupuesto. Tu referencia es
        <strong style="color:${COLOR.marca}">${escapar(ref)}</strong>.</p>
      <p style="margin:0">Te respondemos en ${escapar(destinos.tiempoRespuesta)}.</p>
      ${especial ? `<p style="margin:12px 0 0;color:#4a5c72">También recibimos tus notas: las vamos a revisar con vos.</p>` : ''}
      ${htmlConfig}
      <p style="margin:24px 0 0;font-size:13px;color:#4a5c72">Si querés cambiar algo, respondé este mail indicando la referencia.</p>`),
    text: [
      `¡Gracias, ${contacto.nombre}!`,
      `Recibimos tu pedido de presupuesto. Tu referencia es ${ref}.`,
      `Te respondemos en ${destinos.tiempoRespuesta}.\n`,
      textoConfig,
    ].join('\n'),
    attachments: [],
  };

  return { ventas, cliente };
};

module.exports = { armarMails, escapar };
