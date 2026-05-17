const express = require('express');
const cors = require('cors');   // importa CORS
require('../db/mongodb');
const routes = require('./routes'); // importa las rutas

const app = express(); // inicializar la app

// Habilitar CORS para las solicitudes del front
// Sin CORS, el navegador bloquearía solicitudes a orígenes diferentes para proteger la seguridad del usuario.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow non-browser requests (curl/postman/no Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
// Middleware para parsear JSON
app.use(express.json());
// Usar las rutas http definidas en routes > index.js
app.use('/', routes);

module.exports = app; // exportar la configuracion de la app para lanzar en server.js