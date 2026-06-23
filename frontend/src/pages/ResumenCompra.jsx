import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import '../css/ResumenCompra.css';

const SUCURSALES_RETIRO = {
  nuevaCordoba: 'Obispo Salguero 453, Nueva Córdoba',
  centro: 'Obispo Trejo 320, Barrio Centro',
};

function ResumenCompra() {
  const { carrito, limpiarCarrito } = useCarrito();
  const { usuario } = useAuth(); // Leemos si hay un usuario logueado en el sistema
  const navigate = useNavigate();

  const [procesando, setProcesando] = useState(false);
  const [modalPedido, setModalPedido] = useState({
    abierto: false,
    tipo: 'success',
    titulo: '',
    mensaje: '',
    destino: null,
    limpiarCarritoAlCerrar: false,
  });

  // Estados del Formulario con datos pre-cargados dinámicamente
  const [formData, setFormData] = useState({
    email: usuario?.email || '',
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    dni: usuario?.dni || usuario?.documento || '',
    telefono: usuario?.telefono || '',
    aclaracion: '',
    metodoPago: 'transferencia', // transferencia (15% OFF), efectivo, tarjeta
    metodoEnvio: 'retiro',       // retiro, domicilio
    sucursalRetiro: 'nuevaCordoba',
    calle: '',
    numero: '',
    pisoDepto: '',
    codigoPostal: '',
    ciudad: '',
    provincia: ''
  });

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cálculos económicos finales
  const calcularSubtotal = () => {
    return carrito.reduce((acc, item) => acc + Number(item.precio_lista || 0) * item.cantidad, 0);
  };

  const metodoPagoTieneDescuento = () => {
    return formData.metodoPago === 'transferencia' || formData.metodoPago === 'efectivo';
  };

  const calcularCostoEnvio = () => {
    if (formData.metodoEnvio !== 'domicilio') {
      return 0;
    }

    const codigoPostal = Number(String(formData.codigoPostal || '').trim());
    if (!Number.isInteger(codigoPostal)) {
      return 0;
    }

    if (codigoPostal >= 5000 && codigoPostal <= 5022) {
      return 3500;
    }

    if (codigoPostal >= 5000 && codigoPostal <= 5999) {
      return 5500;
    }

    return 8500;
  };

  const obtenerTextoCostoEnvio = () => {
    if (formData.metodoEnvio !== 'domicilio') {
      return 'Bonificado';
    }

    if (!String(formData.codigoPostal || '').trim()) {
      return 'Ingresá tu CP';
    }

    return `$${calcularCostoEnvio().toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  };

  const calcularTotalProductos = () => {
    const subtotal = calcularSubtotal();
    if (metodoPagoTieneDescuento()) {
      return subtotal * 0.85;
    }
    return subtotal; 
  };

  const calcularTotalFinal = () => {
    return calcularTotalProductos() + calcularCostoEnvio();
  };

  const obtenerDireccionEnvio = () => {
    if (formData.metodoEnvio === 'retiro') {
      return `Retiro en sucursal - ${SUCURSALES_RETIRO[formData.sucursalRetiro]}`;
    }
    return `${formData.calle} ${formData.numero}${formData.pisoDepto ? ` ${formData.pisoDepto}` : ''}, CP ${formData.codigoPostal}, ${formData.ciudad}, ${formData.provincia}`;
  };

  const cerrarModalPedido = () => {
    const destino = modalPedido.destino;
    const debeLimpiarCarrito = modalPedido.limpiarCarritoAlCerrar;

    setModalPedido(prev => ({
      ...prev,
      abierto: false,
      destino: null,
      limpiarCarritoAlCerrar: false,
    }));

    if (destino) {
      if (debeLimpiarCarrito) {
        limpiarCarrito();
      }

      navigate(destino);
    }
  };

  // Envío del pedido al Backend
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);

    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toTimeString().slice(0, 8);

    const pedidoPayload = {
      nombre: `${formData.nombre} ${formData.apellido}`.trim(),
      email: formData.email,
      email_contacto: formData.email,
      fecha,
      hora,
      total: calcularTotalFinal(),
      estado: 'pendiente',
      metodo_pago: formData.metodoPago,
      metodo_envio: formData.metodoEnvio,
      costo_envio: calcularCostoEnvio(),
      direccion_envio: obtenerDireccionEnvio(),
      telefono_contacto: formData.telefono || 'No informado',
      aclaracion: formData.aclaracion,
      detalles: carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_lista
      }))
    };

    try {
      const respuesta = await fetch('https://unclog-playmate-slush.ngrok-free.dev/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
          'ngrok-skip-browser-warning': 'true' // ✨ Esto evita que la página se quede pensando
        },
        body: JSON.stringify(pedidoPayload)
      });

      if (!respuesta.ok) throw new Error("Error al procesar la orden en el servidor");

      const resultado = await respuesta.json();
      
      const idPedido = resultado.id || resultado.pedido?.id;
      const codigoPedido = resultado.codigo || resultado.pedido?.codigo || resultado.codigo_temporal;
      
      setModalPedido({
        abierto: true,
        tipo: 'success',
        titulo: 'Pedido creado',
        mensaje: `¡Pedido ${codigoPedido || ''} creado con éxito!`,
        destino: idPedido ? `/pedido/${idPedido}` : '/mis-pedidos',
        limpiarCarritoAlCerrar: true,
      });

    } catch (err) {
      console.error(err);
      setModalPedido({
        abierto: true,
        tipo: 'warning',
        titulo: 'No pudimos registrar el pedido',
        mensaje: 'Hubo un problema al registrar tu orden. Por favor, reintenta en unos instantes.',
        destino: null,
        limpiarCarritoAlCerrar: false,
      });
    } finally {
      setProcesando(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="resumen-vacio">
        <h2>No hay productos para procesar el pago</h2>
        <Link to="/tienda" className="btn-volver">Ir al Catálogo</Link>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <h1 className="checkout-main-titulo">Finalizar Compra</h1>
      
      <form onSubmit={manejarSubmit} className="checkout-layout">
        
        {/* COLUMNA IZQUIERDA: Formulario de datos */}
        <div className="checkout-form-columna">
          
          {/* Bloque 1: Datos Personales */}
          <div className="checkout-seccion-card">
            <h2>1. Datos Personales</h2>
            <div className="form-inputs-grid">
              <div className="input-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!usuario} />
              </div>
              <div className="input-group">
                <label>Nombre *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={!!usuario} />
              </div>
              <div className="input-group">
                <label>Apellido *</label>
                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required disabled={!!usuario} />
              </div>
              <div className="input-group">
                <label>DNI / CUIT *</label>
                <input type="text" name="dni" value={formData.dni} onChange={handleChange} required disabled={!!usuario} />
              </div>
              <div className="input-group">
                <label>Teléfono *</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group full-width">
              <label>Aclaraciones / Notas del Pedido (Opcional)</label>
              <textarea name="aclaracion" value={formData.aclaracion} onChange={handleChange} placeholder="Ej: Entregar después de las 14hs, timbre roto, etc..." rows="3" />
            </div>
          </div>

          {/* Bloque 2: Logística de Entrega */}
          <div className="checkout-seccion-card">
            <h2>2. Método de Envío</h2>
            <div className="radio-selector-caja">
              <label className={`radio-option ${formData.metodoEnvio === 'retiro' ? 'selected' : ''}`}>
                <input type="radio" name="metodoEnvio" value="retiro" checked={formData.metodoEnvio === 'retiro'} onChange={handleChange} />
                <div className="radio-txt">
                  <strong>Retirar en Sucursal</strong>
                  <span>📍 Retiro bonificado en Córdoba</span>
                </div>
              </label>
              <label className={`radio-option ${formData.metodoEnvio === 'domicilio' ? 'selected' : ''}`}>
                <input type="radio" name="metodoEnvio" value="domicilio" checked={formData.metodoEnvio === 'domicilio'} onChange={handleChange} />
                <div className="radio-txt">
                  <strong>Envío a Domicilio</strong>
                  <span>🚚 Despacho directo a tu dirección</span>
                </div>
              </label>
            </div>

            {formData.metodoEnvio === 'retiro' && (
              <div className="form-envio-subbloque animate-fade">
                <h3>Sucursal de Retiro</h3>
                <div className="radio-selector-caja">
                  <label className={`radio-option ${formData.sucursalRetiro === 'nuevaCordoba' ? 'selected' : ''}`}>
                    <input type="radio" name="sucursalRetiro" value="nuevaCordoba" checked={formData.sucursalRetiro === 'nuevaCordoba'} onChange={handleChange} />
                    <div className="radio-txt">
                      <strong>Nueva Córdoba</strong>
                      <span>📍 Obispo Salguero 453, Nueva Córdoba</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Campos condicionales para datos de envío */}
            {formData.metodoEnvio === 'domicilio' && (
              <div className="form-envio-subbloque animate-fade">
                <h3>Datos del Envío</h3>
                <div className="form-inputs-grid">
                  <div className="input-group flex-2">
                    <label>Calle *</label>
                    <input type="text" name="calle" value={formData.calle} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Número *</label>
                    <input type="text" name="numero" value={formData.numero} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Piso / Depto</label>
                    <input type="text" name="pisoDepto" value={formData.pisoDepto} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Código Postal *</label>
                    <input type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} inputMode="numeric" pattern="[0-9]{4}" maxLength="4" required />
                  </div>
                  <div className="input-group">
                    <label>Ciudad *</label>
                    <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Provincia *</label>
                    <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bloque 3: Formas de Pago */}
          <div className="checkout-seccion-card">
            <h2>3. Método de Pago</h2>
            <div className="radio-selector-caja">
              <label className={`radio-option ${formData.metodoPago === 'transferencia' ? 'selected' : ''}`}>
                <input type="radio" name="metodoPago" value="transferencia" checked={formData.metodoPago === 'transferencia'} onChange={handleChange} />
                <div className="radio-txt">
                  <strong>Transferencia Bancaria</strong>
                  <span className="descuento-alert">💰 ¡15% de Descuento Especial!</span>
                </div>
              </label>
              <label className={`radio-option ${formData.metodoPago === 'efectivo' ? 'selected' : ''}`}>
                <input type="radio" name="metodoPago" value="efectivo" checked={formData.metodoPago === 'efectivo'} onChange={handleChange} />
                <div className="radio-txt">
                  <strong>Efectivo (Retiro en local)</strong>
                  <span className="descuento-alert">💰 15% OFF pagando al retirar</span>
                </div>
              </label>
              <label className={`radio-option ${formData.metodoPago === 'tarjeta' ? 'selected' : ''}`}>
                <input type="radio" name="metodoPago" value="tarjeta" checked={formData.metodoPago === 'tarjeta'} onChange={handleChange} />
                <div className="radio-txt">
                  <strong>Tarjeta de Crédito</strong>
                  <span>💳 Precio de Lista (Hasta 3 cuotas sin interés)</span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: Totales fijos de confirmación e Info de Envíos */}
        <div className="checkout-resumen-columna">
          <div className="orden-totales-fija">
            <h3>Detalle de la Orden</h3>
            
            <div className="items-previsualizacion-lista">
              {carrito.map(item => (
                <div key={item.id} className="item-mini-linea">
                  <span className="item-mini-cant">{item.cantidad}x</span>
                  <span className="item-mini-nom" title={item.nombre}>{item.nombre}</span>
                  <span className="item-mini-prc">
                    ${((metodoPagoTieneDescuento() ? item.precio_lista * 0.85 : item.precio_lista) * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>

            <hr className="resumen-divider" />

            <div className="resumen-valores-caja">
              <div className="valor-fila">
                <span>Subtotal (Precio Lista):</span>
                <span>${calcularSubtotal().toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              {metodoPagoTieneDescuento() && (
                <div className="valor-fila descuento-verde">
                  <span>Descuento aplicado (15%):</span>
                  <span>-${(calcularSubtotal() * 0.15).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="valor-fila">
                <span>Envío:</span>
                <span>{obtenerTextoCostoEnvio()}</span>
              </div>

              <div className="valor-fila total-grande">
                <span>Total a Pagar:</span>
                <span>${calcularTotalFinal().toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button type="submit" className="btn-confirmar-compra" disabled={procesando}>
              {procesando ? 'Confirmando Pedido...' : 'Confirmar y Finalizar Compra'}
            </button>
          </div>

          {/* ✨ NUEVA PESTAÑA/TARJETA AL COSTADO CON LOS COSTOS DE ENVÍO */}
          <div className="checkout-shipping-info-card animate-fade">
            <h4>Tarifas de Envío 🚚</h4>
            <p>Calculado automáticamente al ingresar tu Código Postal:</p>
            <div className="shipping-rate-row">
              <span>Córdoba Capital (CP 5000 - 5022)</span>
              <strong>$3.500</strong>
            </div>
            <div className="shipping-rate-row">
              <span>Interior de Córdoba (CP 5023 - 5999)</span>
              <strong>$5.500</strong>
            </div>
            <div className="shipping-rate-row">
              <span>Resto del País (Otras Provincias)</span>
              <strong>$8.500</strong>
            </div>
            <div className="shipping-rate-tip">
              <span>💡 <strong>Tip:</strong> ¡Siempre podés seleccionar "Retirar en Sucursal" para retirar gratis!</span>
            </div>
          </div>

        </div>

      </form>

      <Modal
        abierto={modalPedido.abierto}
        tipo={modalPedido.tipo}
        titulo={modalPedido.titulo}
        mensaje={modalPedido.mensaje}
        textoConfirmar={modalPedido.destino ? 'Ver detalle del pedido' : 'Aceptar'}
        onCerrar={cerrarModalPedido}
        onConfirmar={cerrarModalPedido}
      />
    </div>
  );
}

export default ResumenCompra;
