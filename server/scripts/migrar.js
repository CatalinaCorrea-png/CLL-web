// Aplica las migraciones SQL de db/migrations/ que todavía no se aplicaron, en orden por nombre.
//   npm run migrar      (desde server/, o en la terminal del contenedor api en Dokploy)
// Lleva la cuenta en la tabla `migraciones`, así se puede correr las veces que haga falta.
// Las tablas de seed.sh (imagenesfabricacion) no se tocan.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const CARPETA = path.join(__dirname, '../db/migrations');

const migrar = async () => {
  // Conexión propia (no el pool de db/db.js): permite varias sentencias por archivo.
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });
  try {
    await conexion.query(`CREATE TABLE IF NOT EXISTS migraciones (
      nombre     VARCHAR(255) NOT NULL PRIMARY KEY,
      aplicada   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    const [filas] = await conexion.query('SELECT nombre FROM migraciones');
    const aplicadas = new Set(filas.map((f) => f.nombre));
    const pendientes = fs.readdirSync(CARPETA).filter((f) => f.endsWith('.sql')).sort().filter((f) => !aplicadas.has(f));

    if (pendientes.length === 0) {
      console.log('No hay migraciones pendientes.');
      return;
    }
    for (const archivo of pendientes) {
      const sql = fs.readFileSync(path.join(CARPETA, archivo), 'utf8');
      await conexion.query(sql);
      await conexion.query('INSERT INTO migraciones (nombre) VALUES (?)', [archivo]);
      console.log(`  aplicada ${archivo}`);
    }
    console.log(`Listo: ${pendientes.length} migración(es) aplicada(s).`);
  } finally {
    await conexion.end();
  }
};

migrar().catch((error) => {
  console.error('Error al migrar:', error.message);
  process.exit(1);
});
