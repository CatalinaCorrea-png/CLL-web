// Resumen de la analítica del configurador (tabla eventos):
//   npm run analitica          (últimos 30 días)
//   npm run analitica -- 90    (otro período, en días)
// En Dokploy: en la terminal del contenedor api.
require('dotenv').config();
const db = require('../db/db');

const EVENTOS = ['configurador_iniciado', 'configuracion_completa', 'presupuesto_enviado', 'whatsapp_click'];

const main = async () => {
  const dias = Number(process.argv[2] || 30);
  const [totales] = await db.query(
    `SELECT evento, COUNT(*) AS total, COUNT(DISTINCT sesion) AS sesiones
     FROM eventos WHERE created_at >= NOW() - INTERVAL ? DAY GROUP BY evento`,
    [dias]
  );
  const de = (e) => totales.find((t) => t.evento === e) ?? { total: 0, sesiones: 0 };

  console.log(`\nAnalítica del configurador · últimos ${dias} días\n`);
  console.table(EVENTOS.map((e) => ({ evento: e, total: Number(de(e).total), sesiones: Number(de(e).sesiones) })));

  const iniciados = Number(de('configurador_iniciado').sesiones);
  const pct = (n) => (iniciados ? `${((100 * n) / iniciados).toFixed(1)} %` : '–');
  console.log('Conversión (sobre las sesiones que abrieron el configurador):');
  console.log(`  armaron el equipo y abrieron "Pedir presupuesto": ${pct(Number(de('configuracion_completa').sesiones))}`);
  console.log(`  enviaron el pedido: ${pct(Number(de('presupuesto_enviado').total))}`);
  console.log(`  tocaron WhatsApp: ${pct(Number(de('whatsapp_click').sesiones))}\n`);

  const [porDia] = await db.query(
    `SELECT DATE(created_at) AS dia, evento, COUNT(*) AS total
     FROM eventos WHERE created_at >= NOW() - INTERVAL ? DAY
     GROUP BY dia, evento ORDER BY dia DESC, evento`,
    [dias]
  );
  if (porDia.length) {
    console.log('Por día:');
    console.table(porDia.map((f) => ({ dia: new Date(f.dia).toISOString().slice(0, 10), evento: f.evento, total: Number(f.total) })));
  }
};

main()
  .catch((error) => {
    console.error('Error:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
