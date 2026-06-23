const crypto = require('crypto');
const { sequelize, Pedido, DetallePedido, Usuario, Producto } = require('../config/db');
const { enviarCorreoPedido } = require('./mail_service');

const ESTADO_POR_DEFECTO = 'pendiente';
const ROL_CLIENTE = 'cliente';
const CARACTERES_CODIGO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const LONGITUD_CODIGO_PEDIDO = 5;

function aplicaDescuentoPago(metodoPago) {
    const metodoNormalizado = String(metodoPago || '').trim().toLowerCase();
    return metodoNormalizado === 'transferencia' || metodoNormalizado === 'efectivo';
}

function calcularPrecioAplicado(precio, metodoPago) {
    const precioBase = Number(precio ?? 0);
    if (aplicaDescuentoPago(metodoPago)) {
        return Number((precioBase * 0.85).toFixed(2));
    }

    return precioBase;
}

function normalizarDetalle(detalle) {
    return {
        producto_id: Number(detalle.producto_id),
        cantidad: Number(detalle.cantidad),
        precio_unitario: Number(detalle.precio_unitario),
    };
}

function generarCodigoAleatorio() {
	const bytes = crypto.randomBytes(LONGITUD_CODIGO_PEDIDO);
	let codigo = '';

	for (const byte of bytes) {
		codigo += CARACTERES_CODIGO[byte % CARACTERES_CODIGO.length];
	}

	return codigo;
}

async function generarCodigoPedido(transaction = null) {
	for (let intento = 0; intento < 10; intento += 1) {
		const codigo = generarCodigoAleatorio();
		const existente = await Pedido.findOne({
			where: { codigo },
			...(transaction ? { transaction } : {}),
		});

		if (!existente) {
			return codigo;
		}
	}

	const error = new Error('No se pudo generar un código único para el pedido');
	error.status = 500;
	throw error;
}

function obtenerDatosContactoPedido(data, usuarioContexto) {
	const emailContacto = String(data.email_contacto || data.email || usuarioContexto?.email || '').trim().toLowerCase();

	if (usuarioContexto?.autenticado) {
		if (!emailContacto) {
			const error = new Error('Para crear un pedido debés enviar email_contacto');
			error.status = 400;
			throw error;
		}

		return {
			nombre: usuarioContexto.nombre,
			email: emailContacto,
		};
	}

	const nombre = String(data.nombre || '').trim();

	if (!nombre || !emailContacto) {
		const error = new Error('Para crear un pedido como invitado debés enviar nombre y email_contacto');
		error.status = 400;
		throw error;
	}

	return { nombre, email: emailContacto };
}

async function validarDetallesPedido(detalles, transaction = null) {
	const detallesValidados = [];

	for (const detalle of detalles) {
		const producto = await Producto.findByPk(detalle.producto_id, transaction ? { transaction } : undefined);
		if (!producto) {
			const error = new Error('El producto no existe');
			error.status = 400;
			throw error;
		}

		detallesValidados.push({
			...normalizarDetalle(detalle),
			producto: producto.toJSON(),
		});
	}

	return detallesValidados;
}

function calcularTotalPedido({ detalles, costo_envio, total, metodo_pago }) {
	if (Array.isArray(detalles) && detalles.length > 0) {
		return detalles.reduce((acumulado, detalle) => {
			const cantidad = Number(detalle.cantidad ?? 0);
			const precioUnitario = calcularPrecioAplicado(detalle.precio_unitario, metodo_pago);
			return acumulado + cantidad * precioUnitario;
		}, Number(costo_envio ?? 0));
	}

	if (total !== undefined && total !== null) {
		return Number(total);
	}

	return Number(costo_envio ?? 0);
}

async function notificarPedido({ destinatario, nombre, codigoPedido, pedido, esInvitado }) {
	if (!destinatario) {
		return { enviado: false, configurado: false };
	}

	try {
		return await enviarCorreoPedido({
			destinatario,
			nombre,
			codigoPedido,
			pedido,
			esInvitado,
		});
	} catch (error) {
		console.warn(`No se pudo enviar el correo del pedido ${codigoPedido}:`, error.message);
		return { enviado: false, configurado: true, error: error.message };
	}
}

