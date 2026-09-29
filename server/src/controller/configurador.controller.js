const configuradorModel = require('../models/configurador');

const getCatalogo = async (req, res) => {
  try {
    const catalogo = configuradorModel.getCatalogo();
    res.json(catalogo);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el catálogo" });
  }
};

module.exports = { getCatalogo }
