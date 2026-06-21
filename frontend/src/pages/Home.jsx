import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';

// ✨ LA MAGIA DE VITE: Cargamos el índice dinámico de hardware para ubicar las fotos en subcarpetas
const todasLasImagenes = import.meta.glob('../assets/productos/**/*.{jpg,png,webp,avif}', { 
  eager: true, 
  import: 'default' 
});

function Home() {
  const [productos, setProductos] = useState([]);
  const [destacado, setDestacado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let estaMontado = true;

    // Traemos los productos del backend.
    fetch('http://localhost:3000/api/productos?orden=precio_desc')
      .then(res => res.json())
      .then(data => {
        if (estaMontado && data.length > 0) {
          setDestacado(data[0]); // El producto N°1 de la lista es el estrella
          setProductos(data.slice(1, 9)); // Tomamos los siguientes 8 para la cuadrícula inferior
        }
        if (estaMontado) setCargando(false);
      })
      .catch(err => {
        console.error("Error cargando el inicio:", err);
        if (estaMontado) setCargando(false);
      });

    return () => {
      estaMontado = false;
    };
  }, []);

  // Buscador inteligente de imágenes idéntico al del Catálogo, Ficha técnica y Carrito
  const obtenerRutaImagen = (nombreProducto) => {
    try {
      const nombreFormateado = nombreProducto
        .replace(/ /g, '_')
        .replace(/%/g, '') // ✨ FIX: Elimina los porcentajes para evitar errores "Malformed URI"
        .toLowerCase();
        
      const rutaEncontrada = Object.keys(todasLasImagenes).find(rutaRelativa => {
        return rutaRelativa.toLowerCase().includes(`/${nombreFormateado}.`);
      });
      return rutaEncontrada ? todasLasImagenes[rutaEncontrada] : 'https://via.placeholder.com/250?text=Hardware';
    } catch {
      return 'https://via.placeholder.com/250?text=Hardware';
    }
  };

  return (
    <div className="home-container">
      
      {/* --- SECCIÓN HERO (Banner Principal + Producto Estrella Flotante) --- */}
      <section className="hero-section">
        {/* Banner Principal de Bienvenida */}
        <div className="hero-banner">
          <div className="hero-texto-overlay">
            <h2>Llevá tu setup al siguiente nivel</h2>
            <p>Componentes, PCs armadas y el mejor servicio técnico especializado.</p>
            <Link to="/tienda" className="btn-hero">Ver Catálogo General</Link>
          </div>
        </div>

        {/* Tarjeta lateral fija del Producto Destacado */}
        <div className="hero-destacado">
          <div className="destacado-etiqueta">🔥 PRODUCTO ESTRELLA</div>
          {cargando ? (
            <div className="loader-caja">Buscando componente estrella...</div>
          ) : [{ destacadaFoto: destacado }].length > 0 && destacado ? (
            <div className="destacado-card">
              {/* Caja de Imagen para el destacado */}
              <div className="destacado-img-contenedor">
                <img 
                  src={obtenerRutaImagen(destacado.nombre)} 
                  alt={destacado.nombre} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/250?text=Hardware' }}
                />
              </div>
              <h3 className="destacado-titulo" title={destacado.nombre}>{destacado.nombre}</h3>
              
              <div className="destacado-precios">
                <span className="precio-lista">Lista: ${Number(destacado.precio).toLocaleString('es-AR')}</span>
                <span className="precio-final">${(destacado.precio * 0.85).toLocaleString('es-AR')} <small>15% OFF</small></span>
              </div>
              
              <Link to={`/producto/${destacado.id}`} className="btn-ver-destacado">
                Comprar Ahora
              </Link>
            </div>
          ) : (
            <div className="loader-caja">Sin stock destacado</div>
          )}
        </div>
      </section>

      {/* --- SECCIÓN VITRINA DE PRODUCTOS DESTACADOS (Grilla Espejada del Catálogo) --- */}
      <section className="vitrina-section">
        <h2 className="vitrina-titulo">Componentes y Hardware Destacados</h2>
        
        {cargando ? (
          <div className="catalogo-loader">Cargando la vitrina principal...</div>
        ) : (
          <div className="grilla-productos">
            {productos.map(producto => (
              <div key={producto.id} className="tarjeta-producto">
                
                {/* Contenedor de la Imagen (Marco Blanco Premium para Hardware) */}
                <div className="tarjeta-imagen-caja">
                  <img 
                    src={obtenerRutaImagen(producto.nombre)} 
                    alt={producto.nombre} 
                    className="tarjeta-imagen"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/250?text=Sin+Imagen' }}
                  />
                </div>

                {/* Contenedor de la Información */}
                <div className="tarjeta-info">
                  <h3 className="tarjeta-nombre" title={producto.nombre}>
                    {producto.nombre}
                  </h3>
                  
                  <div className="tarjeta-precios">
                    {/* Precio calculado dinámicamente con 15% de descuento por transferencia */}
                    <span className="precio-transferencia">
                      ${(producto.precio * 0.85).toLocaleString('es-AR')}
                    </span>
                    <span className="etiqueta-pago">Efectivo / Transferencia</span>
                  </div>

                  <Link to={`/producto/${producto.id}`} className="btn-ver-detalle">
                    Ver Producto
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Home;