const express = require('express');
const cors = require('cors');   // importa CORS
const routes = require('./routes'); // importa las rutas

const app = express(); // inicializar la app

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
// Middleware para parsear JSON (hasta ~100 kB). POST /presupuestos usa su propio parser de hasta 2 MB
// (la captura del 3D viaja en base64), así que acá se saltea.
const parserJson = express.json();
app.use((req, res, next) => (req.path === '/presupuestos' ? next() : parserJson(req, res, next)));
// Usar las rutas http definidas en routes > index.js
app.use('/', routes);

// Errores no manejados: CORS bloqueado (403) y el resto (500), siempre en JSON
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  if (error.status === 403) return res.status(403).json({ message: 'Origen no permitido.' });
  console.error(error);
  return res.status(error.status || 500).json({ message: 'Error del servidor.' });
});

module.exports = app; // exportar la configuracion de la app para lanzar en server.js
