const productosService = require('../services/productos_service');

function responderError(res, error) {
	const status = error.status || 500;
	return res.status(status).json({ error: error.message || 'Error interno del servidor' });
}

async function listarProductos(req, res) {
	try {
		const productos = await productosService.listarProductos(req.query);
		return res.json(productos);
	} catch (error) {
		return responderError(res, error);
	}
}

async function obtenerProducto(req, res) {
	try {
		const producto = await productosService.obtenerProductoPorId(req.params.id);
		if (!producto) {
			return res.status(404).json({ error: 'Producto no encontrado' });
		}
		return res.json(producto);
	} catch (error) {
		return responderError(res, error);
	}
}

async function crearProducto(req, res) {
	try {
		const producto = await productosService.crearProducto(req.body);
		return res.status(201).json(producto);
	} catch (error) {
		return responderError(res, error);
	}
}

async function actualizarProducto(req, res) {
	try {
		const producto = await productosService.actualizarProducto(req.params.id, req.body);
		if (!producto) {
			return res.status(404).json({ error: 'Producto no encontrado' });
		}
		return res.json(producto);
	} catch (error) {
		return responderError(res, error);
	}
}

async function eliminarProducto(req, res) {
	try {
		const eliminado = await productosService.eliminarProducto(req.params.id);
		if (!eliminado) {
			return res.status(404).json({ error: 'Producto no encontrado' });
		}
		return res.status(204).send();
	} catch (error) {
		return responderError(res, error);
	}
}

module.exports = {
	listarProductos,
	obtenerProducto,
	crearProducto,
	actualizarProducto,
	eliminarProducto,
};
