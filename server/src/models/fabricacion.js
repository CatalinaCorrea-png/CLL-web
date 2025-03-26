// const db = require('../../db/mongodb'); // importo la database
const db = require('../../db/db'); // importo la database
const fabricacionJson = require('../../db/json/cll.fabricacion.json')

const fabricacionModel = {

  // Funcion que devuelve un json de los DETALLES TECNICOS
  getDetalles: () => {
    try {
      return fabricacionJson;
    } catch (error) {
      console.error("Error en la consulta:", error.message);
      throw error;  // Relanza el error para manejarlo otro nivel (en el controlador)
    }
  },

  // Función que devuelve las imagenes de un producto
  getProductImages: async (producto) => {
    const sqlQuery = "SELECT * FROM imagenesFabricacion WHERE producto = ?;"; // Consulta/Sentencia de SQL
    try {
      const [rows] = await db.query(sqlQuery, [producto]);
      return rows;
    } catch (error) {
      console.error("Error en la consulta:", error);
      throw error;  // Relanza el error para manejarlo otro nivel (en el controlador)
    }
  },

}



module.exports = fabricacionModel;