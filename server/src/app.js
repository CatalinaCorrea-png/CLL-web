const express = require('express');
const cors = require('cors');   // importa CORS
const routes = require('./routes'); // importa las rutas

const app = express(); // inicializar la app

// Seguridad básica sin dependencias: no anunciar Express y cabeceras para respuestas JSON
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' });
  next();
});

// Detrás del proxy (Traefik en Dokploy): la IP real del cliente viene en X-Forwarded-For.
// La usa el límite de pedidos por IP de POST /presupuestos.
app.set('trust proxy', 1);

// Habilitar CORS para las solicitudes del front
// Sin CORS, el navegador bloquearía solicitudes a orígenes diferentes para proteger la seguridad del usuario.
// CORS_ORIGIN: orígenes permitidos separados por coma (p. ej. https://cllheladeras.cloud,https://www.cllheladeras.cloud).
// El preflight (OPTIONS) del POST con JSON también lo responde este middleware.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow non-browser requests (curl/postman/no Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(Object.assign(new Error(`CORS blocked for origin: ${origin}`), { status: 403 }));
  },
}));
// Middleware para parsear JSON (hasta ~100 kB). Estas rutas usan su propio parser, así que acá se saltean:
// POST /presupuestos (hasta 2 MB: la captura del 3D viaja en base64) y POST /eventos (texto de hasta 1 kB).
const RUTAS_CON_PARSER_PROPIO = ['/presupuestos', '/eventos'];
const parserJson = express.json();
app.use((req, res, next) => (RUTAS_CON_PARSER_PROPIO.includes(req.path) ? next() : parserJson(req, res, next)));
// Usar las rutas http definidas en routes > index.js
app.use('/', routes);

// Errores no manejados: CORS bloqueado (403) y el resto (500), siempre en JSON
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  if (error.status === 403) return res.status(403).json({ message: 'Origen no permitido.' });
  console.error(error);
  return res.status(error.status || 500).json({ message: 'Error del servidor.' });
});

module.exports = app; // exportar la configuracion de la app para lanzar en server.js
