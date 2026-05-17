const { Schema, model } = require('mongoose');

const productoSchema = new Schema({
  categoria: { type: String, required: true, unique: true },
  detallesTecnicos: [String],
  detallesDiferenciales: [Schema.Types.Mixed],
  colores: { type: Schema.Types.Mixed, default: null }
});

module.exports = model('Producto', productoSchema);
