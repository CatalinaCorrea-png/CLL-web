// Genera las imágenes de referencia del modo sin WebGL (public/bateas/configurador/<clave>.webp),
// sacándolas del propio configurador con Chrome headless. Correr cuando cambie la geometría:
//
//   npm run dev                  (en otra terminal; o pasar otra URL con BASE=http://...)
//   npm run capturas-respaldo
//
// Las claves tienen que coincidir con las de src/configurador/imagenesRespaldo.js.
// Chrome: se busca en las rutas habituales; si no, CHROME=/ruta/al/chrome.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configuracionPorDefecto } from '../src/configurador/modelo/esquema.js';
import { agregarBatea, cambiarUnion, normalizar } from '../src/configurador/modelo/edicion.js';
import { serializar } from '../src/configurador/modelo/url.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogo = JSON.parse(readFileSync(join(raiz, 'src/configurador/modelo/catalogo.json'), 'utf8'));
const BASE = process.env.BASE ?? 'http://localhost:5173';
const SALIDA = join(raiz, 'public/bateas/configurador');
const PUERTO = 9335;

// ------------------------------------------------------------------ configuraciones
/** Cambia opciones de un módulo y normaliza. */
const con = (config, indice, cambios) =>
  normalizar({ ...config, modulos: config.modulos.map((m, i) => (i === indice ? { ...m, ...cambios } : m)) }, catalogo);

const base = con(configuracionPorDefecto(catalogo), 1, { largo: 2400 });
/** Batea sola de 2,40 m con ese tipo de exhibición. */
const batea = (cupula, estructura) => con(base, 1, { cupula, ...(estructura ? { estructura } : {}) });
/** Dos bateas de 2 m unidas por una esquina con esa forma y versión. */
const esquina = (forma, version) => {
  const dos = agregarBatea(con(base, 1, { largo: 2000 }), catalogo); // remate, batea, esquina, batea, remate
  return con(dos, 2, { forma, version });
};
const conMostrador = () => {
  const dos = agregarBatea(con(base, 1, { largo: 2000 }), catalogo);
  return cambiarUnion(dos, catalogo, 2, 'mostrador');
};
const conRemates = () => con(con(base, 0, { valor: 'mostrador' }), 2, { valor: 'mostrador' });

// Giro de cámara (px de arrastre horizontal) para que se vea la pieza: el esquinero tiene el frente
// por fuera de la L, así que se mira desde ese lado.
const GIRO = { esquinero_frio: -340, esquinero_mostrador: -340 };

const CASOS = {
  cupula_curva: batea('cupula_curva'),
  cupula_recta: batea('cupula_recta'),
  sin_cupula: batea('sin_cupula'),
  iluminacion_curva: batea('sin_cupula_iluminacion', 'curva'),
  iluminacion_recta: batea('sin_cupula_iluminacion', 'recta'),
  esquinero_frio: esquina('esquinero', 'frio'),
  esquinero_mostrador: esquina('esquinero', 'mostrador'),
  rinconero_frio: esquina('rinconero', 'frio'),
  rinconero_mostrador: esquina('rinconero', 'mostrador'),
  mostrador: conMostrador(),
  remate: conRemates(),
};

// ------------------------------------------------------------------ Chrome
const RUTAS_CHROME = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const rutaChrome = RUTAS_CHROME.find((r) => existsSync(r));
if (!rutaChrome) throw new Error('No encontré Chrome: pasá la ruta con CHROME=...');

const perfil = mkdtempSync(join(tmpdir(), 'cll-capturas-'));
const chrome = spawn(rutaChrome, [
  // Con la GPU, así la escena se ve en calidad alta (por software el configurador baja la calidad)
  '--headless=new', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars',
  `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`, 'about:blank',
], { stdio: 'ignore' });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let targets;
  for (let i = 0; i < 50 && !targets; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json(); } catch { await esperar(200); }
  }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const pendientes = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m); pendientes.delete(m.id); }
  });
  const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; pendientes.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (x) => (await cmd('Runtime.evaluate', { expression: x, returnByValue: true })).result.result.value;

  await cmd('Page.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: 1300, height: 950, deviceScaleFactor: 1, mobile: false });
  mkdirSync(SALIDA, { recursive: true });

  let primera = true;
  for (const [clave, config] of Object.entries(CASOS)) {
    const { v, l, m } = serializar(config, catalogo);
    await cmd('Page.navigate', { url: `${BASE}/planificacion?producto=bateas&v=${v}&l=${l}&m=${m}&sinCotas` });
    await esperar(primera ? 12000 : 7000); // carga + medición de calidad + reencuadre
    primera = false;
    // Sin los controles del visor ni el aviso de calidad
    await ev(`document.querySelectorAll('.cfg-controles-visor, .cfg-calidad').forEach((e) => e.remove())`);
    const c = await ev(`(() => { const r = document.querySelector('.cfg-visor canvas').getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; })()`);
    if (GIRO[clave]) {
      // Arrastre sobre el canvas: OrbitControls gira la cámara
      // Los eventos de mouse van en coordenadas de la ventana (sin el scroll de la página)
      const scroll = await ev('[scrollX, scrollY]');
      const x0 = c.x - scroll[0] + c.width / 2, y0 = c.y - scroll[1] + c.height / 2;
      await cmd('Input.dispatchMouseEvent', { type: 'mousePressed', x: x0, y: y0, button: 'left', clickCount: 1 });
      for (let i = 1; i <= 20; i++) await cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + (GIRO[clave] * i) / 20, y: y0, button: 'left', buttons: 1 });
      await cmd('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x0 + GIRO[clave], y: y0, button: 'left', clickCount: 1 });
    }
    await esperar(1500);
    // Franja central del canvas (arriba sobra cielo y abajo piso)
    const r = { x: c.x, y: c.y + c.height * 0.3, width: c.width, height: c.height * 0.58 };
    const foto = await cmd('Page.captureScreenshot', { format: 'webp', quality: 82, clip: { ...r, scale: 1 } });
    writeFileSync(join(SALIDA, `${clave}.webp`), Buffer.from(foto.result.data, 'base64'));
    console.log(`${clave}.webp`);
  }
  ws.close();
} finally {
  chrome.kill();
  await esperar(500);
  rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
