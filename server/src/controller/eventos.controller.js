// POST /eventos: analítica básica del configurador (sin datos personales).
const eventosModel = require('../models/eventos');
const { validarEvento } = require('../presupuestos/eventos');

const registrarEvento = async (req, res) => {
  const r = validarEvento(req.body);
  if (!r.ok) return res.status(400).json({ message: 'Evento no válido.' });
  try {
    await eventosModel.registrar(r.evento);
  } catch (error) {
    console.error('[eventos] no se pudo registrar:', error.message); // la analítica nunca rompe nada
  }
  return res.status(204).end();
};

module.exports = { registrarEvento };
