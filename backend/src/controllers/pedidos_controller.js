const pedidosService = require('../services/pedidos_service');

function responderError(res, error) {
	const status = error.status || 500;
	return res.status(status).json({ error: error.message || 'Error interno del servidor' });
}

async function listarPedidos(req, res) {
	try {
		const pedidos = await pedidosService.listarPedidos();
		return res.json(pedidos);
	} catch (error) {
		return responderError(res, error);
	}
}

async function listarMisPedidos(req, res) {
	try {
		const pedidos = await pedidosService.listarPedidosPorUsuario(req.usuario.id);
		return res.json(pedidos);
	} catch (error) {
		return responderError(res, error);
	}
}

async function obtenerPedido(req, res) {
	try {
		const pedido = await pedidosService.obtenerPedidoPorId(req.params.id);
		if (!pedido) {
			return res.status(404).json({ error: 'Pedido no encontrado' });
		}
		return res.json(pedido);
	} catch (error) {
		return responderError(res, error);
	}
}

async function crearPedido(req, res) {
	try {
		if (req.usuario?.autenticado && String(req.usuario.rol || '').toLowerCase() !== 'cliente') {
			return res.status(403).json({ error: 'Solo los clientes pueden crear pedidos' });
		}

		const pedido = await pedidosService.crearPedido(req.body, req.usuario);
		return res.status(201).json(pedido);
	} catch (error) {
		return responderError(res, error);
	}
}

async function actualizarPedido(req, res) {
	try {
		const pedido = await pedidosService.actualizarPedido(req.params.id, req.body);
		if (!pedido) {
			return res.status(404).json({ error: 'Pedido no encontrado' });
		}
		return res.json(pedido);
	} catch (error) {
		return responderError(res, error);
	}
}

async function eliminarPedido(req, res) {
	try {
		const eliminado = await pedidosService.eliminarPedido(req.params.id);
		if (!eliminado) {
			return res.status(404).json({ error: 'Pedido no encontrado' });
		}
		return res.status(204).send();
	} catch (error) {
		return responderError(res, error);
	}
}

async function listarDetalles(req, res) {
	try {
		const detalles = await pedidosService.listarDetallesDePedido(req.params.pedidoId);
		return res.json(detalles);
	} catch (error) {
		return responderError(res, error);
	}
}

async function obtenerDetalle(req, res) {
	try {
		const detalle = await pedidosService.obtenerDetallePorId(req.params.id);
		if (!detalle) {
			return res.status(404).json({ error: 'Detalle no encontrado' });
		}
		return res.json(detalle);
	} catch (error) {
		return responderError(res, error);
	}
}

async function crearDetalle(req, res) {
	try {
		const detalle = await pedidosService.crearDetalle(req.body);
		return res.status(201).json(detalle);
	} catch (error) {
		return responderError(res, error);
	}
}

async function actualizarDetalle(req, res) {
	try {
		const detalle = await pedidosService.actualizarDetalle(req.params.id, req.body);
		if (!detalle) {
			return res.status(404).json({ error: 'Detalle no encontrado' });
		}
		return res.json(detalle);
	} catch (error) {
		return responderError(res, error);
	}
}

async function eliminarDetalle(req, res) {
	try {
		const eliminado = await pedidosService.eliminarDetalle(req.params.id);
		if (!eliminado) {
			return res.status(404).json({ error: 'Detalle no encontrado' });
		}
		return res.status(204).send();
	} catch (error) {
		return responderError(res, error);
	}
}

module.exports = {
	listarPedidos,
	listarMisPedidos,
	obtenerPedido,
	crearPedido,
	actualizarPedido,
	eliminarPedido,
	listarDetalles,
	obtenerDetalle,
	crearDetalle,
	actualizarDetalle,
	eliminarDetalle,
};
