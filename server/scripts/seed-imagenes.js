require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Imagen = require('../src/models/imagen.model');
const Galeria = require('../src/models/galeria.model');
const Producto = require('../src/models/producto.model');

const MONGO_URL = process.env.MONGO_URL;
const CLIENT_PUBLIC = path.join(__dirname, '../../client/public');

// Data extraida de los SQL scripts (inserts activos, no comentados)
const galeriaData = {
  murales: [
    ['murales/arg/mural-1.jpg', 'murales/arg/mural-1-1.jpg'],
    ['murales/arg/mural-4.jpg', 'murales/arg/mural-4-1.jpg'],
    ['murales/arg/mural-2.jpg', 'murales/arg/mural-2-2.jpg'],
    ['murales/arg/mural-3-4.jpg', 'murales/arg/mural-3-2.jpg'],
    ['murales/ch/mural-5.jpg', 'murales/ch/mural-5-1.jpg'],
    ['murales/ch/mural-7.jpg', 'murales/ch/mural-7-1.jpg'],
    ['murales/arg/mural-5.jpg', 'murales/arg/mural-5-1.jpg'],
    ['murales/ch/mural-9-1.jpg', 'murales/ch/mural-9.jpg'],
    ['murales/arg/mural-7.jpg', 'murales/arg/mural-7-1.jpg'],
    ['murales/arg/mural-10-2.jpg', 'murales/ch/mural-12-1.jpg'],
    ['murales/ch/mural-13.jpg', 'murales/ch/mural-13-1.jpg'],
    ['murales/ch/mural-14.jpg', null],
    ['murales/ch/mural-16.jpg', 'murales/ch/mural-16-1.jpg'],
    ['murales/ch/mural-18.jpg', 'murales/ch/mural-18-1.jpg'],
    ['murales/ch/mural-19.jpg', 'murales/ch/mural-19-1.jpg'],
    ['murales/ch/mural-25.jpg', 'murales/ch/mural-25-1.jpg'],
    ['murales/ch/mural-23.jpg', 'murales/ch/mural-23-1.jpg'],
  ],
  bateas: [
    ['bateas/arg/batea.jpg', null],
    ['bateas/arg/batea-1.JPG', 'bateas/arg/batea-1-1.JPG'],
    ['bateas/ch/batea-3.jpg', 'bateas/ch/batea-3-1.jpg'],
    ['bateas/arg/batea-isla-1.jpg', null],
    ['bateas/arg/batea-3.jpg', 'bateas/arg/batea-3-1.jpg'],
    ['bateas/ch/batea-8.JPG', 'bateas/ch/batea-8-1.JPG'],
    ['bateas/arg/batea-isla-3.jpg', 'bateas/arg/batea-isla-3-2.jpg'],
    ['bateas/arg/batea-5.JPG', 'bateas/arg/batea-5-1.JPG'],
    ['bateas/arg/batea-6.JPG', 'bateas/arg/batea-6-1.JPG'],
    ['bateas/ch/batea-isla-2.JPG', 'bateas/ch/batea-isla-2-1.JPG'],
    ['bateas/arg/batea-isla-7.jpg', 'bateas/arg/batea-isla-7-1.jpg'],
    ['bateas/ch/batea-12.JPG', 'bateas/ch/batea-12-3.JPG'],
    ['bateas/ch/batea-recta-1.jpg', 'bateas/ch/batea-recta-1-3.jpg'],
    ['bateas/arg/batea-8.JPG', 'bateas/arg/batea-8-1.JPG'],
    ['bateas/arg/batea-9.JPG', null],
    ['bateas/ch/batea-18.JPG', null],
    ['bateas/arg/batea-10.jpg', 'bateas/arg/batea-10-1.jpg'],
    ['bateas/arg/batea-11.JPG', null],
    ['bateas/arg/batea-recta-1.jpg', 'bateas/arg/batea-recta-2.jpg'],
  ],
  exhibidoras: [
    ['exhibidoras/arg/exhibidora-1.jpg', null],
    ['exhibidoras/arg/exhibidora-2.jpg', null],
    ['exhibidoras/arg/exhibidora-3.jpg', null],
    ['exhibidoras/arg/exhibidora-4.jpg', null],
    ['exhibidoras/arg/exhibidora-5.jpg', null],
    ['exhibidoras/ch/exhibidora-5-1.jpg', 'exhibidoras/ch/exhibidora-5.jpg'],
    ['exhibidoras/ch/exhibidora-4.jpg', 'exhibidoras/ch/exhibidora-4-1.jpg'],
    ['exhibidoras/ch/exhibidora-3-1.jpg', null],
    ['exhibidoras/ch/exhibidora-6.jpg', null],
    ['exhibidoras/ch/exhibidora-1.jpg', null],
  ],
  camaras: [
    ['camaras/camara-1.JPG', null],
    ['camaras/camara-1-1.JPG', null],
    ['camaras/wic-1.JPG', null],
    ['camaras/wic-1-1.JPG', null],
    ['camaras/wic-1-2.JPG', null],
    ['camaras/wic-1-3.JPG', null],
  ],
  congelados: [
    ['congelados/DSCN3101.JPG', null],
    ['congelados/P1010061.JPG', null],
    ['congelados/P1010060.JPG', null],
  ],
};

