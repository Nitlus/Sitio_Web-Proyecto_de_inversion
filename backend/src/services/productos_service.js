const { Op, fn, col, literal } = require('sequelize');
const { Producto, Categoria, DetallePedido } = require('../config/db');

// NUEVO: Importamos nuestro servicio del dólar
const { obtenerCotizacionBlue } = require('./dolar_service'); 

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
		case 'mas_pedido':
			return [[literal('pedidos_realizados'), 'DESC'], ['id', 'ASC']];
		default:
			return [['id', 'ASC']];
	}
}

function esOrdenMasPedido(orden) {
	return String(orden || '').toLowerCase() === 'mas_pedido';
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

// NUEVO: Ahora recibe la cotización y hace la conversión matemática
function calcularPrecioFinal(precioUsd, cotizacion, metodoPago) {
	const precioArs = Number(precioUsd ?? 0) * cotizacion; // Pesificamos

	if (esTransferencia(metodoPago)) {
		return Number((precioArs * 0.85).toFixed(2)); // Aplica 15% OFF sobre el valor en pesos
	}

	return Number(precioArs.toFixed(2));
}

// NUEVO: Ahora recibe la cotización del dólar
function mapearProducto(producto, cotizacion, metodoPago) {
	const json = producto.toJSON();
	const precioListaArs = Number(json.precio ?? 0) * cotizacion;

	return {
		...json,
		precio_usd: Number(json.precio ?? 0), // Opcional: Le mandamos al front el valor original
		precio_lista: Number(precioListaArs.toFixed(2)), // Precio pesificado
		precio_final: calcularPrecioFinal(json.precio, cotizacion, metodoPago),
	};
}

async function listarProductos(filtros = {}) {
	const where = construirWhere(filtros);
	const idsCategorias = await obtenerIdsCategoriasFiltradas(filtros);
	const ordenarPorMasPedido = esOrdenMasPedido(filtros.orden);

	if (idsCategorias) {
		where.categoria_id = { [Op.in]: idsCategorias };
	}

	// NUEVO: Pedimos el dólar ANTES de buscar los productos (una sola vez)
	const cotizacionActual = await obtenerCotizacionBlue();

	const productos = await Producto.findAll({
		where,
		attributes: {
			include: ordenarPorMasPedido
				? [[fn('COUNT', col('detallesPedido.pedido_id')), 'pedidos_realizados']]
				: [],
		},
		include: [
			{ model: Categoria, as: 'categoria' },
			{ model: DetallePedido, as: 'detallesPedido', attributes: ordenarPorMasPedido ? [] : undefined },
		],
		group: ordenarPorMasPedido ? ['Producto.id'] : undefined,
		order: construirOrder(filtros.orden),
	});

	// NUEVO: Le pasamos la cotización al mapeador
	return productos.map((producto) => mapearProducto(producto, cotizacionActual, filtros.metodo_pago));
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

	// NUEVO: Pedimos el dólar y mapeamos
	const cotizacionActual = await obtenerCotizacionBlue();
	return mapearProducto(producto, cotizacionActual);
}

async function crearProducto(data) {
	return Producto.create({
		nombre: data.nombre,
		descripcion: data.descripcion ?? null,
		precio: data.precio, // Acá deberías guardar el precio en DÓLARES
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
		precio: data.precio ?? producto.precio, // Sigue siendo en USD
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
