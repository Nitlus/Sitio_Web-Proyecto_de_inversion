const { Categoria, Producto } = require('../config/db');

async function listarCategorias() {
	return Categoria.findAll({
		include: [
			{ model: Categoria, as: 'subcategorias' },
			{ model: Producto, as: 'productos' },
		],
		order: [['id', 'ASC']],
	});
}

async function obtenerCategoriaPorId(id) {
	return Categoria.findByPk(id, {
		include: [
			{ model: Categoria, as: 'subcategorias' },
			{ model: Categoria, as: 'categoriaPadre' },
			{ model: Producto, as: 'productos' },
		],
	});
}

async function crearCategoria(data) {
	return Categoria.create({
		nombre: data.nombre,
		parent_id: data.parent_id ?? null,
	});
}

async function actualizarCategoria(id, data) {
	const categoria = await Categoria.findByPk(id);
	if (!categoria) {
		return null;
	}

	await categoria.update({
		nombre: data.nombre ?? categoria.nombre,
		parent_id: data.parent_id ?? categoria.parent_id,
	});

	return categoria;
}

async function eliminarCategoria(id) {
	const categoria = await Categoria.findByPk(id);
	if (!categoria) {
		return false;
	}

	await categoria.destroy();
	return true;
}

module.exports = {
	listarCategorias,
	obtenerCategoriaPorId,
	crearCategoria,
	actualizarCategoria,
		eliminarCategoria,
};
