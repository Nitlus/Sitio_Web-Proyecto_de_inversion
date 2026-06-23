import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/DetallePedido.css';

function DetallePedido() {
  const { id } = useParams(); // Atrapamos el ID del pedido desde la URL (/pedido/:id)
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let estaMontado = true;

    const obtenerInformacionPedido = async () => {
      try {
        const respuesta = await fetch(`https://unclog-playmate-slush.ngrok-free.dev/api/pedidos/${id}`, {
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
            'ngrok-skip-browser-warning': 'true' // ✨ Esto evita que la página se quede pensando
          }
        });
        if (!respuesta.ok) throw new Error("No se pudo recuperar la orden");
        
        const datos = await respuesta.json();
        
        if (estaMontado) {
          setPedido(datos);
          setCargando(false);
        }
      } catch (err) {
        console.error("Error cargando tracking:", err);
        if (estaMontado) setCargando(false);
      }
    };

    obtenerInformacionPedido();

    return () => {
      estaMontado = false;
    };
  }, [id]);

  if (cargando) {
    return <div className="tracking-loading">Sincronizando hoja de ruta del pedido con el depósito...</div>;
  }

  if (!pedido) {
    return (
      <div className="tracking-error-caja">
        <h2>⚠️ Código de orden inválido o vencido</h2>
        <p>Revisá el código de pedido que te enviamos por correo o consultá tu historial si estás logueado.</p>
        <Link to="/" className="btn-volver-home">Ir al Inicio</Link>
      </div>
    );
  }

  const codigoPedido = pedido.codigo || pedido.codigo_temporal || pedido.codigoTemporal || `#${pedido.id}`;
  const itemsPedido = pedido.detalles || pedido.items || [];

  // Lógica comercial de renderizado de instrucciones según el estado
  const obtenerInstruccionesEstado = () => {
    const estado = pedido.estado || 'pendiente';

    if (estado.toLowerCase() === 'pendiente_de_pago' || estado.toLowerCase() === 'pendiente') {
      return (
        <div className="instrucciones-caja transferencia-alerta">
          <h3>Forma de Pago: Transferencia Bancaria 💰</h3>
          <p>Para procesar tu hardware y reservar el stock de forma definitiva, realiza la transferencia e informa el pago:</p>
          <div className="datos-cbu-bloque">
            <p><strong>Banco:</strong> Banco Nación Argentina (BNA)</p>
            <p><strong>CBU:</strong> 0110123456789012345678</p>
            <p><strong>Alias:</strong> tuempresa.hardware.gamer</p>
            <p><strong>Total Neto:</strong> ${Number(pedido.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          </div>
          <a href={`https://wa.me/5493517568602?text=Hola!%20Adjunto%20comprobante%20del%20pedido%20${codigoPedido}`} target="_blank" rel="noreferrer" className="btn-whatsapp-comprobante">
            💬 Enviar Comprobante por WhatsApp
          </a>
        </div>
      );
    }

    if (estado.toLowerCase() === 'reservado') {
      return (
        <div className="instrucciones-caja efectivo-alerta">
          <h3>Forma de Pago: Efectivo en Local 💵</h3>
          <p><strong>¡Tu pedido ya está separado en la sucursal elegida!</strong></p>
          <p>📍 Podes pasar por Av. Colón 450 a abonar y retirar tus componentes.</p>
          <p>⚠️ Recuerda que tenés un plazo de <strong>48 horas hábiles</strong> de reserva. Pasado ese tiempo, el sistema liberará los productos para la venta pública de forma automática.</p>
        </div>
      );
    }

    if (estado.toLowerCase() === 'pagado') {
      return (
        <div className="instrucciones-caja exito-alerta">
          <h3>Pago Confirmado Correctamente 🎉</h3>
          <p>El pago con tarjeta de crédito fue aprobado por la entidad bancaria.</p>
          <p>🛠️ Tus componentes entraron a la línea de armado y testeo antiestático en nuestro taller técnico. Te notificaremos al mail cuando el despacho esté listo.</p>
        </div>
      );
    }

    return (
      <div className="instrucciones-caja generica-alerta">
        <h3>Estado de tu Pedido: {estado.toUpperCase()}</h3>
        <p>Tu orden está siendo procesada de acuerdo a los tiempos estipulados.</p>
      </div>
    );
  };

  return (
    <div className="tracking-page-container">
      
      {/* Encabezado Principal del Pedido */}
      <div className="tracking-header-card">
        <div className="header-id-caja">
          <h1>Pedido {codigoPedido}</h1>
          <span className="codigo-temporal-tag">Código de pedido: <strong>{codigoPedido}</strong></span>
        </div>
        <div className={`status-badge-grande ${pedido.estado}`}>
          {pedido.estado ? pedido.estado.replace(/_/g, ' ').toUpperCase() : 'PENDIENTE'}
        </div>
      </div>

      {/* Cuerpo en dos columnas */}
      <div className="tracking-layout-cuerpo">
        
        {/* COLUMNA IZQUIERDA: Desglose del hardware pedido */}
        <div className="tracking-detalles-col">
          <div className="tracking-subcard">
            <h2>Componentes Pedidos</h2>
            <div className="pedido-productos-lista">
              {itemsPedido.map((item, index) => (
                <div key={index} className="producto-pedido-fila">
                  <div className="prod-ped-info">
                    <span className="prod-ped-cant">{item.cantidad}x</span>
                    <p className="prod-ped-nombre">{item.producto?.nombre || item.nombre || `Producto ID: ${item.producto_id}`}</p>
                  </div>
                  <span className="prod-ped-subtotal">
                    ${(Number(item.precio_unitario || item.precio || 0) * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            
            <hr className="tracking-divider" />
            
            <div className="tracking-totales-caja">
              <div className="total-fila-tracking">
                <span>Método de Entrega:</span>
                <span className="entrega-metodo-val">{pedido.metodo_envio === 'domicilio' ? '🚚 Envío a Domicilio' : '📍 Retiro en Sucursal Centro'}</span>
              </div>
              {(pedido.direccion || pedido.direccion_envio) && (
                <div className="total-fila-tracking direccion-desglose">
                  <span>Dirección:</span>
                  <span>
                    {pedido.direccion
                      ? `${pedido.direccion.calle} ${pedido.direccion.numero} (${pedido.direccion.ciudad}, ${pedido.direccion.provincia})`
                      : pedido.direccion_envio}
                  </span>
                </div>
              )}
              <div className="total-fila-tracking total-destacado-linea">
                <span>Total Facturado:</span>
                <strong>${Number(pedido.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Instrucciones dinámicas financieras */}
        <div className="tracking-acciones-col">
          {obtenerInstruccionesEstado()}
        </div>

      </div>
    </div>
  );
}

export default DetallePedido;
