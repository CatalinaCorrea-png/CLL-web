const express = require('express');
const router = express.Router();
const { hola } = require('../models/index'); // Importo funciones http

router.get('/', hola);

module.exports = router;