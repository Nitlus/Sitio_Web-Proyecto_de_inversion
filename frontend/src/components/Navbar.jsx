import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Navbar.css';

function Navbar() {
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const navigate = useNavigate();

  // 1. Efecto para buscar las categorías de tu backend Node.js
  useEffect(() => {
    fetch('http://localhost:3000/api/categorias')
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
      // Redirige a la página de catálogo aplicando el filtro por nombre
      navigate(`/tienda?nombre=${busqueda}`);
    }
  };

  // Función auxiliar para transformar "Placas de Video" en "placas-de-video" para la URL
  const formatearURL = (texto) => texto.toLowerCase().replace(/\s+/g, '-');

  return (
    <header className="navbar-container">
      
      {/* --- 1RA FILA --- */}
      <div className="navbar-fila-1">
        {/* Logo / Nombre */}
        <Link to="/" className="navbar-logo">
          TU EMPRESA
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

        {/* Botones de Autenticación */}
        <div className="navbar-auth">
          <Link to="/login" className="btn-login">Ingresar</Link>
          <Link to="/register" className="btn-register">Registrarse</Link>
        </div>
      </div>

      <hr className="navbar-divider" />

      {/* --- 2DA FILA --- */}
      <nav className="navbar-fila-2">
        
        {/* Botón Productos (Menú Desplegable) */}
        <div 
          className="dropdown-container"
          onMouseEnter={() => setMostrarDropdown(true)}
          onMouseLeave={() => setMostrarDropdown(false)}
        >
          <button className="btn-productos">Productos ▾</button>
          
          {mostrarDropdown && (
            <div className="dropdown-menu">
              {categorias.map(categoria => (
                <div key={categoria.id} className="dropdown-item">
                  <Link to={`/tienda/${formatearURL(categoria.nombre)}`}>
                    <strong>{categoria.nombre}</strong>
                  </Link>
                  
                  {/* Subcategorías de este padre */}
                  {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                    <div className="subcategorias-lista">
                      {categoria.subcategorias.map(sub => (
                        <Link 
                          key={sub.id} 
                          to={`/tienda/${formatearURL(categoria.nombre)}/${formatearURL(sub.nombre)}`}
                        >
                          {sub.nombre}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enlaces de navegación rápida */}
        <div className="navbar-links">
          <Link to="/destacados">Destacado</Link>
          <Link to="/mis-pedidos">Mis Pedidos</Link>
          <Link to="/armar-pc">Armar mi PC</Link>
        </div>

        {/* Ícono de Carrito (Usando SVG de forma nativa) */}
        <Link to="/carrito" className="navbar-carrito">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;