import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/Producto.css';

// 🔮 Cargamos el mismo índice dinámico de hardware para ubicar las imágenes en las subcarpetas
const todasLasImagenes = import.meta.glob('../assets/productos/**/*.{jpg,png,webp,avif}', { 
  eager: true, 
  import: 'default' 
});

function Producto() {
  const { id } = useParams(); // Atrapamos el ID desde la URL
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let estaMontado = true;

    const obtenerDetalleProducto = async () => {
      try {
        const respuesta = await fetch(`http://localhost:3000/api/productos/${id}`);
        if (!respuesta.ok) throw new Error("Producto no encontrado");
        
        const datos = await respuesta.json();
        
        if (estaMontado) {
          setProducto(datos);
          setCargando(false);
        }
      } catch (err) {
        console.error("Error cargando ficha técnica:", err);
        if (estaMontado) setCargando(false);
      }
    };

    obtenerDetalleProducto();

    return () => {
      estaMontado = false;
    };
  }, [id]);

  // Buscador inteligente de imágenes por el nombre estructurado con guiones bajos y sin porcentajes
  const obtenerRutaImagen = (nombreProducto) => {
    try {
      const nombreFormateado = nombreProducto
        .replace(/ /g, '_')
        .replace(/%/g, '') // ✨ FIX: Elimina los porcentajes para evitar Malformed URI
        .toLowerCase();
        
      const rutaEncontrada = Object.keys(todasLasImagenes).find(rutaRelativa => {
        return rutaRelativa.toLowerCase().includes(`/${nombreFormateado}.`);
      });
      return rutaEncontrada ? todasLasImagenes[rutaEncontrada] : 'https://via.placeholder.com/450?text=Sin+Imagen';
    } catch {
      return 'https://via.placeholder.com/450?text=Sin+Imagen';
    }
  };

  // Manejadores del contador de unidades a comprar
  const incrementarCantidad = () => {
    if (cantidad < producto.stock) {
      setCantidad(prev => prev + 1);
    }
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(prev => prev - 1);
    }
  };

  const agregarAlCarrito = () => {
    // Esto se conectará con el estado global de CarritoCompras.jsx en fases posteriores
    alert(`¡Añadido al carrito: ${cantidad} unidad(es) de "${producto.nombre}"!`);
  };

  if (cargando) {
    return <div className="producto-loading">Buscando especificaciones en la base de datos...</div>;
  }

  if (!producto) {
    return (
      <div className="producto-error-caja">
        <h2>⚠️ Lo sentimos, el producto no existe o fue dado de baja.</h2>
        <Link to="/tienda" className="btn-volver-tienda">Volver a la Tienda</Link>
      </div>
    );
  }

  const tieneStock = producto.stock > 0;
  const precioLista = Number(producto.precio || 0);
  const precioTransferencia = precioLista * 0.85; // 15% de descuento fijo solicitado

  return (
    <div className="ficha-producto-container">
      
      {/* Miga de pan / Breadcrumb de navegación */}
      <div className="producto-breadcrumb">
        <Link to="/">Inicio</Link> / <Link to="/tienda">Catálogo</Link> / <span>{producto.nombre}</span>
      </div>

      <div className="producto-layout-principal">
        
        {/* COLUMNA IZQUIERDA: Bloque visual de la fotografía */}
        <div className="producto-visual-bloque">
          <div className="producto-imagen-marco">
            <img 
              src={obtenerRutaImagen(producto.nombre)} 
              alt={producto.nombre} 
              className="producto-imagen-principal"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/450?text=Sin+Imagen' }}
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: Datos comerciales y mecánicas de compra */}
        <div className="producto-datos-bloque">
          <span className={`producto-condicion-tag ${producto.condicion}`}>
            {producto.condicion === 'usado' ? 'Refaccionado / Usado' : 'Nuevo Caja Cerrada'}
          </span>
          
          <h1 className="producto-nombre-completo">{producto.nombre}</h1>
          
          <div className="producto-disponibilidad-linea">
            {tieneStock ? (
              <span className="stock-disponible-txt">✔️ Stock Disponible ({producto.stock} unidades)</span>
            ) : (
              <span className="stock-agotado-txt">❌ Sin Stock Actualmente</span>
            )}
          </div>

          <hr className="producto-seccion-divider" />

          {/* Bloque tarifario comparativo (Espejando el modelo Venex / Compra Gamer) */}
          <div className="producto-precios-panel">
            <div className="precio-caja-efectivo">
              <span className="efectivo-monto">${precioTransferencia.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <p className="efectivo-leyenda">Precio Especial pagando en <strong>Efectivo o Transferencia Bancaria (15% OFF)</strong></p>
            </div>
            
            <div className="precio-caja-lista">
              <span className="lista-monto">${precioLista.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <p className="lista-leyenda">Precio de Lista en hasta <strong>3 Cuotas sin interés</strong> con tarjetas de crédito</p>
            </div>
          </div>

          <hr className="producto-seccion-divider" />

          {/* Panel interactivo de compra */}
          <div className="producto-acciones-panel">
            <div className="contador-cantidad-caja">
              <button 
                className="btn-contador" 
                onClick={decrementarCantidad} 
                disabled={!tieneStock || cantidad <= 1}
              >
                -
              </button>
              <span className="cantidad-numero-txt">{tieneStock ? cantidad : 0}</span>
              <button 
                className="btn-contador" 
                onClick={incrementarCantidad} 
                disabled={!tieneStock || cantidad >= producto.stock}
              >
                +
              </button>
            </div>

            <button 
              className="btn-principal-carrito"
              disabled={!tieneStock}
              onClick={agregarAlCarrito}
            >
              {tieneStock ? 'Añadir al Carrito' : 'Agotado'}
            </button>
          </div>

        </div>
      </div>

      {/* SECCIÓN INFERIOR: Descripción técnica extendida del componente */}
      <div className="producto-descripcion-seccion">
        <h2>Características y Ficha Técnica</h2>
        <div className="descripcion-texto-cuerpo">
          {producto.descripcion ? (
            <p>{producto.descripcion}</p>
          ) : (
            <p className="sin-especificaciones">No se han cargado detalles específicos adicionales para este componente de hardware por parte del taller técnico.</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default Producto;