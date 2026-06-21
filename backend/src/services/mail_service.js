const nodemailer = require('nodemailer');

function obtenerConfiguracionSMTP() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 587);
	const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!host || !user || !pass) {
		return null;
	}

	return {
		host,
		port,
		secure,
		user,
		pass,
		from: process.env.SMTP_FROM || user,
	};
}

function crearTransportador() {
	const config = obtenerConfiguracionSMTP();
	if (!config) {
		return null;
	}

	return nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: config.secure,
		auth: {
			user: config.user,
			pass: config.pass,
		},
	});
}

async function enviarCorreoPedido({ destinatario, nombre, codigoTemporal, pedido, esInvitado }) {
	const transportador = crearTransportador();
	const subject = `Confirmación de pedido ${codigoTemporal}`;
	const lineaPedido = `${pedido.estado || 'pendiente'} - ${pedido.metodo_pago || 'sin método de pago'} - Total: ${pedido.total}`;
	const texto = [
		`Hola ${nombre || 'cliente'},`,
		'',
		`Tu pedido fue recibido correctamente.`,
		`Código temporal: ${codigoTemporal}`,
		`Estado: ${pedido.estado || 'pendiente'}`,
		`Total: ${pedido.total}`,
		esInvitado ? 'Este pedido es temporal y no fue guardado en la base de datos.' : 'Este pedido quedó registrado en tu historial.',
		'',
		'Gracias por tu compra.',
	].join('\n');

	const html = `
		<p>Hola <strong>${nombre || 'cliente'}</strong>,</p>
		<p>Tu pedido fue recibido correctamente.</p>
		<ul>
			<li><strong>Código temporal:</strong> ${codigoTemporal}</li>
			<li><strong>Estado:</strong> ${pedido.estado || 'pendiente'}</li>
			<li><strong>Total:</strong> ${pedido.total}</li>
			<li><strong>Detalle:</strong> ${lineaPedido}</li>
		</ul>
		<p>${esInvitado ? 'Este pedido es temporal y no fue guardado en la base de datos.' : 'Este pedido quedó registrado en tu historial.'}</p>
		<p>Gracias por tu compra.</p>
	`;

	if (!transportador) {
		console.warn(`SMTP no configurado. No se pudo enviar el correo a ${destinatario}.`);
		return { enviado: false, configurado: false };
	}

	const info = await transportador.sendMail({
		from: obtenerConfiguracionSMTP().from,
		to: destinatario,
		subject,
		text,
		html,
	});

	return { enviado: true, configurado: true, messageId: info.messageId };
}

module.exports = {
	enviarCorreoPedido,
};