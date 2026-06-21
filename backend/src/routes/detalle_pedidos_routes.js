const express = require('express');
const pedidosController = require('../controllers/pedidos_controller');
const { requiereRol } = require('../middlewares/auth');

const router = express.Router();

router.get('/pedido/:pedidoId', requiereRol('admin'), pedidosController.listarDetalles);
router.get('/:id', requiereRol('admin'), pedidosController.obtenerDetalle);
router.post('/', requiereRol('admin'), pedidosController.crearDetalle);
router.put('/:id', requiereRol('admin'), pedidosController.actualizarDetalle);
router.delete('/:id', requiereRol('admin'), pedidosController.eliminarDetalle);

module.exports = router;
