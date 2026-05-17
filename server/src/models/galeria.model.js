const { Schema, model } = require('mongoose');

const galeriaSchema = new Schema({
  categoria: { type: String, required: true, index: true },
  orden: { type: Number, required: true },
  imagen1: { type: Schema.Types.ObjectId, ref: 'Imagen', required: true },
  imagen2: { type: Schema.Types.ObjectId, ref: 'Imagen', default: null }
});

module.exports = model('Galeria', galeriaSchema);
