const express = require('express');
const router = express.Router();
const { hola } = require('../models/index'); // Importo funciones http
const { getDetalles, getProductImages } = require('../controller/fabricacion.controller');
const { getCatalogo } = require('../controller/configurador.controller');
const { crearPresupuesto } = require('../controller/presupuestos.controller');
const { limitePresupuestos, jsonPresupuesto, erroresDelBody } = require('../presupuestos/limites');

router.get('/', hola);

// GET de DETALLES en FABRICACION
router.get('/fabricacion', getDetalles);
//GET de IMAGENES de PRODUCTOS
router.get('/fabricacion/imagenes/:producto', getProductImages); // ✅ Primero las rutas específicas

// GET del CATALOGO del configurador 3D (opciones, reglas y paletas)
router.get('/configurador/catalogo', getCatalogo);

// POST de un PEDIDO DE PRESUPUESTO del configurador: límite por IP, body de hasta 2 MB (captura en base64)
router.post('/presupuestos', limitePresupuestos, jsonPresupuesto, erroresDelBody, crearPresupuesto);


module.exports = router;