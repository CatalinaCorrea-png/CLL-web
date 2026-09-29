// Copia el modelo del configurador (catálogo, esquema y reglas) desde el client al server.
// La fuente es client/src/configurador/modelo/: se edita SOLO ahí y después se corre
//   npm run sync-modelo      (desde server/)
// La copia se commitea, porque la imagen Docker del server no ve la carpeta client/.
// El test test/modelo-sincronizado.test.js falla si las dos copias difieren.
const fs = require('fs');
const path = require('path');

const ORIGEN = path.join(__dirname, '../../client/src/configurador/modelo');
const DESTINO = path.join(__dirname, '../src/configurador/modelo');

// Archivos que se comparten (los tests se quedan en el client).
const ARCHIVOS = ['catalogo.json', 'esquema.js', 'reglas.js'];

if (!fs.existsSync(ORIGEN)) {
  console.error(`No se encontró el modelo en ${ORIGEN}`);
  process.exit(1);
}

fs.mkdirSync(DESTINO, { recursive: true });
for (const archivo of ARCHIVOS) {
  fs.copyFileSync(path.join(ORIGEN, archivo), path.join(DESTINO, archivo));
  console.log(`  copiado ${archivo}`);
}

// El server es CommonJS y estos archivos son ESM (import/export): este package.json
// hace que Node los trate como módulos ES dentro de esta carpeta.
fs.writeFileSync(
  path.join(DESTINO, 'package.json'),
  JSON.stringify({ type: 'module', description: 'Copia generada por npm run sync-modelo. No editar.' }, null, 2) + '\n'
);
console.log('Modelo sincronizado en src/configurador/modelo/');
