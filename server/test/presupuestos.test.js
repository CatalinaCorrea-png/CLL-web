// Tests del pedido de presupuesto (sin base de datos): validación, antispam, captura, mails y transporte de prueba.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const catalogo = require('../src/configurador/modelo/catalogo.json');
const { validarPedido, esBot, hashConfig, decodificarCaptura } = require('../src/presupuestos/validacion');
const { armarMails } = require('../src/presupuestos/mails');
const { formatearRef } = require('../src/models/presupuestos');

const configPorDefecto = async () => (await import('../src/configurador/modelo/esquema.js')).configuracionPorDefecto(catalogo);

const contacto = {
  nombre: 'Ana Pérez', empresa: 'Carnicería <Don José>', email: 'Ana@Ejemplo.com', telefono: '+54 11 2154-4111',
  localidad: 'Morón', plazo: 'Este mes',
};
const pedido = async (cambios = {}) => ({ config: await configPorDefecto(), versionCatalogo: catalogo.version, contacto, ...cambios });
const PNG_MINIMO = 'data:image/png;base64,' + Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString('base64');
const destinos = { ventas: 'ventas@ejemplo.test', remitente: 'CLL <no-responder@ejemplo.test>', tiempoRespuesta: '48 horas hábiles' };

test('referencia con el año y cuatro dígitos', () => {
  assert.equal(formatearRef(2026, 1), 'CLL-2026-0001');
  assert.equal(formatearRef(2027, 42), 'CLL-2027-0042');
});

test('un pedido válido pasa y el email queda en minúsculas', async () => {
  const r = await validarPedido(await pedido());
  assert.equal(r.ok, true);
  assert.equal(r.pedido.contacto.email, 'ana@ejemplo.com');
  assert.equal(r.pedido.contacto.cuit, undefined); // opcional vacío
});

test('faltan datos de contacto o están mal: 400 con el campo', async () => {
  const r = await validarPedido(await pedido({ contacto: { ...contacto, email: 'no-es-mail', localidad: '' } }));
  assert.equal(r.ok, false);
  assert.equal(r.status, 400);
  const campos = r.errores.map((e) => e.campo);
  assert.ok(campos.includes('contacto.email'));
  assert.ok(campos.includes('contacto.localidad'));
});

test('CUIT opcional: si viene, tiene que tener 11 números', async () => {
  assert.equal((await validarPedido(await pedido({ contacto: { ...contacto, cuit: '20-12345678-9' } }))).ok, true);
  assert.equal((await validarPedido(await pedido({ contacto: { ...contacto, cuit: '123' } }))).ok, false);
});

test('la configuración se revalida con el esquema del configurador', async () => {
  const config = await configPorDefecto();
  const mala = { ...config, modulos: config.modulos.map((m) => (m.tipo === 'batea' ? { ...m, largo: 1234 } : m)) };
  const r = await validarPedido(await pedido({ config: mala }));
  assert.equal(r.ok, false);
  assert.ok(r.errores.some((e) => e.campo.startsWith('config.')));
});

test('versión del catálogo vieja: 409', async () => {
  const r = await validarPedido(await pedido({ versionCatalogo: catalogo.version - 1 }));
  assert.equal(r.status, 409);
});

test('antispam: honeypot con algo o formulario en menos de 3 segundos', () => {
  assert.equal(esBot({ sitioWeb: 'http://spam.example' }), true);
  assert.equal(esBot({ tiempoFormulario: 800 }), true);
  assert.equal(esBot({ sitioWeb: '', tiempoFormulario: 45000 }), false);
  assert.equal(esBot({}), false);
});

test('la huella de la configuración no depende del orden de las claves', async () => {
  const c = await configPorDefecto();
  const desordenada = { modulos: c.modulos, linea: Object.fromEntries(Object.entries(c.linea).reverse()) };
  assert.equal(hashConfig(c), hashConfig(desordenada));
});

test('la huella no cuenta los colores (no cambian el presupuesto), pero sí el resto', async () => {
  const c = await configPorDefecto();
  const conLinea = (cambios) => ({ ...c, linea: { ...c.linea, ...cambios } });
  assert.equal(hashConfig(c), hashConfig(conLinea({ colorFaldon: 'rojo' })));
  assert.equal(hashConfig(c), hashConfig(conLinea({ colorFaldon: 'sin_color', colorZocalo: 'azul' })));
  assert.notEqual(hashConfig(c), hashConfig(conLinea({ material: 'galvanizada_prepintada' })));
  assert.notEqual(hashConfig(c), hashConfig(conLinea({ frio: c.linea.frio === 'forzado' ? 'estatico' : 'forzado' })));
  const otroLargo = { ...c, modulos: c.modulos.map((m) => (m.tipo === 'batea' ? { ...m, largo: 2400 } : m)) };
  assert.notEqual(hashConfig(c), hashConfig(otroLargo));
});

test('captura: PNG o JPEG de verdad (por los bytes), opcional', () => {
  assert.equal(decodificarCaptura(undefined), null);
  assert.equal(decodificarCaptura(PNG_MINIMO).extension, 'png');
  assert.throws(() => decodificarCaptura('data:image/png;base64,' + Buffer.from('hola').toString('base64')), /PNG o JPEG/);
  assert.throws(() => decodificarCaptura('data:text/html;base64,PGI+'), /PNG o JPEG/);
});

