import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';
import titanForgeLogo from '../assets/Titan_Forge_logo.svg';
import titanForgeBg from '../assets/backgrounds/Titan_Forge_bg.png';

// ✨ LA MAGIA DE VITE: Cargamos el índice dinámico de hardware para ubicar las fotos en subcarpetas
const todasLasImagenes = import.meta.glob('../assets/productos/**/*.{jpg,png,webp,avif}', { 
  eager: true, 
  import: 'default' 
});

function Home() {
  const [productos, setProductos] = useState([]);
  const [destacado, setDestacado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [slideActual, setSlideActual] = useState(0);

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

  useEffect(() => {
    const totalSlides = destacado ? 2 : 1;
    const intervalo = setInterval(() => {
      setSlideActual((actual) => (actual + 1) % totalSlides);
    }, 5500);

    return () => clearInterval(intervalo);
  }, [destacado]);

  const cambiarSlide = (indice) => {
    setSlideActual(indice);
  };

  const obtenerTotalSlides = () => (destacado ? 2 : 1);

  const irAlSlideAnterior = () => {
    const totalSlides = obtenerTotalSlides();
    setSlideActual((actual) => (actual - 1 + totalSlides) % totalSlides);
  };

  const irAlSlideSiguiente = () => {
    const totalSlides = obtenerTotalSlides();
    setSlideActual((actual) => (actual + 1) % totalSlides);
  };

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
      
      {/* --- CARRUSEL PRINCIPAL --- */}
      <section className="hero-section">
        <div className="hero-carousel">
          <div className="hero-track" style={{ transform: `translateX(-${slideActual * 100}%)` }}>
            <article className="hero-slide hero-banner" style={{ backgroundImage: `url(${titanForgeBg})` }}>
              <div className="hero-texto-overlay">
                <img src={titanForgeLogo} alt="Titan Forge" className="hero-logo" />
                <span className="hero-marca">Titan Forge</span>
                <h2>Forjá tu próxima máquina</h2>
                <p>Componentes, PCs armadas y servicio técnico especializado para llevar tu setup al siguiente nivel.</p>
                <Link to="/tienda" className="btn-hero">Ver Catálogo General</Link>
              </div>
            </article>

            <article className="hero-slide hero-destacado-slide">
              <div className="hero-destacado-copy">
                <span className="destacado-etiqueta">Producto estrella</span>
                <h2>{destacado ? destacado.nombre : 'Buscando componente estrella...'}</h2>
                <p>Una pieza destacada de Titan Forge para quienes quieren rendimiento, estética y potencia en serio.</p>
                {destacado && (
                  <div className="destacado-precios hero-precios">
                    <span className="precio-lista">Lista: ${Number(destacado.precio).toLocaleString('es-AR')}</span>
                    <span className="precio-final">${(destacado.precio * 0.85).toLocaleString('es-AR')} <small>15% OFF</small></span>
                  </div>
                )}
                {destacado ? (
                  <Link to={`/producto/${destacado.id}`} className="btn-ver-destacado">
                    Comprar Ahora
                  </Link>
                ) : (
                  <Link to="/tienda" className="btn-ver-destacado">
                    Explorar Productos
                  </Link>
                )}
              </div>

              <div className="hero-destacado-visual">
                {cargando ? (
                  <div className="loader-caja">Buscando componente estrella...</div>
                ) : destacado ? (
                  <img 
                    src={obtenerRutaImagen(destacado.nombre)} 
                    alt={destacado.nombre} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/420?text=Hardware' }}
                  />
                ) : (
                  <div className="loader-caja">Sin stock destacado</div>
                )}
              </div>
            </article>
          </div>

          <button
            type="button"
            className="hero-flecha hero-flecha-izquierda"
            onClick={irAlSlideAnterior}
            aria-label="Slide anterior"
          >
            ‹
          </button>

          <button
            type="button"
            className="hero-flecha hero-flecha-derecha"
            onClick={irAlSlideSiguiente}
            aria-label="Slide siguiente"
          >
            ›
          </button>

          <div className="hero-controles" aria-label="Controles del carrusel">
            {[0, 1].map((indice) => (
              <button
                key={indice}
                type="button"
                className={`hero-control ${slideActual === indice ? 'activo' : ''}`}
                onClick={() => cambiarSlide(indice)}
                aria-label={indice === 0 ? 'Ver bienvenida' : 'Ver producto estrella'}
                disabled={indice === 1 && !destacado}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN VITRINA DE PRODUCTOS DESTACADOS (Grilla Espejada del Catálogo) --- */}
      <section className="vitrina-section">
        <h2 className="vitrina-titulo">Hardware destacado de Titan Forge</h2>
        
        {cargando ? (
          <div className="catalogo-loader">Cargando la vitrina principal...</div>
        ) : (
          <div className="grilla-productos">
            {productos.map(producto => (
              <Link key={producto.id} to={`/producto/${producto.id}`} className="tarjeta-producto">
                
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
                </div>

              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Home;