// Detalles tecnicos (de cll.fabricacion.json)
const productosData = [
  {
    categoria: 'murales',
    detallesTecnicos: [
      'Exhibidoras MURALES para Media Temperatura Ensamblables.',
      'Exterior e interior en acero galvanizado electrolítico con pintura epoxi.',
      'Bandejas, estantes, ménsulas y cremalleras en acero galvanizado.',
      'Línea de iluminación superior LED.',
      'Estantes superiores y/o canastos regulables e inclinables (según modelo) con portaprecios y espejos (según modelo).',
      'Fondos perforados que aseguran óptima distribución del frío.',
      'Aislación: Poliuterano inyectado 40 Kg/m3.',
      'Evaporadores: Alto rendimiento. Frío Forzado.',
      'Termómetro luminoso digital',
      'Cortina protectora nocturna'
    ],
    detallesDiferenciales: [
      'Longitudes estándares: 0,90 - 1,20 - 1,50 - 1,80 - 2,00 - 2,40 - 3,00 - 3,60 (en mts.)',
      'Interior y estantes en acero inoxidable (opcional).',
      'Accesorios opcionales: divisores - barrales para blisters - bandejas escalonadas - complementos de estantes - etc.'
    ],
    colores: {
      plata: '#DEDEDE', oro: '#C4B98A', amarillo: '#FFCC00',
      verdeTel: '#EAFF66', verdeRal: '#4EA300', naranja: '#FF8800',
      rojo: '#FF0000', rojoBermellon: '#B80000', rosa: '#FFCFEB',
      magenta: '#FF37CD', lila: '#F7CFFF', violeta: '#7F0098',
      celeste: '#DCFFFE', azul: '#0082DD'
    }
  },
  {
    categoria: 'bateas',
    detallesTecnicos: [
      'Exhibidoras horizontales para Media Temperatura Ensambables',
      'Exterior e interior en acero galvanizado electrolítico.',
      'Brazos y soportes de cúpula en acero inoxidable.',
      'Cúpulas de vidrio curvo/recto',
      'Mesadas: Acero inoxidable/Mármol',
      'Aislación: Poliuterano inyectado 40 Kg/m3',
      'Evaporadores: Alto rendimiento. Frío Forzado./Frío Estático.',
      'Iluminación LED',
      'Bases galvanizadas con patas plásticas regulables.'
    ],
    detallesDiferenciales: [
      'Longitudes estándares: 0,90 - 1,20 - 1,50 - 1,80 - 2,00 - 2,40 - 3,00 - 3,60 (en mts.)',
      'En todos los modelos: Depósito refrigerado opcional.',
      'En todos los modelos: Equipo remoto o incorporado.',
      'En todos los modelos: Los rinconeros y esquineros son refrigerados.',
      'Para todos los modelos: MUEBLES SIMILES (A MEDIDA) CON IDÉNTICA ESTÉTICA.',
      'Exclusivo sistema de pintura epoxi con la más amplia gama de colores.'
    ],
    colores: {
      plata: '#DEDEDE', oro: '#C4B98A', amarillo: '#FFCC00',
      verdeTel: '#EAFF66', verdeRal: '#4EA300', naranja: '#FF8800',
      rojo: '#FF0000', rojoBermellon: '#B80000', rosa: '#FFCFEB',
      magenta: '#FF37CD', lila: '#F7CFFF', violeta: '#7F0098',
      celeste: '#DCFFFE', azul: '#0082DD'
    }
  }
];

