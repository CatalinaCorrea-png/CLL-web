// Falla si la copia del modelo en el server difiere de la fuente en el client.
// Si falla: correr `npm run sync-modelo` (desde server/) y commitear la copia.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ORIGEN = path.join(__dirname, '../../client/src/configurador/modelo');
const DESTINO = path.join(__dirname, '../src/configurador/modelo');
const ARCHIVOS = ['catalogo.json', 'esquema.js', 'reglas.js'];

test('la copia del modelo está sincronizada con el client', { skip: !fs.existsSync(ORIGEN) && 'no está la carpeta client/ (p. ej. en Docker)' }, () => {
  for (const archivo of ARCHIVOS) {
    const destino = path.join(DESTINO, archivo);
    assert.ok(fs.existsSync(destino), `Falta ${archivo} en el server. Correr npm run sync-modelo.`);
    assert.ok(
      fs.readFileSync(path.join(ORIGEN, archivo)).equals(fs.readFileSync(destino)),
      `${archivo} difiere entre client y server. Correr npm run sync-modelo.`
    );
  }
});

test('la copia del modelo carga en el server y valida la configuración por defecto', async () => {
  const catalogo = require('../src/configurador/modelo/catalogo.json');
  const { crearEsquema, configuracionPorDefecto } = await import('../src/configurador/modelo/esquema.js');
  assert.equal(crearEsquema(catalogo).safeParse(configuracionPorDefecto(catalogo)).success, true);
});
