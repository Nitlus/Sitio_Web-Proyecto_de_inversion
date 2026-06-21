const categoriasService = require('../services/categorias_service');

function responderError(res, error) {
	const status = error.status || 500;
	return res.status(status).json({ error: error.message || 'Error interno del servidor' });
}

async function listarCategorias(req, res) {
	try {
		const categorias = await categoriasService.listarCategorias();
		return res.json(categorias);
	} catch (error) {
		return responderError(res, error);
	}
}

async function obtenerCategoria(req, res) {
	try {
		const categoria = await categoriasService.obtenerCategoriaPorId(req.params.id);
		if (!categoria) {
			return res.status(404).json({ error: 'Categoria no encontrada' });
		}
		return res.json(categoria);
	} catch (error) {
		return responderError(res, error);
	}
}

async function crearCategoria(req, res) {
	try {
		const categoria = await categoriasService.crearCategoria(req.body);
		return res.status(201).json(categoria);
	} catch (error) {
		return responderError(res, error);
	}
}

async function actualizarCategoria(req, res) {
	try {
		const categoria = await categoriasService.actualizarCategoria(req.params.id, req.body);
		if (!categoria) {
			return res.status(404).json({ error: 'Categoria no encontrada' });
		}
		return res.json(categoria);
	} catch (error) {
		return responderError(res, error);
	}
}

async function eliminarCategoria(req, res) {
	try {
		const eliminado = await categoriasService.eliminarCategoria(req.params.id);
		if (!eliminado) {
			return res.status(404).json({ error: 'Categoria no encontrada' });
		}
		return res.status(204).send();
	} catch (error) {
		return responderError(res, error);
	}
}

module.exports = {
	listarCategorias,
	obtenerCategoria,
	crearCategoria,
	actualizarCategoria,
	eliminarCategoria,
};