function parsePath(relativePath) {
  const parts = relativePath.split('/');
  const nombre = parts[parts.length - 1];
  const categoria = parts[0];
  // Si tiene subcarpeta arg/ch es pais, sino es null
  const pais = parts.length === 3 ? parts[1] : null;
  return { categoria, pais, nombre };
}

function getMimetype(nombre) {
  const ext = nombre.toLowerCase().split('.').pop();
  const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  return map[ext] || 'image/jpeg';
}

function resolveFilePath(relativePath) {
  const original = path.join(CLIENT_PUBLIC, relativePath);
  if (fs.existsSync(original)) return original;

  // Intentar con .webp en lugar de .jpg/.JPG
  const webpPath = original.replace(/\.(jpg|jpeg|JPG|JPEG)$/i, '.webp');
  if (fs.existsSync(webpPath)) return webpPath;

  // Intentar en subcarpeta /jpg/ (donde estan los .jpg originales)
  const dir = path.dirname(original);
  const basename = path.basename(original);
  const jpgSubfolder = path.join(dir, 'jpg', basename);
  if (fs.existsSync(jpgSubfolder)) return jpgSubfolder;

  return null;
}

async function loadImagen(relativePath) {
  const { categoria, pais, nombre } = parsePath(relativePath);
  const filePath = resolveFilePath(relativePath);

  if (!filePath) {
    console.warn(`  SKIP (no existe): ${relativePath}`);
    return null;
  }

  const actualNombre = path.basename(filePath);
  const data = fs.readFileSync(filePath);
  const doc = await Imagen.create({
    categoria,
    pais,
    nombre: actualNombre,
    mimetype: getMimetype(actualNombre),
    data
  });
  return doc._id;
}

async function seed() {
  await mongoose.connect(MONGO_URL);
  console.log('Conectado a MongoDB para seed');

  // Limpiar colecciones
  await Imagen.deleteMany({});
  await Galeria.deleteMany({});
  await Producto.deleteMany({});
  console.log('Colecciones limpiadas');

  // Seed productos (detalles tecnicos)
  for (const prod of productosData) {
    await Producto.create(prod);
    console.log(`Producto: ${prod.categoria}`);
  }

  // Seed imagenes y galeria
  for (const [categoria, entries] of Object.entries(galeriaData)) {
    console.log(`\nCategoria: ${categoria} (${entries.length} entries)`);

    for (let i = 0; i < entries.length; i++) {
      const [path1, path2] = entries[i];

      const imagen1Id = await loadImagen(path1);
      if (!imagen1Id) continue;

      let imagen2Id = null;
      if (path2) {
        imagen2Id = await loadImagen(path2);
      }

      await Galeria.create({
        categoria,
        orden: i + 1,
        imagen1: imagen1Id,
        imagen2: imagen2Id
      });

      const label = path2 ? `${path1} + ${path2}` : path1;
      console.log(`  [${i + 1}] ${label}`);
    }
  }

  const totalImagenes = await Imagen.countDocuments();
  const totalGaleria = await Galeria.countDocuments();
  console.log(`\nSeed completo: ${totalImagenes} imagenes, ${totalGaleria} entradas de galeria`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
