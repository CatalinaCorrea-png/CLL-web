const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error MongoDB:', err));

module.exports = mongoose;
