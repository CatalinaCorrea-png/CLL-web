const db = require('../../db/mongodb'); // importo la database
// const Fabricacion = require('../models/fabricacion')
const fabricacionJson = require('../../db/cll.fabricacion.json')

const fabricacion = (req, res) => {
  try {
    // const fabricacion = await Fabricacion.find();
    res.status(200).json(fabricacionJson);
  } catch (error) {
    res.status(500).json({message: error.message });
  }
}

const fabricacionCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const fabricacion = await Fabricacion.findById(id);
    res.status(200).json(fabricacion);
  } catch (error) {
    res.status(500).json({message: error.message });
  }
}

module.exports = { fabricacion, fabricacionCategoria };
