import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import '../css/ArmarPC.css';

function ArmarPC() {
  const { agregarAlCarrito } = useCarrito();
  const navigate = useNavigate();

  // Definimos los servicios como "productos virtuales"
  const servicios = [
    {
      id: 'srv-mantenimiento',
      nombre: 'Servicio de Mantenimiento Preventivo y Limpieza',
      descripcion: 'Desarme completo, limpieza profunda con alcohol isopropílico, cambio de pasta térmica (Arctic MX-4), testeo de temperaturas y optimización de software.',
      precio: 80000,
      stock: 999, // Stock infinito
      condicion: 'servicio',
      icono: '🧹'
    },
    {
      id: 'srv-armado',
      nombre: 'Servicio de Armado de PC Custom',
      descripcion: 'Ensamblaje profesional de componentes, gestión de cables (cable management) premium, instalación de Windows, actualización de BIOS y estrés de componentes.',
      precio: 50000,
      stock: 999, // Stock infinito
      condicion: 'servicio',
      icono: '⚙️'
    }
  ];

  const contratarServicio = (servicio) => {
    // Lo agregamos al carrito (cantidad 1)
    agregarAlCarrito(servicio, 1);
    alert(`¡${servicio.nombre} añadido al carrito!`);
    // Opcional: Redirigir al carrito automáticamente para que paguen
    navigate('/carrito');
  };

  return (
    <div className="servicios-container">
      <div className="servicios-header">
        <h1 className="servicios-titulo">Área Técnica y Taller</h1>
        <p className="servicios-subtitulo">
          Confiá tu equipo a nuestros técnicos especializados. Utilizamos protocolos antiestáticos y herramientas de primera línea.
        </p>
      </div>

      <div className="tarjetas-servicios-layout">
        {servicios.map((servicio) => (
          <div key={servicio.id} className="tarjeta-servicio">
            <div className="servicio-icono">{servicio.icono}</div>
            <h2 className="servicio-nombre">{servicio.nombre}</h2>
            <p className="servicio-descripcion">{servicio.descripcion}</p>
            
            <div className="servicio-precio-caja">
              <span className="precio-etiqueta">Precio del Servicio:</span>
              <span className="precio-valor">${servicio.precio.toLocaleString('es-AR')}</span>
              <span className="precio-descuento">¡Aplica 15% OFF abonando en Transferencia!</span>
            </div>

            <button 
              className="btn-contratar-servicio"
              onClick={() => contratarServicio(servicio)}
            >
              Añadir servicio al carrito
            </button>
          </div>
        ))}
      </div>

      <div className="servicios-info-adicional">
        <h3>📌 Información Importante</h3>
        <ul>
          <li>Los equipos para mantenimiento deben ser entregados en nuestra sucursal (Av. Colón 450).</li>
          <li>El armado de PC incluye garantía de 6 meses sobre el ensamblaje.</li>
          <li>Si compraste los componentes en nuestra tienda, el costo de armado tiene prioridad en la fila de trabajo.</li>
        </ul>
      </div>
    </div>
  );
}

export default ArmarPC;