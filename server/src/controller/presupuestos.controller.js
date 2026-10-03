// POST /presupuestos: pedido de presupuesto desde el configurador 3D.
// Antispam (honeypot + tiempo mínimo) → validación (mismo esquema que el configurador) → repetido →
// captura → guardar → mails. Si los mails fallan, el pedido queda guardado igual (estado 'error_mail').
const fs = require('fs');
const path = require('path');
const presupuestosModel = require('../models/presupuestos');
const eventosModel = require('../models/eventos');
const catalogo = require('../configurador/modelo/catalogo.json');
const { validarPedido, esBot, hashConfig, decodificarCaptura } = require('../presupuestos/validacion');
const { armarMails } = require('../presupuestos/mails');
const { enviar, proveedor } = require('../presupuestos/transportes');

const PRODUCTO = 'bateas';
const DIAS_REPETIDO = 7; // mismo email + misma configuración (sin contar el color) en este plazo = repetido

/** Nombre del color de la línea en su paleta ("Rojo"), nunca el id. */
const nombreColor = async (linea) => {
  const { paletaDeColor } = await import('../configurador/modelo/reglas.js');
  return paletaDeColor(catalogo, linea.material)?.colores.find((c) => c.id === linea.color)?.nombre ?? null;
};

const destinos = () => ({
  ventas: process.env.MAIL_VENTAS || 'ventas@ejemplo.test',
  remitente: process.env.MAIL_REMITENTE
    || (proveedor() === 'smtp' && process.env.SMTP_USER ? `CLL Heladeras <${process.env.SMTP_USER}>` : 'CLL Heladeras <no-responder@cllheladeras.cloud>'),
  tiempoRespuesta: process.env.MAIL_TIEMPO_RESPUESTA || '48 horas hábiles', // PROVISORIO: lo confirma CLL
});

const carpetaCapturas = () => process.env.CAPTURAS_DIR || path.join(__dirname, '../../tmp/capturas');

/** Referencia con el formato real pero que no existe (para no avisarle al bot que lo descartamos). */
const refFalsa = () => presupuestosModel.formatearRef(new Date().getFullYear(), 1000 + Math.floor(Math.random() * 9000));

const crearPresupuesto = async (req, res) => {
  // 1. Antispam: al bot se le contesta como si hubiera salido bien, pero no se guarda ni se manda nada
  if (esBot(req.body)) {
    console.warn(`[presupuestos] descartado por antispam (ip ${req.ip})`);
    return res.status(201).json({ ref: refFalsa() });
  }

  // 2. Validación
  const validado = await validarPedido(req.body);
  if (!validado.ok) {
    return res.status(validado.status).json({ message: 'Revisá los datos del pedido.', errores: validado.errores });
  }
  const { config, contacto, versionCatalogo, snapshot } = validado.pedido;

  let captura;
  try {
    captura = decodificarCaptura(snapshot);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }

  try {
    // 3. ¿Ya lo pidió? (mismo email y misma configuración en los últimos días; el color no cuenta)
    const configHash = hashConfig(config);
    const repetido = await presupuestosModel.buscarRepetido(contacto.email, configHash, DIAS_REPETIDO);
    if (repetido) {
      const colorDistinto = (repetido.color ?? null) !== (config.linea.color ?? null);
      const color = colorDistinto ? await nombreColor(config.linea) : null;
      return res.status(200).json({
        ref: repetido.ref,
        repetido: true,
        ...(colorDistinto ? { colorDistinto: true } : {}),
        message: colorDistinto
          ? `Ya recibimos este pedido (${repetido.ref}) con otro color. El color no cambia el presupuesto: `
            + `si preferís ${color ? `el ${color.toLowerCase()}` : 'este color'}, respondé el mail de confirmación o escribinos por WhatsApp.`
          : `Ya recibimos este pedido (${repetido.ref}). Te respondemos en ${destinos().tiempoRespuesta}.`,
      });
    }

    // 4. Referencia, captura y fila nueva
    const ref = await presupuestosModel.siguienteRef(new Date().getFullYear());
    let snapshotPath = null;
    if (captura) {
      fs.mkdirSync(carpetaCapturas(), { recursive: true });
      snapshotPath = path.join(carpetaCapturas(), `${ref}.${captura.extension}`);
      fs.writeFileSync(snapshotPath, captura.buffer);
    }
    const id = await presupuestosModel.guardar({
      ref, producto: PRODUCTO, config, configHash, versionCatalogo, snapshotPath,
      ...contacto,
    });

    // 5. Mails (si fallan, el pedido ya está guardado: se marca y se sigue)
    try {
      const { ventas, cliente } = await armarMails({ ref, config, contacto, captura, destinos: destinos() });
      await enviar(ventas);
      await enviar(cliente);
    } catch (error) {
      console.error(`[presupuestos] ${ref} guardado, pero falló el envío de mails:`, error.message);
      await presupuestosModel.marcarEstado(id, 'error_mail').catch(() => {});
    }

    // Analítica: el pedido nuevo lo registra el server (no lo frena un bloqueador; los repetidos no cuentan)
    eventosModel.registrar({ evento: 'presupuesto_enviado', ref }).catch((e) => console.error('[eventos]', e.message));

    return res.status(201).json({ ref });
  } catch (error) {
    console.error('[presupuestos] error al guardar el pedido:', error);
    return res.status(500).json({ message: 'No pudimos registrar tu pedido. Probá de nuevo en unos minutos o escribinos por WhatsApp.' });
  }
};

module.exports = { crearPresupuesto };
