// Eventos de analítica (tabla en db/migrations/002_eventos.sql).
const db = require('../../db/db');

const eventosModel = {

  registrar: async ({ evento, sesion = null, ref = null }) => {
    await db.query('INSERT INTO eventos (evento, sesion, ref) VALUES (?, ?, ?)', [evento, sesion, ref]);
  },

}

module.exports = eventosModel;
