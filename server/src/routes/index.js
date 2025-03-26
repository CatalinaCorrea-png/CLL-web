const express = require('express');
const router = express.Router();
const { hola } = require('../models/index'); // Importo funciones http
const { getDetalles, getProductImages } = require('../controller/fabricacion.controller');

router.get('/', hola);

// GET de DETALLES en FABRICACION
router.get('/fabricacion', getDetalles);
//GET de IMAGENES de PRODUCTOS
router.get('/fabricacion/imagenes/:producto', getProductImages); // ✅ Primero las rutas específicas


module.exports = router;