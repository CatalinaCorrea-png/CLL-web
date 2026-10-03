// Envío de los mails según MAIL_PROVEEDOR:
//   prueba (por defecto)  no manda nada: escribe cada mail como .eml (se abre con doble clic, con el
//                         adjunto) y como .html en MAIL_CARPETA_PRUEBA (por defecto server/tmp/mails/)
//   smtp                  nodemailer por SMTP (Gmail: smtp.gmail.com, 465, contraseña de aplicación)
//   resend                API HTTP de Resend (https://resend.com), con RESEND_API_KEY
// Cambiar de proveedor es solo cambiar variables de entorno.
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const proveedor = () => (process.env.MAIL_PROVEEDOR || 'prueba').toLowerCase();

const carpetaPrueba = () => process.env.MAIL_CARPETA_PRUEBA || path.join(__dirname, '../../tmp/mails');

let transporteSmtp = null;
const smtp = () => {
  if (!transporteSmtp) {
    const puerto = Number(process.env.SMTP_PORT || 465);
    transporteSmtp = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: puerto,
      secure: puerto === 465, // 465: TLS directo; 587: STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporteSmtp;
};

const enviarPrueba = async (mail) => {
  const carpeta = carpetaPrueba();
  fs.mkdirSync(carpeta, { recursive: true });
  const { message } = await nodemailer
    .createTransport({ streamTransport: true, buffer: true, newline: 'windows' })
    .sendMail(mail);
  const marca = new Date().toISOString().replace(/[:.]/g, '-');
  const destino = mail.to.replace(/[^a-z0-9@._-]/gi, '_');
  const base = path.join(carpeta, `${marca}_${destino}`);
  fs.writeFileSync(`${base}.eml`, message);
  fs.writeFileSync(`${base}.html`, mail.html);
  console.log(`[mail de prueba] "${mail.subject}" → ${base}.eml`);
  return { id: path.basename(base) };
};

const enviarResend = async (mail) => {
  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: mail.from,
      to: [mail.to],
      reply_to: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: (mail.attachments ?? []).map((a) => ({ filename: a.filename, content: a.content.toString('base64') })),
    }),
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(`Resend respondió ${respuesta.status}: ${datos.message ?? 'error'}`);
  return { id: datos.id };
};

/**
 * Manda un mail con el proveedor configurado.
 * @param {{ from: string, to: string, replyTo?: string, subject: string, html: string, text: string,
 *           attachments?: Array<{ filename: string, content: Buffer, contentType?: string }> }} mail
 */
const enviar = async (mail) => {
  switch (proveedor()) {
    case 'smtp': {
      const info = await smtp().sendMail(mail);
      return { id: info.messageId };
    }
    case 'resend':
      return enviarResend(mail);
    case 'prueba':
      return enviarPrueba(mail);
    default:
      throw new Error(`MAIL_PROVEEDOR desconocido: ${process.env.MAIL_PROVEEDOR}`);
  }
};

/** Avisa al arrancar si la configuración de mails no sirve para producción. */
const revisarConfiguracion = () => {
  const p = proveedor();
  if (p === 'prueba' && process.env.NODE_ENV === 'production') {
    console.warn('[mails] MAIL_PROVEEDOR=prueba: los pedidos se guardan, pero los mails NO se mandan (quedan como archivos).');
  }
  if (p === 'smtp' && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) console.warn('[mails] Faltan SMTP_USER o SMTP_PASS.');
  if (p === 'resend' && !process.env.RESEND_API_KEY) console.warn('[mails] Falta RESEND_API_KEY.');
  if (p !== 'prueba' && !process.env.MAIL_VENTAS) console.warn('[mails] Falta MAIL_VENTAS: el pedido no le llega a nadie de ventas.');
};

module.exports = { enviar, revisarConfiguracion, proveedor };
