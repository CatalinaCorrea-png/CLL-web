const express = require('express');
const router = express.Router();

// GET de TODO en FABRICACION
router.get('/fabricacion', fabricacion);
router.get('/fabricacion/:id', fabricacionCategoria);