const mongoose = require('mongoose');

const coloresSchema = new mongoose.Schema({
  plata: String,
  oro: String,
  amarillo: String,
  verdeTel: String,
  verdeRal: String,
  naranja: String,
  rojo: String,
  rojoBermellon: String,
  rosa: String,
  magenta: String,
  lila: String,
  violeta: String,
  celeste: String,
  azul: String
});

const detallesSchema = new mongoose.Schema({
  detallesTecnicos: [String], 
  detallesDiferenciales: [mongoose.Schema.Types.Mixed] // Puede ser string o un objeto (colores)
});

const fabricacionSchema = new mongoose.Schema({
  nombre: String, // "murales" o "bateas"
  detalles: detallesSchema
});

// Crear el modelo
const Fabricacion = mongoose.model('Fabricacion', fabricacionSchema, 'fabricacion');

module.exports = Fabricacion;