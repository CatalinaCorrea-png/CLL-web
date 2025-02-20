const mongoose = require('mongoose')
require('dotenv').config()

const db = mongoose.connect(process.env.DB_URL)
.then(() => {
  console.log('Conectado a Mongodb')
})
.catch((error) => {
  console.error(error)
});

// const db = mongoose.connection
// db.on('error', (error) => console.error(error))
// db.once('open', () => console.log('Conectado a Mongodb'))

module.exports = db;