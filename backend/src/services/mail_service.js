require('dotenv').config(); // ✨ NUEVO: Carga las variables de entorno antes de ejecutar nada
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
        // ✨ MODIFICADO: Ahora lee EMAIL_FROM exactamente como lo escribiste en tu .env
        from: process.env.EMAIL_FROM || user,
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

async function enviarCorreoPedido({ destinatario, nombre, codigoPedido, pedido, esInvitado }) {
    const transportador = crearTransportador();
    const subject = `Confirmación de orden ${codigoPedido} - Titan Forge`;
    
    // Formateamos el total a Pesos Argentinos
    const totalFormateado = Number(pedido.total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

    // Armamos la lista de productos si vienen en los detalles
    let listaProductosHTML = '';
    if (pedido.detalles && pedido.detalles.length > 0) {
        listaProductosHTML = `
            <h3>Detalle de tu compra:</h3>
            <ul style="list-style: none; padding: 0;">
                ${pedido.detalles.map(item => {
                    const nombreProd = item.producto?.nombre || 'Hardware/Servicio';
                    const subtotal = (Number(item.precio_unitario) * Number(item.cantidad)).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
                    return `<li style="padding: 10px; border-bottom: 1px solid #eee;">
                        <strong>${item.cantidad}x</strong> ${nombreProd} - <strong>${subtotal}</strong>
                    </li>`;
                }).join('')}
            </ul>
        `;
    }

    // Agregamos instrucciones si el pago es por transferencia
    let instruccionesPagoHTML = '';
    if (String(pedido.metodo_pago).toLowerCase() === 'transferencia') {
        instruccionesPagoHTML = `
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #007bff;">Instrucciones para Transferencia</h3>
                <p>Por favor, transferí el total exacto de <strong>${totalFormateado}</strong> al siguiente CBU:</p>
                <ul>
                    <li><strong>Banco:</strong> Nación Argentina (BNA)</li>
                    <li><strong>CBU:</strong> 0110123456789012345678</li>
                    <li><strong>Alias:</strong> titan.forge.hardware</li>
                </ul>
                <p>Una vez realizada, envianos el comprobante a nuestro <a href="https://wa.me/5493512345678?text=Hola!%20Adjunto%20comprobante%20del%20pedido%20${codigoPedido}" style="color: #25d366; font-weight: bold;">WhatsApp</a>.</p>
            </div>
        `;
    }

    const texto = [
        `Hola ${nombre || 'Gamer'},`,
        '',
        `¡Gracias por elegir a Titan Forge! Hemos recibido tu pedido.`,
        `Código de pedido: ${codigoPedido}`,
        `Estado: ${pedido.estado || 'pendiente'}`,
        `Total a pagar: ${totalFormateado}`,
        '',
        esInvitado ? `Para consultar el estado de tu pedido en el futuro, ingresá a nuestra web y buscá por el código: ${codigoPedido}` : 'Podés revisar el avance de esta compra desde tu historial de pedidos en tu cuenta.',
        '',
        'El equipo de Titan Forge.',
    ].join('\n');

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                <h2 style="color: #4fd3ff; margin: 0; text-transform: uppercase;">Titan Forge</h2>
            </div>
            
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                <p>Hola <strong>${nombre || 'Gamer'}</strong>,</p>
                <p>¡Tu pedido fue registrado con éxito en nuestro sistema!</p>
                
                <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Código de Orden:</strong> <span style="color: #007bff; font-weight: bold; font-size: 1.1em;">${codigoPedido}</span></p>
                    <p style="margin: 5px 0;"><strong>Estado Actual:</strong> ${String(pedido.estado || 'Pendiente').toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Método de Envío/Retiro:</strong> <span style="text-transform: capitalize;">${pedido.metodo_envio || 'No especificado'}</span></p>
                    <p style="margin: 5px 0; font-size: 1.2em;"><strong>Total Final: <span style="color: #28a745;">${totalFormateado}</span></strong></p>
                </div>

                ${instruccionesPagoHTML}
                ${listaProductosHTML}

                <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
                    ${esInvitado ? `<em>Nota: Como compraste como invitado, recordá guardar el código <strong>${codigoPedido}</strong> para rastrear el envío desde nuestra página web.</em>` : '<em>Este pedido ya se encuentra anexado a tu historial de cuenta.</em>'}
                </p>
            </div>
        </div>
    `;

    if (!transportador) {
        console.warn(`SMTP no configurado. No se pudo enviar el correo a ${destinatario}.`);
        return { enviado: false, configurado: false };
    }

    const info = await transportador.sendMail({
        from: `"Titan Forge" <${obtenerConfiguracionSMTP().from}>`, // Muestra el nombre comercial
        to: destinatario,
        subject,
        text: texto, 
        html,
    });

    return { enviado: true, configurado: true, messageId: info.messageId };
}

module.exports = {
    enviarCorreoPedido,
};