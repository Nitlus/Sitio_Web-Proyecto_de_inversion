const express = require('express');
const productosController = require('../controllers/productos_controller');
const { requiereRol } = require('../middlewares/auth');

const router = express.Router();

router.get('/', productosController.listarProductos);
router.get('/:id', productosController.obtenerProducto);
router.post('/', requiereRol('admin'), productosController.crearProducto);
router.put('/:id', requiereRol('admin'), productosController.actualizarProducto);
router.delete('/:id', requiereRol('admin'), productosController.eliminarProducto);

module.exports = router;
