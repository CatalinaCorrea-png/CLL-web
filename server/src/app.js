const express = require('express');
const cors = require('cors');   // importa CORS
const routes = require('./routes'); // importa las rutas

const app = express(); // inicializar la app

// Habilitar CORS para todas las solicitudes
// Sin CORS, el navegador bloquearía solicitudes a orígenes diferentes para proteger la seguridad del usuario.
// Es decir, es necesario para probar en este escenario, desde local.
app.use(cors());
// Middleware para parsear JSON
app.use(express.json());
// Usar las rutas http definidas en routes > index.js
app.use('/', routes);

module.exports = app; // exportar la configuracion de la app para lanzar en server.js