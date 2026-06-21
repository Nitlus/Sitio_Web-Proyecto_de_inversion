import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png'; // Aprovechamos la imagen que ya tenés en tu repo
import '../css/Home.css';

function Home() {
  const [productos, setProductos] = useState([]);
  const [destacado, setDestacado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Traemos los productos del backend. 
    // Usamos el mismo criterio que en App.jsx: ordenamos por precio descendente (o el filtro que prefieras)
    fetch('http://localhost:3000/api/productos?orden=precio_desc')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setDestacado(data[0]); // El producto N°1 es el destacado
          setProductos(data.slice(1, 9)); // Tomamos los siguientes 8 para la vitrina mezclada
        }
        setCargando(false);
      })
      .catch(err => {
        console.error("Error cargando el inicio:", err);
        setCargando(false);
      });
  }, []);

  return (
    <div className="home-container">
      
      {/* --- SECCIÓN HERO (Carrusel / Banners) --- */}
      <section className="hero-section">
        {/* Banner Principal de Bienvenida */}
        <div className="hero-banner">
          <img src={heroImg} alt="Bienvenidos a Tu Empresa Computación" className="hero-imagen" />
          <div className="hero-texto-overlay">
            <h2>Llevá tu setup al siguiente nivel</h2>
            <p>Componentes, PCs armadas y el mejor servicio técnico.</p>
            <Link to="/tienda" className="btn-hero">Ver Catálogo</Link>
          </div>
        </div>

        {/* Tarjeta lateral del Producto Destacado */}
        <div className="hero-destacado">
          <div className="destacado-etiqueta">🔥 PRODUCTO ESTRELLA</div>
          {cargando ? (
            <div className="loader-caja">Cargando destacado...</div>
          ) : destacado ? (
            <div className="destacado-card">
              <h3 className="destacado-titulo">{destacado.nombre}</h3>
              <p className="destacado-desc">{destacado.descripcion}</p>
              
              <div className="destacado-precios">
                <span className="precio-lista">${Number(destacado.precio).toLocaleString('es-AR')}</span>
                <span className="precio-final">${(destacado.precio * 0.85).toLocaleString('es-AR')} <small>Efectivo</small></span>
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

      {/* --- SECCIÓN VITRINA MIXTA --- */}
      <section className="vitrina-section">
        <h2 className="vitrina-titulo">Descubrí nuestros productos</h2>
        
        {cargando ? (
          <p className="cargando-texto">Cargando el catálogo...</p>
        ) : (
          <div className="productos-grid">
            {productos.map(producto => (
              <div key={producto.id} className="producto-card">
                
                {/* Etiqueta de Stock Dinámica */}
                {producto.stock > 0 ? (
                   <span className="badge-stock">En Stock</span>
                ) : (
                   <span className="badge-sin-stock">Agotado</span>
                )}

                {/* Info del Producto */}
                <div className="producto-info">
                  <h4 title={producto.nombre}>{producto.nombre}</h4>
                  
                  <div className="precios-caja">
                    <p className="p-lista">${Number(producto.precio).toLocaleString('es-AR')}</p>
                    <p className="p-final">${(producto.precio * 0.85).toLocaleString('es-AR')}</p>
                  </div>
                </div>

                {/* Botón de Acción */}
                <Link to={`/producto/${producto.id}`} className="btn-ver-producto">
                  Ver Detalles
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Home;