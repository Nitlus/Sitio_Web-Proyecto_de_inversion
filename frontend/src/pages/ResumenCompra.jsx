import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import '../css/ResumenCompra.css';

function ResumenCompra() {
  const { carrito, limpiarCarrito } = useCarrito();
  const { usuario } = useAuth(); // Leemos si hay un usuario logueado en el sistema
  const navigate = useNavigate();

  const [procesando, setProcesando] = useState(false);

  // Estados del Formulario con datos pre-cargados dinámicamente
  // Usamos el operador '?.' para evitar errores si "usuario" es null (invitado)
  const [formData, setFormData] = useState({
    email: usuario?.email || '',
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    dni: usuario?.dni || usuario?.documento || '',
    aclaracion: '',
    metodoPago: 'transferencia', // transferencia (15% OFF), efectivo, tarjeta
    metodoEnvio: 'retiro',       // retiro, domicilio
    calle: '',
    numero: '',
    pisoDepto: '',
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
    return carrito.reduce((acc, item) => acc + Number(item.precio || 0) * item.cantidad, 0);
  };

  const calcularTotalFinal = () => {
    const subtotal = calcularSubtotal();
    // Si es transferencia o efectivo en local se aplica el 15% de descuento del negocio
    if (formData.metodoPago === 'transferencia' || formData.metodoPago === 'efectivo') {
      return subtotal * 0.85;
    }
    return subtotal; // Tarjeta de crédito paga precio de lista
  };

  // Envío del pedido al Backend
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);

    // Estructuramos el payload exacto que espera tu Sequelize en Node.js
    const pedidoPayload = {
      cliente_datos: {
        email: formData.email,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        aclaracion: formData.aclaracion
      },
      logistica: {
        metodoEnvio: formData.metodoEnvio,
        direccion: formData.metodoEnvio === 'domicilio' ? {
          calle: formData.calle,
          numero: formData.numero,
          pisoDepto: formData.pisoDepto,
          ciudad: formData.ciudad,
          provincia: formData.provincia
        } : null
      },
      financiero: {
        metodoPago: formData.metodoPago,
        total: calcularTotalFinal()
      },
      // Mapeamos los ítems del carrito
      items: carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: formData.metodoPago === 'tarjeta' ? item.precio : item.precio * 0.85
      }))
    };

    try {
      const respuesta = await fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Adjuntamos el token si el cliente está registrado
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify(pedidoPayload)
      });

      if (!respuesta.ok) throw new Error("Error al procesar la orden en el servidor");

      const resultado = await respuesta.json();
      
      // Limpiamos el carrito global y redirigimos a la vista individual del pedido generado
      limpiarCarrito();
      alert(`¡Pedido N° ${resultado.id || 'Generado'} creado con éxito!`);
      navigate(`/pedido/${resultado.id || ''}`);

    } catch (err) {
      console.error(err);
      alert("Hubo un problema al registrar tu orden. Por favor, reintenta en unos instantes.");
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
                  <span>📍 Av. Colón 450 - Córdoba (Bonificado)</span>
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
                  <span className="descuento-alert">💵 ¡15% de Descuento Especial!</span>
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

        {/* COLUMNA DERECHA: Totales fijos de confirmación */}
        <div className="checkout-resumen-columna">
          <div className="orden-totales-fija">
            <h3>Detalle de la Orden</h3>
            
            <div className="items-previsualizacion-lista">
              {carrito.map(item => (
                <div key={item.id} className="item-mini-linea">
                  <span className="item-mini-cant">{item.cantidad}x</span>
                  <span className="item-mini-nom" title={item.nombre}>{item.nombre}</span>
                  <span className="item-mini-prc">
                    ${((formData.metodoPago === 'tarjeta' ? item.precio : item.precio * 0.85) * item.cantidad).toLocaleString('es-AR')}
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
              
              {(formData.metodoPago === 'transferencia' || formData.metodoPago === 'efectivo') && (
                <div className="valor-fila descuento-verde">
                  <span>Descuento aplicado (15%):</span>
                  <span>-${(calcularSubtotal() * 0.15).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="valor-fila total-grande">
                <span>Total a Pagar:</span>
                <span>${calcularTotalFinal().toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button type="submit" className="btn-confirmar-compra" disabled={procesando}>
              {procesando ? 'Confirmando Pedido...' : 'Confirmar y Finalizar Compra'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

export default ResumenCompra;