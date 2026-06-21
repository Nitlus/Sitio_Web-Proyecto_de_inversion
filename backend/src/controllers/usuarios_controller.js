const usuariosService = require('../services/usuarios_service');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'desarrollo-clave-secreta';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function responderError(res, error) {
	const status = error.status || 500;
	return res.status(status).json({ error: error.message || 'Error interno del servidor' });
}

function firmarToken(usuario) {
	return jwt.sign(
		{
			id: usuario.id,
			email: usuario.email,
			rol: usuario.rol,
			es_invitado: usuario.es_invitado,
		},
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);
}

async function listarUsuarios(req, res) {
	try {
		const usuarios = await usuariosService.listarUsuarios();
		return res.json(usuarios);
	} catch (error) {
		return responderError(res, error);
	}
}

async function obtenerUsuario(req, res) {
	try {
		const usuario = await usuariosService.obtenerUsuarioPorId(req.params.id);
		if (!usuario) {
			return res.status(404).json({ error: 'Usuario no encontrado' });
		}
		return res.json(usuario);
	} catch (error) {
		return responderError(res, error);
	}
}

async function crearUsuario(req, res) {
	try {
		const usuario = await usuariosService.crearUsuario(req.body);
		return res.status(201).json(usuario);
	} catch (error) {
		return responderError(res, error);
	}
}

async function registrarCliente(req, res) {
	try {
		const usuario = await usuariosService.registrarCliente(req.body);
		return res.status(201).json({
			usuario,
			token: firmarToken(usuario),
		});
	} catch (error) {
		return responderError(res, error);
	}
}

async function iniciarSesion(req, res) {
	try {
		const usuario = await usuariosService.iniciarSesion(req.body);
		return res.json({
			usuario,
			token: firmarToken(usuario),
		});
	} catch (error) {
		return responderError(res, error);
	}
}

async function actualizarUsuario(req, res) {
	try {
		const usuario = await usuariosService.actualizarUsuario(req.params.id, req.body);
		if (!usuario) {
			return res.status(404).json({ error: 'Usuario no encontrado' });
		}
		return res.json(usuario);
	} catch (error) {
		return responderError(res, error);
	}
}

async function eliminarUsuario(req, res) {
	try {
		const eliminado = await usuariosService.eliminarUsuario(req.params.id);
		if (!eliminado) {
			return res.status(404).json({ error: 'Usuario no encontrado' });
		}
		return res.status(204).send();
	} catch (error) {
		return responderError(res, error);
	}
}

module.exports = {
	listarUsuarios,
	obtenerUsuario,
	crearUsuario,
	registrarCliente,
	iniciarSesion,
	actualizarUsuario,
	eliminarUsuario,
};
