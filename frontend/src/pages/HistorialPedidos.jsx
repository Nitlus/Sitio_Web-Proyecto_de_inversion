import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/HistorialPedidos.css';

function HistorialPedidos() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let estaMontado = true;

    const obtenerHistorial = async () => {
      try {
        // Hacemos la petición al endpoint protegido de pedidos
        const respuesta = await fetch('http://localhost:3000/api/pedidos', {
          headers: {
            // Enviamos el token JWT para que el backend reconozca al usuario de forma segura
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!respuesta.ok) throw new Error('No se pudo recuperar tu historial de compras.');

        const datos = await respuesta.json();
        
        if (estaMontado) {
          setPedidos(datos);
          setCargando(false);
        }
      } catch (err) {
        console.error(err);
        if (estaMontado) {
          setError(err.message);
          setCargando(false);
        }
      }
    };

    obtenerHistorial();

    return () => {
      estaMontado = false;
    };
  }, []);

  if (cargando) {
    return <div className="historial-loading">Cargando tu panel de cliente y compras pasadas...</div>;
  }

  return (
    <div className="historial-page-container">
      {/* Miga de pan / Breadcrumb */}
      <div className="historial-breadcrumb">
        <Link to="/">Inicio</Link> / <span>Mis Pedidos</span>
      </div>

      <div className="historial-header-bloque">
        <h1>Mi Historial de Pedidos</h1>
        <p>Hola, <strong>{usuario?.nombre || 'Gamer'}</strong>. Acá podés revisar el estado de tus compras de hardware y servicios técnicos en tiempo real.</p>
      </div>

      {error ? (
        <div className="historial-error-alerta">⚠️ {error}</div>
      ) : pedidos.length === 0 ? (
        <div className="historial-vacio-card">
          <div className="vacio-icono">🛒</div>
          <h2>Todavía no realizaste ninguna compra</h2>
          <p>Tus futuros componentes gamer, configuraciones o mantenimientos técnicos aparecerán listados en este panel.</p>
          <Link to="/tienda" className="btn-ir-catalogo">Explorar Tienda</Link>
        </div>
      ) : (
        /* Tabla Profesional de Historial de Órdenes */
        <div className="table-responsive-wrapper">
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>N° Orden</th>
                <th>Fecha</th>
                <th>Método de Pago</th>
                <th>Entrega</th>
                <th>Total Neto</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => {
                // Formateamos la fecha al formato estándar argentino
                const fechaFormateada = new Date(pedido.createdAt || pedido.fecha).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });

                return (
                  <tr key={pedido.id}>
                    {/* Número de Pedido */}
                    <td className="col-id">#{pedido.id}</td>
                    
                    {/* Fecha */}
                    <td>{fechaFormateada}</td>
                    
                    {/* Método de Pago */}
                    <td className="txt-capitalizar">
                      {pedido.metodo_pago || pedido.metodoPago || 'No especificado'}
                    </td>
                    
                    {/* Logística */}
                    <td>
                      {pedido.metodo_envio === 'domicilio' ? '🚚 Envío' : '📍 Retiro'}
                    </td>
                    
                    {/* Precio Final */}
                    <td className="col-total">
                      ${Number(pedido.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    
                    {/* Badge Dinámico de Estado */}
                    <td>
                      <span className={`status-badge-tabla ${pedido.estado}`}>
                        {pedido.estado ? pedido.estado.replace(/_/g, ' ') : 'Pendiente'}
                      </span>
                    </td>
                    
                    {/* Botón Puente a la Hoja de Ruta Individual */}
                    <td>
                      <Link to={`/pedido/${pedido.id}`} className="btn-tabla-ver">
                        Ver Detalles
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistorialPedidos;