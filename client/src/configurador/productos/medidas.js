// Medidas de la batea en metros (1 unidad de la escena = 1 m).
// Las de la especificación (docs/especificacion-batea.md) están confirmadas; el resto se estimó
// con las fotos de docs/referencias/ y está marcado como PROVISORIO: se ajustan solo acá.
export const MEDIDAS = {
  altoTotal: 1.25,             // especificación (lo usa la parte de arriba, 6.2)
  altoMesada: 0.90,            // especificación
  profundidad: 1.10,           // especificación
  altoPatas: 0.07,             // PROVISORIO: foto de frente
  altoZocalo: 0.30,            // PROVISORIO: tope del zócalo
  retiroZocaloFrente: 0.10,    // PROVISORIO: el zócalo queda metido hacia adentro
  retiroZocaloCostado: 0.06,   // PROVISORIO
  altoFranja: 0.42,            // PROVISORIO: tope de la franja pintada del frente
  altoRiel: 0.55,              // PROVISORIO: tope del riel frontal (~550 mm en la foto de frente, parece bajo)
  salienteRiel: 0.02,          // PROVISORIO: cuánto sobresale el riel del frente
  pisoExhibicion: 0.48,        // PROVISORIO: 7 cm por debajo del borde del riel
  anchoMesada: 0.30,           // PROVISORIO: franja angosta del lado del vendedor
  espesorMesada: 0.02,         // PROVISORIO
  espesorLateral: 0.05,        // PROVISORIO
  largoPanel: 0.6,             // PROVISORIO: largo de cada bandeja / rejilla (6 en 2 m en la foto de frente)
};
