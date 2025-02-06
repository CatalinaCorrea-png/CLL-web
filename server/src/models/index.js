const db = require('../../db/db'); // importo la database

const hola = (req, res) => {
  res.json({message: 'hola mundo'});
}

module.exports = { hola };