test('mails: tablas legibles, captura adjunta a ventas y textos del cliente escapados', async () => {
  const { ventas, cliente } = await armarMails({
    ref: 'CLL-2026-0001', config: await configPorDefecto(), contacto, captura: decodificarCaptura(PNG_MINIMO), destinos,
  });
  assert.match(ventas.subject, /^\[CLL-2026-0001\] Pedido de presupuesto/);
  assert.ok(!ventas.subject.includes('NOTAS DEL CLIENTE'));
  assert.ok(ventas.html.includes('Carnicería &lt;Don José&gt;')); // escapado
  assert.ok(!ventas.html.includes('<Don José>'));
  assert.ok(ventas.html.includes('Opciones generales') && ventas.html.includes('Batea 1'));
  assert.ok(!ventas.html.includes('galvanizada_pintada')); // nunca ids internos
  assert.equal(ventas.attachments.length, 1);
  assert.equal(ventas.attachments[0].filename, 'CLL-2026-0001.png');
  assert.equal(cliente.to, contacto.email);
  assert.ok(cliente.html.includes('Te respondemos en 48 horas hábiles'));
  assert.equal(cliente.attachments.length, 0);
});

test('mails: marca NOTAS DEL CLIENTE solo si el cliente escribió algo', async () => {
  const { ventas } = await armarMails({
    ref: 'CLL-2026-0002', config: await configPorDefecto(), captura: null, destinos,
    contacto: { ...contacto, medidasEspeciales: 'Necesito 2,75 m de largo' },
  });
  assert.match(ventas.subject, /NOTAS DEL CLIENTE/);
  assert.ok(ventas.html.includes('NOTAS DEL CLIENTE') && ventas.html.includes('Necesito 2,75 m de largo'));
  assert.equal(ventas.attachments.length, 0); // sin captura (modo sin WebGL)
});

test('transporte de prueba: escribe el .eml con el adjunto y el .html', async () => {
  const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'cll-mails-'));
  process.env.MAIL_PROVEEDOR = 'prueba';
  process.env.MAIL_CARPETA_PRUEBA = carpeta;
  try {
    const { enviar } = require('../src/presupuestos/transportes');
    const { ventas } = await armarMails({
      ref: 'CLL-2026-0003', config: await configPorDefecto(), contacto, captura: decodificarCaptura(PNG_MINIMO), destinos,
    });
    await enviar(ventas);
    const archivos = fs.readdirSync(carpeta);
    const eml = archivos.find((a) => a.endsWith('.eml'));
    assert.ok(eml && archivos.some((a) => a.endsWith('.html')));
    const contenido = fs.readFileSync(path.join(carpeta, eml), 'utf8');
    assert.ok(contenido.includes('CLL-2026-0003.png'));
  } finally {
    fs.rmSync(carpeta, { recursive: true, force: true });
    delete process.env.MAIL_PROVEEDOR;
    delete process.env.MAIL_CARPETA_PRUEBA;
  }
});

test('seguridad: sin saltos de línea en los campos de una línea (inyección en cabeceras de mail)', async () => {
  for (const campo of ['nombre', 'empresa', 'localidad', 'plazo']) {
    const r = await validarPedido(await pedido({ contacto: { ...contacto, [campo]: 'Algo\r\nBcc: otro@ejemplo.test' } }));
    assert.equal(r.ok, false, campo);
  }
  assert.equal((await validarPedido(await pedido({ contacto: { ...contacto, telefono: '11 2154\n4111' } }))).ok, false);
  // Las notas sí aceptan saltos de línea
  const notas = await validarPedido(await pedido({ contacto: { ...contacto, medidasEspeciales: 'Línea 1\nLínea 2' } }));
  assert.equal(notas.ok, true);
  assert.equal((await validarPedido(await pedido({ contacto: { ...contacto, medidasEspeciales: 'raro\u0007' } }))).ok, false);
});

test('seguridad: sin links en lo que va al mail de confirmación', async () => {
  for (const nombre of ['Visitá https://phishing.example', 'Ana www.algo.com', 'http://x']) {
    assert.equal((await validarPedido(await pedido({ contacto: { ...contacto, nombre } }))).ok, false, nombre);
  }
  assert.equal((await validarPedido(await pedido({ contacto: { ...contacto, empresa: 'Fiambrería Don José S.R.L.' } }))).ok, true);
});

test('seguridad: el Reply-To a ventas no se puede manipular con el nombre', async () => {
  const { ventas } = await armarMails({
    ref: 'CLL-2026-0004', config: await configPorDefecto(), captura: null, destinos,
    contacto: { ...contacto, nombre: 'Ana <atacante@ejemplo.test>, Otro', email: 'ana@ejemplo.com' },
  });
  assert.deepEqual(ventas.replyTo, { name: 'Ana <atacante@ejemplo.test>, Otro', address: 'ana@ejemplo.com' });
  const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'cll-mails-'));
  process.env.MAIL_PROVEEDOR = 'prueba';
  process.env.MAIL_CARPETA_PRUEBA = carpeta;
  try {
    const { enviar } = require('../src/presupuestos/transportes');
    await enviar(ventas);
    const eml = fs.readFileSync(path.join(carpeta, fs.readdirSync(carpeta).find((a) => a.endsWith('.eml'))), 'utf8');
    const replyTo = eml.split(/\r?\n/).find((l) => l.startsWith('Reply-To:'));
    assert.ok(replyTo.includes('<ana@ejemplo.com>'));
    assert.ok(!/Reply-To:.*,\s*Otro\s*$/.test(replyTo) && (replyTo.match(/@/g) ?? []).length === 2); // una sola dirección (el @ del nombre va encomillado)
  } finally {
    fs.rmSync(carpeta, { recursive: true, force: true });
    delete process.env.MAIL_PROVEEDOR;
    delete process.env.MAIL_CARPETA_PRUEBA;
  }
});
