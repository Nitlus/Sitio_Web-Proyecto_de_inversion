import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import '../css/CatalogoProductos.css';

// ✨ LA MAGIA DE VITE: Carga un índice de TODAS las imágenes en las subcarpetas
const todasLasImagenes = import.meta.glob('../assets/productos/**/*.{jpg,png,webp,avif}', { 
  eager: true, 
  import: 'default' 
});

function CatalogoProductos() {
  // Capturamos los parámetros de la URL (Ej: /tienda/placas-de-video/nvidia)
  const { categoria, subcategoria } = useParams();
  
  // Capturamos si viene de la barra de búsqueda (Ej: /tienda?nombre=ryzen)
  const [searchParams, setSearchParams] = useSearchParams();
  const busqueda = searchParams.get('nombre');
  const orden = searchParams.get('orden') || '';

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Bandera para saber si el componente sigue visible en pantalla
    let estaMontado = true;

    // 2. Encapsulamos la lógica en una función asíncrona para evitar el error de renderizado en cascada
    const obtenerProductos = async () => {
      // Usamos una función de callback: Solo lo pone en true si estaba en false (ej: al cambiar de categoría)
      setCargando(prev => prev ? prev : true);
      
      try {
        const urlParams = new URLSearchParams();
        if (categoria) urlParams.append('categoria', categoria);
        if (subcategoria) urlParams.append('subcategoria', subcategoria);
        if (busqueda) urlParams.append('nombre', busqueda);
        if (orden) urlParams.append('orden', orden);

        const respuesta = await fetch(`http://localhost:3000/api/productos?${urlParams.toString()}`);
        const datos = await respuesta.json();

        // 3. Solo actualizamos el estado si el usuario NO se fue a otra página
        if (estaMontado) {
          setProductos(datos);
        }
      } catch (err) {
        console.error("Error al cargar el catálogo:", err);
      } finally {
        // Quitamos el loader pase lo que pase, pero solo si seguimos en la página
        if (estaMontado) {
          setCargando(false);
        }
      }
    };

    obtenerProductos();

    // 4. Función de limpieza (Cleanup): Se dispara si el usuario cambia rápido a otra categoría
    return () => {
      estaMontado = false;
    };
  }, [categoria, subcategoria, busqueda, orden]);

  const cambiarOrden = (e) => {
    const nuevoOrden = e.target.value;
    const nuevosParametros = new URLSearchParams(searchParams);

    if (nuevoOrden) {
      nuevosParametros.set('orden', nuevoOrden);
    } else {
      nuevosParametros.delete('orden');
    }

    setSearchParams(nuevosParametros);
  };

  // Función inteligente usando import.meta.glob para buscar la imagen por nombre
  const obtenerRutaImagen = (producto) => {
    try {
      // 1. Tomamos el nombre y reemplazamos espacios y %
      const nombreFormateado = producto.nombre
        .replace(/ /g, '_')
        .replace(/%/g, '') // ✨ FIX: Elimina los porcentajes
        .toLowerCase();
      
      // 2. Buscamos en el índice de Vite el archivo que coincida con ese nombre
      const rutaEncontrada = Object.keys(todasLasImagenes).find(rutaRelativa => {
        return rutaRelativa.toLowerCase().includes(`/${nombreFormateado}.`);
      });

      // 3. Si lo encuentra, devuelve la imagen exacta (.avif, .webp, etc.). Si no, el placeholder.
      return rutaEncontrada ? todasLasImagenes[rutaEncontrada] : 'https://via.placeholder.com/250?text=Sin+Imagen';
    } catch {
      return 'https://via.placeholder.com/250?text=Error';
    }
  };

  // Generamos un título dinámico para la pantalla
  const generarTitulo = () => {
    if (busqueda) return `Resultados de búsqueda: "${busqueda}"`;
    if (subcategoria) return `${categoria.replace(/-/g, ' ')} > ${subcategoria.replace(/-/g, ' ')}`;
    if (categoria) return categoria.replace(/-/g, ' ');
    return 'Catálogo Completo';
  };

  return (
    <div className="catalogo-container">
      <div className="catalogo-header">
        <h1 className="catalogo-titulo">{generarTitulo()}</h1>

        <label className="catalogo-orden-control">
          <span>Ordenar por</span>
          <select value={orden} onChange={cambiarOrden}>
            <option value="">Predeterminado</option>
            <option value="alfabetico_az">Nombre (A-Z)</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
          </select>
        </label>
      </div>

      {cargando ? (
        <div className="catalogo-loader">Cargando productos...</div>
      ) : productos.length === 0 ? (
        <div className="catalogo-vacio">
          <h3>No encontramos productos para esta sección.</h3>
          <p>Revisá tu búsqueda o seleccioná otra categoría en el menú.</p>
        </div>
      ) : (
        <div className="grilla-productos">
          {productos.map(producto => (
            <Link key={producto.id} to={`/producto/${producto.id}`} className="tarjeta-producto">
              
              {/* Contenedor de la Imagen */}
              <div className="tarjeta-imagen-caja">
                <img 
                  src={obtenerRutaImagen(producto)} 
                  alt={producto.nombre} 
                  className="tarjeta-imagen"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/250?text=Sin+Imagen' }} // Fallback
                />
              </div>

              {/* Contenedor de la Información */}
              <div className="tarjeta-info">
                <h3 className="tarjeta-nombre" title={producto.nombre}>
                  {producto.nombre}
                </h3>
                
                <div className="tarjeta-precios">
                  {/* Precio calculado dinámicamente con 15% OFF */}
                  <span className="precio-transferencia">
                    ${(producto.precio * 0.85).toLocaleString('es-AR')}
                  </span>
                  <span className="etiqueta-pago">Precio Especial Efectivo / Transferencia</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default CatalogoProductos;
