const bcrypt = require('bcryptjs');
const { Usuario, Pedido } = require('../config/db');

const SALT_ROUNDS = 10;
const ROLES = {
	ADMIN: 'admin',
	CLIENTE: 'cliente',
};

function normalizarEmail(email) {
	return String(email || '').trim().toLowerCase();
}

function sanitizarUsuario(usuario) {
	if (!usuario) {
		return null;
	}

	const json = typeof usuario.toJSON === 'function' ? usuario.toJSON() : { ...usuario };
	delete json.contraseña_hash;
	return json;
}

function validarRol(rol) {
	const rolNormalizado = String(rol || '').trim().toLowerCase();
	if (rolNormalizado === ROLES.ADMIN || rolNormalizado === ROLES.CLIENTE) {
		return rolNormalizado;
	}

	const error = new Error('Rol inválido');
	error.status = 400;
	throw error;
}

function prepararUsuario(data) {
	const usuario = {
		nombre: data.nombre,
		email: normalizarEmail(data.email),
		rol: validarRol(data.rol ?? ROLES.CLIENTE),
		es_invitado: data.es_invitado ?? 0,
	};

	if (data.contraseña_hash) {
		usuario.contraseña_hash = data.contraseña_hash;
	} else if (data.contraseña) {
		usuario.contraseña_hash = bcrypt.hashSync(String(data.contraseña), SALT_ROUNDS);
	}

	return usuario;
}

async function buscarUsuarioPorEmail(email) {
	return Usuario.findOne({
		where: {
			email: normalizarEmail(email),
		},
		include: [{ model: Pedido, as: 'pedidos' }],
	});
}

async function listarUsuarios() {
	const usuarios = await Usuario.findAll({
		where: {
			rol: ROLES.CLIENTE,
			es_invitado: 0,
		},
		order: [['id', 'ASC']],
	});

	return usuarios.map(sanitizarUsuario);
}

async function obtenerUsuarioPorId(id) {
	const usuario = await Usuario.findByPk(id, {
		include: [{ model: Pedido, as: 'pedidos' }],
	});

	return sanitizarUsuario(usuario);
}

async function crearUsuario(data) {
	const usuario = await Usuario.create(prepararUsuario(data));
	return sanitizarUsuario(usuario);
}

async function registrarCliente(data) {
	const email = normalizarEmail(data.email);
	if (!email || !data.contraseña) {
		const error = new Error('Email y contraseña son obligatorios');
		error.status = 400;
		throw error;
	}

	const usuarioExistente = await Usuario.findOne({
		where: { email },
	});

	if (usuarioExistente) {
		if (Number(usuarioExistente.es_invitado) === 1) {
			await usuarioExistente.update({
				nombre: data.nombre ?? usuarioExistente.nombre,
				email,
				contraseña_hash: bcrypt.hashSync(String(data.contraseña), SALT_ROUNDS),
				rol: ROLES.CLIENTE,
				es_invitado: 0,
			});

			return sanitizarUsuario(usuarioExistente);
		}

		const error = new Error('El email ya está registrado');
		error.status = 409;
		throw error;
	}

	const usuario = await Usuario.create({
		nombre: data.nombre,
		email,
		contraseña_hash: bcrypt.hashSync(String(data.contraseña), SALT_ROUNDS),
		rol: ROLES.CLIENTE,
		es_invitado: 0,
	});

	return sanitizarUsuario(usuario);
}

async function iniciarSesion(data) {
	const email = normalizarEmail(data.email);
	if (!email || !data.contraseña) {
		const error = new Error('Email y contraseña son obligatorios');
		error.status = 400;
		throw error;
	}

	const usuario = await Usuario.findOne({
		where: { email },
	});

	if (!usuario || !bcrypt.compareSync(String(data.contraseña), usuario.contraseña_hash)) {
		const error = new Error('Credenciales inválidas');
		error.status = 401;
		throw error;
	}

	return sanitizarUsuario(usuario);
}

async function actualizarUsuario(id, data) {
	const usuario = await Usuario.findByPk(id);
	if (!usuario) {
		return null;
	}

	const actualizacion = prepararUsuario({
		nombre: data.nombre ?? usuario.nombre,
		email: data.email ?? usuario.email,
		rol: data.rol ?? usuario.rol,
		es_invitado: data.es_invitado ?? usuario.es_invitado,
		contraseña: data.contraseña,
		contraseña_hash: data.contraseña_hash,
	});

	await usuario.update(actualizacion);
	return sanitizarUsuario(usuario);
}

async function eliminarUsuario(id) {
	const usuario = await Usuario.findByPk(id);
	if (!usuario) {
		return false;
	}

	await usuario.destroy();
	return true;
}

module.exports = {
	listarUsuarios,
	obtenerUsuarioPorId,
	crearUsuario,
	registrarCliente,
	iniciarSesion,
	actualizarUsuario,
	eliminarUsuario,
	sanitizarUsuario,
	buscarUsuarioPorEmail,
};
