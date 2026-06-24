import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Proveedores de Contextos Globales
import { AuthProvider, useAuth } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext'; // <-- AÑADIDO: Para que la Navbar y el Carrito se comuniquen

// Estructura Fija de la Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas / Vistas Solicitadas
import Home from './pages/Home';
import CatalogoProductos from './pages/CatalogoProductos';
import Producto from './pages/Producto';
import Login from './pages/Login';
import Register from './pages/Register';
import BusquedaPedidos from './pages/BusquedaPedidos';
import HistorialPedidos from './pages/HistorialPedidos';
import DetallePedido from './pages/DetallePedido';
import CarritoCompras from './pages/CarritoCompras';
import ResumenCompra from './pages/ResumenCompra'; // <-- AÑADIDO: La página de Checkout
import ArmarPC from './pages/ArmarPC';

/**
 * Componente Inteligente de Manejo de Pedidos (/mis-pedidos)
 */
function ControladorRutaPedidos() {
  const { usuario } = useAuth();
  return usuario ? <HistorialPedidos /> : <BusquedaPedidos />;
}

/**
 * Componente Puente para Destacados (/destacados)
 */
function RedireccionDestacado() {
  const [idDestacado, setIdDestacado] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('https://unclog-playmate-slush.ngrok-free.dev/api/productos?orden=mas_pedido', {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(res => res.json())
      .then(productos => {
        if (productos && productos.length > 0) {
          setIdDestacado(productos[0].id);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <Navigate to="/" replace />;
  if (!idDestacado) return <div style={{ color: 'white', padding: '40px' }}>Cargando producto destacado...</div>;

  return <Navigate to={`/producto/${idDestacado}`} replace />;
}

function App() {
  return (
    <AuthProvider>
      {/* 🛒 Envolvemos con CarritoProvider para que toda la app tenga acceso al chango de compras */}
      <CarritoProvider> 
        <BrowserRouter>
          <div className="app-layout">
            
            <Navbar />
            
            <main className="contenedor-principal">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tienda/:categoria?/:subcategoria?" element={<CatalogoProductos />} />
                <Route path="/producto/:id" element={<Producto />} />
                <Route path="/destacados" element={<RedireccionDestacado />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mis-pedidos" element={<ControladorRutaPedidos />} />
                <Route path="/pedido/:id" element={<DetallePedido />} />
                <Route path="/carrito" element={<CarritoCompras />} />
                
                {/* Ruta de Facturación y Cierre de compra */}
                <Route path="/resumen-compra" element={<ResumenCompra />} />
                
                {/* Ruta del Asistente Técnico */}
                <Route path="/armar-pc" element={<ArmarPC />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />

          </div>
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;
