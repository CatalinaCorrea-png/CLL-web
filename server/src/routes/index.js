const express = require('express');
const router = express.Router();
const { hola } = require('../models/index'); // Importo funciones http
const { fabricacion, fabricacionCategoria } = require('../controller/fabricacion.controller');

router.get('/', hola);

// GET de TODO en FABRICACION
router.get('/fabricacion', fabricacion);
router.get('/fabricacion/:id', fabricacionCategoria);


module.exports = router;