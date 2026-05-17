const { Schema, model } = require('mongoose');

const imagenSchema = new Schema({
  categoria: { type: String, required: true, index: true },
  pais: { type: String, default: null },
  nombre: { type: String, required: true },
  mimetype: { type: String, default: 'image/jpeg' },
  data: { type: Buffer, required: true }
}, { timestamps: true });

module.exports = model('Imagen', imagenSchema);
