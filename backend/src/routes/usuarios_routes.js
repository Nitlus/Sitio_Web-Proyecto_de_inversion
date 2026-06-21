const express = require('express');
const usuariosController = require('../controllers/usuarios_controller');
const { requiereRol } = require('../middlewares/auth');

const router = express.Router();

router.post('/registro', usuariosController.registrarCliente);
router.post('/login', usuariosController.iniciarSesion);
router.get('/', requiereRol('admin'), usuariosController.listarUsuarios);
router.get('/:id', requiereRol('admin'), usuariosController.obtenerUsuario);
router.post('/', requiereRol('admin'), usuariosController.crearUsuario);
router.put('/:id', requiereRol('admin'), usuariosController.actualizarUsuario);
router.delete('/:id', requiereRol('admin'), usuariosController.eliminarUsuario);

module.exports = router;
