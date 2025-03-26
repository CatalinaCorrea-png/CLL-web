const fabricacionModel = require('../models/fabricacion');

const getDetalles = async (req, res) => {
  try {
    const detalles = fabricacionModel.getDetalles();
    res.json(detalles);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los detalles" });
  }
};

const getProductImages = async (req, res) => {
  const { producto } = req.params
  try {
    const imagenes = await fabricacionModel.getProductImages(producto);
    res.json(imagenes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las imagenes" });
  }
}


module.exports = { getDetalles, getProductImages }
