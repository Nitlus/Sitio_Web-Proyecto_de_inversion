const express = require('express');
const pedidosController = require('../controllers/pedidos_controller');
const { requiereRol, requiereAutenticacion } = require('../middlewares/auth');

const router = express.Router();

router.get('/', requiereRol('admin'), pedidosController.listarPedidos);
router.get('/mis-pedidos', requiereAutenticacion, requerirRolCliente, pedidosController.listarMisPedidos);
router.get('/:id', requiereRol('admin'), pedidosController.obtenerPedido);
router.post('/', pedidosController.crearPedido);
router.put('/:id', requiereRol('admin'), pedidosController.actualizarPedido);
router.delete('/:id', requiereRol('admin'), pedidosController.eliminarPedido);

module.exports = router;

function requerirRolCliente(req, res, next) {
	if (String(req.usuario?.rol || '').toLowerCase() !== 'cliente') {
		return res.status(403).json({ error: 'Solo los clientes pueden ver su historial' });
	}

	return next();
}
