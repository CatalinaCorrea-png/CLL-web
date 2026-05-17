const express = require('express');
const router = express.Router();
const { hola } = require('../models/index');
const { getDetalles, getProductImages, getImagenById } = require('../controller/fabricacion.controller');

router.get('/', hola);

router.get('/fabricacion', getDetalles);
router.get('/fabricacion/imagenes/:producto', getProductImages);
router.get('/imagen/:id', getImagenById);

module.exports = router;
