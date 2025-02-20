// const db = require('../../db/mongodb'); // importo la database
// const Fabricacion = require('../../db/fabricacion')

const hola = (req, res) => {
  res.json({message: 'models/index.js'});
}

module.exports = { hola };