async function listarPedidos() {
	return Pedido.findAll({
		include: [
			{ model: Usuario, as: 'usuario' },
			{ model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
		],
		order: [['id', 'DESC']],
	});
}

async function listarPedidosPorUsuario(usuarioId) {
	return Pedido.findAll({
		where: { usuario_id: usuarioId },
		include: [
			{ model: Usuario, as: 'usuario' },
			{ model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
		],
		order: [['id', 'DESC']],
	});
}

async function obtenerPedidoPorId(id, options = {}) {
	const where = /^\d+$/.test(String(id)) ? { id } : { codigo: String(id).trim().toUpperCase() };

	return Pedido.findOne({
		where,
		include: [
			{ model: Usuario, as: 'usuario' },
			{ model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
		],
		...(options.transaction ? { transaction: options.transaction } : {}),
	});
}

// ✨ UNIFICADO: crearPedido ahora siempre persiste en la Base de Datos SQLite
async function crearPedido(data, usuarioContexto = null) {
	const contacto = obtenerDatosContactoPedido(data, usuarioContexto);
	const detallesValidados = await validarDetallesPedido(Array.isArray(data.detalles) ? data.detalles : []);

	return sequelize.transaction(async (transaction) => {
		const codigo = await generarCodigoPedido(transaction);
		
		let usuarioId = null;
		// Si es usuario registrado, validamos y asignamos su clave foránea
		if (usuarioContexto?.autenticado) {
			const usuario = await Usuario.findByPk(usuarioContexto.id, { transaction });
			if (!usuario) {
				const error = new Error('El usuario del pedido no existe');
				error.status = 400;
				throw error;
			}
			usuarioId = usuario.id;
		}

		// Se inserta en la tabla de Pedidos (usuario_id quedará null si es invitado)
		const pedido = await Pedido.create(
			{
				codigo,
				usuario_id: usuarioId,
				fecha: data.fecha,
				hora: data.hora,
				total: calcularTotalPedido({
					detalles: detallesValidados,
					costo_envio: data.costo_envio ?? 0,
					total: data.total,
					metodo_pago: data.metodo_pago,
				}),
				estado: data.estado ?? ESTADO_POR_DEFECTO,
				metodo_pago: data.metodo_pago,
				metodo_envio: data.metodo_envio,
				costo_envio: data.costo_envio ?? 0,
				direccion_envio: data.direccion_envio,
				telefono_contacto: data.telefono_contacto,
				email_contacto: contacto.email,
			},
			{ transaction }
		);

		// Guardamos la lista de hardware comprado vinculada al ID real generado
		if (detallesValidados.length > 0) {
			await DetallePedido.bulkCreate(
				detallesValidados.map((detalle) => ({
					pedido_id: pedido.id,
					...normalizarDetalle(detalle),
				})),
				{ transaction }
			);
		}

		const pedidoCompleto = await obtenerPedidoPorId(pedido.id, { transaction });
		
		// Despachamos la notificación automatizada de Nodemailer
		const notificacion = await notificarPedido({
			destinatario: contacto.email,
			nombre: contacto.nombre,
			codigoPedido: codigo,
			pedido: pedidoCompleto.toJSON ? pedidoCompleto.toJSON() : pedidoCompleto,
			esInvitado: !usuarioContexto?.autenticado,
		});

		const respuesta = pedidoCompleto.toJSON ? pedidoCompleto.toJSON() : pedidoCompleto;
		
		// Retornamos de forma consistente el ID e información de persistencia
		return {
			id: pedido.id,
			codigo,
			codigo_temporal: codigo,
			pedido: respuesta,
			email: notificacion,
		};
	});
}

async function actualizarPedido(id, data) {
	const pedido = await Pedido.findByPk(id);
	if (!pedido) {
		return null;
	}

	await pedido.update({
		codigo: data.codigo ?? pedido.codigo,
		usuario_id: Object.prototype.hasOwnProperty.call(data, 'usuario_id') ? data.usuario_id : pedido.usuario_id,
		fecha: data.fecha ?? pedido.fecha,
		hora: data.hora ?? pedido.hora,
		total: calcularTotalPedido({
			detalles: data.detalles,
			costo_envio: data.costo_envio ?? pedido.costo_envio,
			total: data.total ?? pedido.total,
			metodo_pago: data.metodo_pago ?? pedido.metodo_pago,
		}),
		estado: data.estado ?? pedido.estado,
		metodo_pago: data.metodo_pago ?? pedido.metodo_pago,
		metodo_envio: data.metodo_envio ?? pedido.metodo_envio,
		costo_envio: data.costo_envio ?? pedido.costo_envio,
		direccion_envio: data.direccion_envio ?? pedido.direccion_envio,
		telefono_contacto: data.telefono_contacto ?? pedido.telefono_contacto,
		email_contacto: data.email_contacto ?? data.email ?? pedido.email_contacto,
	});

	return obtenerPedidoPorId(id);
}

async function eliminarPedido(id) {
	const pedido = await Pedido.findByPk(id);
	if (!pedido) {
		return false;
	}

	await pedido.destroy();
	return true;
}

async function listarDetallesDePedido(pedidoId) {
	return DetallePedido.findAll({
		where: { pedido_id: pedidoId },
		include: [{ model: Producto, as: 'producto' }],
		order: [['id_detalle', 'ASC']],
	});
}

async function obtenerDetallePorId(id) {
	return DetallePedido.findByPk(id, {
		include: [{ model: Producto, as: 'producto' }],
	});
}

async function crearDetalle(data) {
	return sequelize.transaction(async (transaction) => {
		const pedido = await Pedido.findByPk(data.pedido_id, { transaction });
		if (!pedido) {
			const error = new Error('El pedido no existe');
			error.status = 400;
			throw error;
		}

		const producto = await Producto.findByPk(data.producto_id, { transaction });
		if (!producto) {
			const error = new Error('El producto no existe');
			error.status = 400;
			throw error;
		}

		const detalle = await DetallePedido.create(
			{
				pedido_id: data.pedido_id,
				producto_id: data.producto_id,
				cantidad: data.cantidad,
				precio_unitario: data.precio_unitario,
			},
			{ transaction }
		);

		return obtenerDetallePorId(detalle.id_detalle);
	});
}

async function actualizarDetalle(id, data) {
	const detalle = await DetallePedido.findByPk(id);
	if (!detalle) {
		return null;
	}

	await detalle.update({
		pedido_id: data.pedido_id ?? detalle.pedido_id,
		producto_id: data.producto_id ?? detalle.producto_id,
		cantidad: data.cantidad ?? detalle.cantidad,
		precio_unitario: data.precio_unitario ?? detalle.precio_unitario,
	});

	return obtenerDetallePorId(id);
}

async function eliminarDetalle(id) {
	const detalle = await DetallePedido.findByPk(id);
	if (!detalle) {
		return false;
	}

	await detalle.destroy();
	return true;
}

module.exports = {
	listarPedidos,
	listarPedidosPorUsuario,
	obtenerPedidoPorId,
	crearPedido,
	actualizarPedido,
	eliminarPedido,
	listarDetallesDePedido,
	obtenerDetallePorId,
	crearDetalle,
	actualizarDetalle,
	eliminarDetalle,
};
