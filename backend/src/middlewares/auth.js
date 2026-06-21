const jwt = require('jsonwebtoken');
const { Usuario } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'desarrollo-clave-secreta';

function crearUsuarioInvitado() {
	return {
		id: null,
		nombre: null,
		email: null,
		rol: 'cliente',
		es_invitado: 1,
		autenticado: false,
	};
}

function extraerToken(req) {
	const authorization = String(req.headers.authorization || '');
	if (!authorization.startsWith('Bearer ')) {
		return null;
	}

	return authorization.slice(7).trim() || null;
}

async function cargarUsuarioOpcional(req, res, next) {
	req.usuario = crearUsuarioInvitado();

	const token = extraerToken(req);
	if (!token) {
		return next();
	}

	try {
		const payload = jwt.verify(token, JWT_SECRET);
		const usuario = await Usuario.findByPk(payload.id);
		if (!usuario) {
			return res.status(401).json({ error: 'Token inválido' });
		}

		req.usuario = {
			id: usuario.id,
			nombre: usuario.nombre,
			email: usuario.email,
			rol: usuario.rol,
			es_invitado: Number(usuario.es_invitado),
			autenticado: true,
		};
		return next();
	} catch (error) {
		return res.status(401).json({ error: 'Token inválido o vencido' });
	}
}

function requiereAutenticacion(req, res, next) {
	if (!req.usuario || !req.usuario.autenticado) {
		return res.status(401).json({ error: 'Debés iniciar sesión' });
	}

	return next();
}

function requiereRol(...rolesPermitidos) {
	return (req, res, next) => {
		if (!req.usuario || !req.usuario.autenticado) {
			return res.status(401).json({ error: 'Debés iniciar sesión' });
		}

		if (!rolesPermitidos.includes(String(req.usuario.rol || '').toLowerCase())) {
			return res.status(403).json({ error: 'No tenés permisos para realizar esta acción' });
		}

		return next();
	};
}

module.exports = {
	cargarUsuarioOpcional,
	requiereAutenticacion,
	requiereRol,
	crearUsuarioInvitado,
};