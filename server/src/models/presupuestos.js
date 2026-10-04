// Pedidos de presupuesto del configurador (tablas en db/migrations/001_presupuestos.sql).
const db = require('../../db/db');

/** Formato de la referencia: CLL-2026-0001 (el número arranca en 1 cada año). */
const formatearRef = (anio, numero) => `CLL-${anio}-${String(numero).padStart(4, '0')}`;

const presupuestosModel = {

  formatearRef,

  // Próxima referencia del año. El contador se incrementa en una sola sentencia atómica
  // (LAST_INSERT_ID(expr) queda asociado a esta conexión), así dos pedidos simultáneos
  // nunca reciben el mismo número.
  siguienteRef: async (anio) => {
    const conexion = await db.getConnection();
    try {
      await conexion.query(
        `INSERT INTO presupuestos_contador (anio, ultimo) VALUES (?, LAST_INSERT_ID(1))
         ON DUPLICATE KEY UPDATE ultimo = LAST_INSERT_ID(ultimo + 1)`,
        [anio]
      );
      const [[{ numero }]] = await conexion.query('SELECT LAST_INSERT_ID() AS numero');
      return formatearRef(anio, numero);
    } finally {
      conexion.release();
    }
  },

  // Pedido igual (mismo email y misma configuración, sin contar los colores) en los últimos `dias` días:
  // { ref, colorFaldon, colorZocalo } con los colores con los que se pidió, o null.
  buscarRepetido: async (email, configHash, dias) => {
    const [filas] = await db.query(
      `SELECT ref, config_json->>'$.linea.colorFaldon' AS colorFaldon, config_json->>'$.linea.colorZocalo' AS colorZocalo
       FROM presupuestos
       WHERE email = ? AND config_hash = ? AND created_at >= NOW() - INTERVAL ? DAY
       ORDER BY created_at DESC LIMIT 1`,
      [email, configHash, dias]
    );
    const f = filas[0];
    return f ? { ref: f.ref, colorFaldon: f.colorFaldon ?? null, colorZocalo: f.colorZocalo ?? null } : null;
  },

  guardar: async (p) => {
    const [resultado] = await db.query(
      `INSERT INTO presupuestos
        (ref, producto, config_json, config_hash, version_catalogo, nombre, empresa, email, telefono,
         localidad, plazo, cuit, medidas_especiales, snapshot_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.ref, p.producto, JSON.stringify(p.config), p.configHash, p.versionCatalogo, p.nombre, p.empresa,
        p.email, p.telefono, p.localidad, p.plazo, p.cuit ?? null, p.medidasEspeciales ?? null, p.snapshotPath ?? null,
      ]
    );
    return resultado.insertId;
  },

  marcarEstado: async (id, estado) => {
    await db.query('UPDATE presupuestos SET estado = ? WHERE id = ?', [estado, id]);
  },

}

module.exports = presupuestosModel;
