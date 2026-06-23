import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Navbar.css';
import titanForgeLogo from '../assets/Titan_Forge_logo.svg';

// Importamos los contextos globales (Carrito y Usuarios)
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para controlar los menús desplegables
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [categoriaHover, setCategoriaHover] = useState(null); // Sabe qué categoría tiene el mouse encima
  
  const navigate = useNavigate();

  // Extraemos datos globales
  const { totalItemsCount } = useCarrito();
  const { usuario, logout } = useAuth(); // Leemos quién está logueado

  // 1. Efecto para buscar las categorías de tu backend Node.js
  useEffect(() => {
    fetch('https://unclog-playmate-slush.ngrok-free.dev/api/categorias', {
      headers: {
        'ngrok-skip-browser-warning': 'true' // ✨ Esto evita que la página se quede pensando
      }
    })
      .then(res => res.json())
      .then(data => {
        // Filtramos para quedarnos solo con las categorías padre (las que no tienen parent_id)
        const categoriasPadre = data.filter(cat => cat.parent_id === null);
        setCategorias(categoriasPadre);
      })
      .catch(err => console.error("Error cargando categorías:", err));
  }, []);

  // 2. Función para manejar la barra de búsqueda
  const manejarBusqueda = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      // Redirige a la página de catálogo (/tienda) aplicando el filtro por nombre
      navigate(`/tienda?nombre=${busqueda}`);
    }
  };

  // Función auxiliar para transformar "Placas de Video" en "placas-de-video" para la URL
  const formatearURL = (texto) => texto.toLowerCase().replace(/\s+/g, '-');

  return (
    <header className="navbar-container">
      
      {/* --- 1RA FILA --- */}
      <div className="navbar-fila-1">
        {/* Logo / Nombre - Redirige al Home (/) */}
        <Link to="/" className="navbar-logo">
          <img src={titanForgeLogo} alt="Titan Forge" className="navbar-logo-img" />
          <span>Titan Forge</span>
        </Link>

        {/* Barra de Búsqueda */}
        <form onSubmit={manejarBusqueda} className="navbar-search">
          <input 
            type="text" 
            placeholder="Buscar productos por nombre..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        {/* Botones de Autenticación Dinámicos */}
        <div className="navbar-auth">
          {usuario ? (
            // Si está logueado, saludamos y mostramos botón de salir
            <div className="navbar-user-box">
              <span className="navbar-user-greeting">¡Hola, {usuario.nombre}!</span>
              <button 
                onClick={logout} 
                className="navbar-logout-btn"
              >
                Salir
              </button>
            </div>
          ) : (
            // Si es invitado, mostramos Login y Register
            <>
              <Link to="/login" className="btn-login">Ingresar</Link>
              <Link to="/register" className="btn-register">Registrarse</Link>
            </>
          )}
        </div>
      </div>

      <hr className="navbar-divider" />

      {/* --- 2DA FILA --- */}
      <nav className="navbar-fila-2">
        
        {/* Botón Productos (Menú Desplegable en Cascada) */}
        <div 
          className="dropdown-container"
          onMouseEnter={() => setMostrarDropdown(true)}
          onMouseLeave={() => {
            setMostrarDropdown(false);
            setCategoriaHover(null); // Resetea el panel lateral al sacar el mouse
          }}
        >
          {/* Botón principal de productos */}
          <Link to="/tienda" className="btn-productos" style={{textDecoration: 'none'}}>Productos ▾</Link>
          
          {mostrarDropdown && (
            <div className="dropdown-menu">
              {categorias.map(categoria => {
                const tieneSub = categoria.subcategorias && categoria.subcategorias.length > 0;
                
                return (
                  <div 
                    key={categoria.id} 
                    className="dropdown-item-wrapper"
                    onMouseEnter={() => setCategoriaHover(categoria.id)}
                  >
                    <Link to={`/tienda/${formatearURL(categoria.nombre)}`} className="dropdown-item-link">
                      <span>{categoria.nombre}</span>
                      {/* Flecha condicional si tiene subcategorías */}
                      {tieneSub && <span className="dropdown-arrow">▸</span>}
                    </Link>
                    
                    {/* PANEL LATERAL DE SUBCATEGORÍAS (Aparece a la derecha) */}
                    {tieneSub && categoriaHover === categoria.id && (
                      <div className="subcategorias-panel-lateral">
                        {categoria.subcategorias.map(sub => (
                          <Link 
                            key={sub.id} 
                            to={`/tienda/${formatearURL(categoria.nombre)}/${formatearURL(sub.nombre)}`}
                            className="subcategoria-link"
                          >
                            {sub.nombre}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enlaces de navegación rápida */}
        <div className="navbar-links">
          <Link to="/destacados">Destacado</Link>
          <Link to="/mis-pedidos">Mis Pedidos</Link>
          <Link to="/armar-pc">Servicios</Link>
        </div>

        {/* Ícono de Carrito y Globito de Contador */}
        <Link to="/carrito" className="navbar-carrito" style={{ position: 'relative' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          
          {/* El badge solo se dibuja si hay más de 0 ítems en el carrito */}
          {totalItemsCount > 0 && (
            <span className="carrito-badge-count">{totalItemsCount}</span>
          )}
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;