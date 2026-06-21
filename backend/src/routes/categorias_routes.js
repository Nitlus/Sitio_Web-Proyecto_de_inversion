const express = require('express');
const categoriasController = require('../controllers/categorias_controller');
const { requiereRol } = require('../middlewares/auth');

const router = express.Router();

router.get('/', categoriasController.listarCategorias);
router.get('/:id', categoriasController.obtenerCategoria);
router.post('/', requiereRol('admin'), categoriasController.crearCategoria);
router.put('/:id', requiereRol('admin'), categoriasController.actualizarCategoria);
router.delete('/:id', requiereRol('admin'), categoriasController.eliminarCategoria);

module.exports = router;
