// Medidas de la batea en metros (1 unidad de la escena = 1 m).
// Las de la especificación (docs/especificacion-batea.md) están confirmadas; el resto se estimó
// con las fotos de docs/referencias/ y está marcado como PROVISORIO: se ajustan solo acá.
export const MEDIDAS = {
  altoTotal: 1.25,             // especificación (lo usa la parte de arriba, 6.2)
  altoMesada: 0.90,            // especificación
  profundidad: 1.10,           // especificación
  altoPatas: 0.07,             // PROVISORIO: foto de frente
  altoZocalo: 0.40,            // PROVISORIO: tope del zócalo (04/10: de 300 a 400 mm para el depósito; lo confirma CLL)
  retiroZocaloFrente: 0.10,    // PROVISORIO: el zócalo queda metido hacia adentro
  retiroZocaloCostado: 0.06,   // PROVISORIO
  altoFranja: 0.52,            // PROVISORIO: tope del faldón (sube con el zócalo: 120 mm de franja)
  altoRiel: 0.65,              // PROVISORIO: tope del riel frontal (sube con el zócalo; el vidrio del frente queda más corto)
  salienteRiel: 0.02,          // PROVISORIO: cuánto sobresale el riel del frente
  pisoExhibicion: 0.58,        // PROVISORIO: 7 cm por debajo del borde del riel (respaldo interior: 320 mm hasta la mesada)
  anchoMesada: 0.30,           // PROVISORIO: franja angosta del lado del vendedor
  espesorMesada: 0.02,         // PROVISORIO
  espesorLateral: 0.05,        // PROVISORIO
  largoPanel: 0.6,             // PROVISORIO: largo de cada bandeja / rejilla (6 en 2 m en la foto de frente)

  // Parte de arriba (prompt 6.2)
  retiroVidrioFrente: -0.03,   // PROVISORIO: el vidrio del frente apoya 3 cm detrás de la cara del riel
  zTopeCurva: 0.05,            // PROVISORIO: dónde termina arriba la curva (cúpula curva y arcos)
  fondoTecho: -0.15,           // PROVISORIO: hasta dónde llega hacia atrás el techo (cúpula recta, marco)
  largoPano: 1.2,              // PROVISORIO: paños de vidrio (3 en ~3,6 m en la foto curva)
  pasoArcos: 1.0,              // especificación: un arco por punta y uno cada ~1 m (estructura curva)
  espesorVidrio: 0.008,        // PROVISORIO
  anchoArco: 0.03,             // PROVISORIO: arcos de aluminio (ancho en X y espesor del perfil)
  altoVidrioBajo: 0.18,        // PROVISORIO: vidrio bajo del frente (sin cúpula con iluminación)
  altoDeflector: 0.22,         // PROVISORIO: vidrio deflector (sin cúpula)
  inclinacionDeflector: 15,    // PROVISORIO: grados hacia adentro

  // Adicionales (prompt 6.3): no hay fotos, todo PROVISORIO
  anchoEquipo: 0.55,           // PROVISORIO: lugar para el equipo incorporado, en el costado derecho (+X)
  margenDeposito: 0.06,        // PROVISORIO: separación del depósito con el lateral y con el lugar del equipo
  anchoPuertaDeposito: 0.5,    // PROVISORIO: ancho aproximado de cada puerta batiente del depósito
  bajoDeposito: 0.02,          // PROVISORIO: las puertas del depósito (en el zócalo) arrancan esto por encima de las patas…
  topeDeposito: 0.02,          // PROVISORIO: …y terminan esto por debajo del tope del zócalo
  espesorPuerta: 0.012,        // PROVISORIO: cuánto sobresalen las puertas del respaldo trasero
  espesorAcrilico: 0.006,      // PROVISORIO: puertas traseras de acrílico

  // Esquinas (prompt 6b): la pieza ocupa un cuadrado de profundidad × profundidad (especificación)
  ochavado: 0.5,               // PROVISORIO: cuánto recorta el ochavado de 45° en cada lado del cuadrado
};
