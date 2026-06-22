const { Op } = require('sequelize');
const { Producto, Categoria, DetallePedido } = require('../config/db');

function construirOrder(orden) {
	switch (String(orden || '').toLowerCase()) {
		case 'precio_asc':
			return [['precio', 'ASC']];
		case 'precio_desc':
			return [['precio', 'DESC']];
		case 'alfabetico_az':
			return [['nombre', 'ASC']];
		case 'alfabetico_za':
			return [['nombre', 'DESC']];
		default:
			return [['id', 'ASC']];
	}
}

function construirWhere(filtros = {}) {
	const where = {};
	const nombre = String(filtros.nombre || '').trim();

	if (nombre) {
		where.nombre = { [Op.like]: `%${nombre}%` };
	}

	return where;
}

function normalizarSlug(valor) {
	return String(valor || '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, '-');
}

function buscarCategoriaPorSlug(categorias, slug, parentId = undefined) {
	const slugNormalizado = normalizarSlug(slug);

	return categorias.find((categoria) => {
		const coincideNombre = normalizarSlug(categoria.nombre) === slugNormalizado;
		const coincidePadre = parentId === undefined || categoria.parent_id === parentId;
		return coincideNombre && coincidePadre;
	});
}

function esDescendienteDe(categorias, categoriaId, parentId) {
	let categoriaActual = categorias.find((categoria) => categoria.id === categoriaId);

	while (categoriaActual && categoriaActual.parent_id !== null) {
		if (categoriaActual.parent_id === parentId) {
			return true;
		}

		categoriaActual = categorias.find((categoria) => categoria.id === categoriaActual.parent_id);
	}

	return false;
}

function buscarCategoriaDescendientePorSlug(categorias, slug, parentId) {
	const slugNormalizado = normalizarSlug(slug);

	return categorias.find((categoria) => {
		return normalizarSlug(categoria.nombre) === slugNormalizado && esDescendienteDe(categorias, categoria.id, parentId);
	});
}

function obtenerIdsConDescendientes(categorias, categoriaId) {
	const ids = [categoriaId];
	const pendientes = [categoriaId];

	while (pendientes.length > 0) {
		const idActual = pendientes.shift();
		const subcategorias = categorias.filter((categoria) => categoria.parent_id === idActual);

		for (const subcategoria of subcategorias) {
			ids.push(subcategoria.id);
			pendientes.push(subcategoria.id);
		}
	}

	return ids;
}

async function obtenerIdsCategoriasFiltradas(filtros = {}) {
	const categoriaSlug = String(filtros.categoria || '').trim();
	const subcategoriaSlug = String(filtros.subcategoria || '').trim();

	if (!categoriaSlug && !subcategoriaSlug) {
		return null;
	}

	const categorias = await Categoria.findAll({
		attributes: ['id', 'nombre', 'parent_id'],
		raw: true,
	});

	const categoriaPadre = categoriaSlug ? buscarCategoriaPorSlug(categorias, categoriaSlug, null) : null;

	if (categoriaSlug && !categoriaPadre) {
		return [];
	}

	if (subcategoriaSlug) {
		const subcategoria = categoriaPadre
			? buscarCategoriaDescendientePorSlug(categorias, subcategoriaSlug, categoriaPadre.id)
			: buscarCategoriaPorSlug(categorias, subcategoriaSlug);

		return subcategoria ? obtenerIdsConDescendientes(categorias, subcategoria.id) : [];
	}

	return obtenerIdsConDescendientes(categorias, categoriaPadre.id);
}

function esTransferencia(metodoPago) {
	return String(metodoPago || '').trim().toLowerCase() === 'transferencia';
}

function calcularPrecioFinal(precio, metodoPago) {
	const precioBase = Number(precio ?? 0);
	if (esTransferencia(metodoPago)) {
		return Number((precioBase * 0.85).toFixed(2));
	}

	return precioBase;
}

function mapearProducto(producto, metodoPago) {
	const json = producto.toJSON();
	return {
		...json,
		precio_lista: Number(json.precio ?? 0),
		precio_final: calcularPrecioFinal(json.precio, metodoPago),
	};
}

async function listarProductos(filtros = {}) {
	const where = construirWhere(filtros);
	const idsCategorias = await obtenerIdsCategoriasFiltradas(filtros);

	if (idsCategorias) {
		where.categoria_id = { [Op.in]: idsCategorias };
	}

	const productos = await Producto.findAll({
		where,
		include: [
			{ model: Categoria, as: 'categoria' },
			{ model: DetallePedido, as: 'detallesPedido' },
		],
		order: construirOrder(filtros.orden),
	});

	return productos.map((producto) => mapearProducto(producto, filtros.metodo_pago));
}

async function obtenerProductoPorId(id) {
	const producto = await Producto.findByPk(id, {
		include: [
			{ model: Categoria, as: 'categoria' },
			{ model: DetallePedido, as: 'detallesPedido' },
		],
	});

	if (!producto) {
		return null;
	}

	return mapearProducto(producto);
}

async function crearProducto(data) {
	return Producto.create({
		nombre: data.nombre,
		descripcion: data.descripcion ?? null,
		precio: data.precio,
		stock: data.stock ?? 0,
		tipo_producto: data.tipo_producto,
		condicion: data.condicion,
		categoria_id: data.categoria_id,
	});
}

async function actualizarProducto(id, data) {
	const producto = await Producto.findByPk(id);
	if (!producto) {
		return null;
	}

	await producto.update({
		nombre: data.nombre ?? producto.nombre,
		descripcion: data.descripcion ?? producto.descripcion,
		precio: data.precio ?? producto.precio,
		stock: data.stock ?? producto.stock,
		tipo_producto: data.tipo_producto ?? producto.tipo_producto,
		condicion: data.condicion ?? producto.condicion,
		categoria_id: data.categoria_id ?? producto.categoria_id,
	});

	return producto;
}

async function eliminarProducto(id) {
	const producto = await Producto.findByPk(id);
	if (!producto) {
		return false;
	}

	await producto.destroy();
	return true;
}

module.exports = {
	listarProductos,
	obtenerProductoPorId,
	crearProducto,
	actualizarProducto,
	eliminarProducto,
};
