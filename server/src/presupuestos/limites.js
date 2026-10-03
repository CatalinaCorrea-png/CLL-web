// Middlewares de POST /presupuestos: límite de pedidos por IP y body de hasta 2 MB (la captura viaja en base64).
const express = require('express');
const { rateLimit } = require('express-rate-limit');

// 5 pedidos cada 15 minutos por IP. Detrás de Traefik la IP real sale de X-Forwarded-For
// (app.set('trust proxy', 1) en app.js).
const limitePresupuestos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.PRESUPUESTOS_LIMITE || 5),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Recibimos varios pedidos seguidos desde tu conexión. Esperá unos minutos y volvé a intentar, o escribinos por WhatsApp.' },
});

const jsonPresupuesto = express.json({ limit: '2mb' });

// POST /eventos (analítica): 60 cada 15 minutos por IP, y el body como texto de hasta 1 kB
// (navigator.sendBeacon lo manda como text/plain para no disparar el preflight de CORS).
const limiteEventos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.EVENTOS_LIMITE || 60),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Demasiados eventos.' },
});
const textoEvento = express.text({ type: '*/*', limit: '1kb' });
const erroresDelEvento = (error, req, res, next) => (error.type ? res.status(400).json({ message: 'Evento no válido.' }) : next(error));

/** Errores del parser (body muy grande o JSON roto) → respuesta en español. */
const erroresDelBody = (error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'El pedido es demasiado grande (la captura no puede pasar de 2 MB).' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El pedido no tiene un formato válido.' });
  }
  return next(error);
};

module.exports = { limitePresupuestos, jsonPresupuesto, erroresDelBody, limiteEventos, textoEvento, erroresDelEvento };
