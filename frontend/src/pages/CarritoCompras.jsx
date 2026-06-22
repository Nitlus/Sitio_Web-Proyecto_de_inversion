import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import Modal from '../components/Modal';
import '../css/CarritoCompras.css';

// Índice automático de hardware de Vite para enlazar las imágenes en subcarpetas
const todasLasImagenes = import.meta.glob('../assets/productos/**/*.{jpg,png,webp,avif}', { 
  eager: true, 
  import: 'default' 
});

function CarritoCompras() {
  const { carrito, actualizarCantidad, removerDelCarrito } = useCarrito();
  const navigate = useNavigate();
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  // Buscador de imágenes idéntico al del catálogo y ficha técnica
  const obtenerRutaImagen = (nombreProducto) => {
    try {
      const nombreFormateado = nombreProducto
        .replace(/ /g, '_')
        .replace(/%/g, '') // ✨ FIX: Elimina los porcentajes
        .toLowerCase();
        
      const rutaEncontrada = Object.keys(todasLasImagenes).find(rutaRelativa => {
        return rutaRelativa.toLowerCase().includes(`/${nombreFormateado}.`);
      });
      return rutaEncontrada ? todasLasImagenes[rutaEncontrada] : 'https://via.placeholder.com/100?text=Hardware';
    } catch {
      return 'https://via.placeholder.com/100?text=Hardware';
    }
  };

  // Cálculos económicos síncronos
  const calcularTotalLista = () => {
    return carrito.reduce((acc, item) => acc + Number(item.precio || 0) * item.cantidad, 0);
  };

  const calcularTotalTransferencia = () => {
    return calcularTotalLista() * 0.85; // Aplica el 15% OFF global de tu regla de negocios
  };

  const procederAlPago = () => {
    // Redirecciona al checkout (Resumen de Compra)
    navigate('/resumen-compra');
  };

  const confirmarEliminacion = () => {
    if (!productoAEliminar) return;
    removerDelCarrito(productoAEliminar.id);
    setProductoAEliminar(null);
  };

  if (carrito.length === 0) {
    return (
      <div className="carrito-vacio-seccion">
        <div className="vacio-icono">🛒</div>
        <h2>Tu carrito de compras está vacío</h2>
        <p>Parece que aún no has añadido componentes de hardware a tu orden.</p>
        <Link to="/tienda" className="btn-ir-tienda">Explorar Productos</Link>
      </div>
    );
  }

  return (
    <div className="carrito-page-wrapper">
      <h1 className="carrito-page-titulo">Tu Carrito de Compras</h1>

      <div className="carrito-layout">
        
        {/* GRILLA IZQUIERDA: Listado de ítems seleccionados */}
        <div className="carrito-items-columna">
          {carrito.map((item) => {
            const precioItemLista = Number(item.precio || 0);
            const precioItemTransferencia = precioItemLista * 0.85;

            return (
              <div key={item.id} className="carrito-item-card">
                {/* Imagen del componente */}
                <div className="item-imagen-contenedor">
                  <img 
                    src={obtenerRutaImagen(item.nombre)} 
                    alt={item.nombre} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Hardware' }}
                  />
                </div>

                {/* Detalles técnicos y nombre */}
                <div className="item-detalles-contenedor">
                  <Link to={`/producto/${item.id}`} className="item-nombre-link">
                    {item.nombre}
                  </Link>
                  <span className={`item-condicion ${item.condicion}`}>
                    {item.condicion === 'usado' ? 'Usado/Refaccionado' : 'Nuevo'}
                  </span>
                </div>

                {/* Selectores interactivos de cantidad controlada por stock */}
                <div className="item-cantidad-control">
                  <button 
                    className="btn-cant-mod" 
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                  >
                    -
                  </button>
                  <span className="cant-valor">{item.cantidad}</span>
                  <button 
                    className="btn-cant-mod" 
                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                  >
                    +
                  </button>
                </div>

                {/* Desglose de precios por ítem (Multiplicado por cantidad) */}
                <div className="item-precios-totales">
                  <span className="total-item-efectivo">
                    ${(precioItemTransferencia * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="total-item-lista">
                    Lista: ${(precioItemLista * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Botón de eliminación directa */}
                <button className="btn-remover-producto" onClick={() => setProductoAEliminar(item)} title="Eliminar del carrito">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* TARJETA Flotante Derecha: Resumen de totales de facturación */}
        <div className="carrito-resumen-columna">
          <div className="resumen-totales-tarjeta">
            <h3>Resumen de Compra</h3>
            
            <div className="resumen-fila-dato">
              <span>Productos ({carrito.reduce((acc, item) => acc + item.cantidad, 0)}):</span>
              <span>${calcularTotalLista().toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="resumen-fila-dato">
              <span>Envío / Retiro:</span>
              <span className="envio-gratis-txt">Bonificado</span>
            </div>

            <hr className="resumen-divider" />

            {/* Caja de precios finales espejando la estética Venex de tu referencia */}
            <div className="resumen-precios-totales-bloque">
              <div className="total-pago-linea efectivo">
                <span className="total-monto-label">Total Transferencia/Efectivo:</span>
                <span className="total-monto-valor">${calcularTotalTransferencia().toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                <span className="ahorro-tag">¡Ahorrás un 15%!</span>
              </div>

              <div className="total-pago-linea lista">
                <span className="total-monto-label">Total Tarjeta (Lista):</span>
                <span className="total-monto-valor">${calcularTotalLista().toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                <span className="cuotas-tag">Hasta 3 cuotas sin interés</span>
              </div>
            </div>

            <button className="btn-comercial-checkout" onClick={procederAlPago}>
              Continuar al Pago
            </button>
            
            <Link to="/tienda" className="link-seguir-comprando">
              ← Seguir comprando productos
            </Link>
          </div>
        </div>

      </div>

      <Modal
        abierto={!!productoAEliminar}
        tipo="warning"
        titulo="Quitar del carrito"
        mensaje={productoAEliminar ? `¿Querés quitar "${productoAEliminar.nombre}" del carrito?` : ''}
        textoCancelar="Cancelar"
        textoConfirmar="Quitar"
        onCerrar={() => setProductoAEliminar(null)}
        onConfirmar={confirmarEliminacion}
      />
    </div>
  );
}

export default CarritoCompras;
