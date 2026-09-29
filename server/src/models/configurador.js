// Catálogo del configurador: copia sincronizada desde el client (npm run sync-modelo).
const catalogoJson = require('../configurador/modelo/catalogo.json');

const configuradorModel = {

  // Función que devuelve el catálogo de productos del configurador (opciones, reglas y paletas)
  getCatalogo: () => {
    try {
      return catalogoJson;
    } catch (error) {
      console.error("Error al leer el catálogo:", error.message);
      throw error;  // Relanza el error para manejarlo en el controlador
    }
  },

}

module.exports = configuradorModel;
