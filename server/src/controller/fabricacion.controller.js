const Producto = require('../models/producto.model');
const Galeria = require('../models/galeria.model');
const Imagen = require('../models/imagen.model');

const getDetalles = async (req, res) => {
  try {
    const productos = await Producto.find({}, { __v: 0 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los detalles" });
  }
};

const getProductImages = async (req, res) => {
  const { producto } = req.params;
  try {
    const entries = await Galeria.find(
      { categoria: producto },
      { __v: 0 }
    ).sort({ orden: 1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las imagenes" });
  }
};

const getImagenById = async (req, res) => {
  try {
    const imagen = await Imagen.findById(req.params.id);
    if (!imagen) return res.status(404).end();

    res.set({
      'Content-Type': imagen.mimetype,
      'Content-Length': imagen.data.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': req.params.id
    });
    res.send(imagen.data);
  } catch (error) {
    res.status(500).end();
  }
};

module.exports = { getDetalles, getProductImages, getImagenById };
