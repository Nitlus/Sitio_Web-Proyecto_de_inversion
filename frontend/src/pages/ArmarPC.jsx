import '../css/ArmarPC.css';

function ArmarPC() {
  const whatsappServicios = '5493517568602';

  const servicios = [
    {
      id: 'srv-limpieza-profunda',
      nombre: 'Limpieza profunda + pasta térmica',
      descripcion: 'Limpieza interna completa del equipo, remoción de polvo, revisión de temperaturas y cambio de pasta térmica.',
      precio: 55000,
      detalleTurno: 'Quiero sacar un turno para limpieza profunda con cambio de pasta térmica.',
      icono: '🧹'
    },
    {
      id: 'srv-reinstalacion-windows',
      nombre: 'Reinstalación de Windows',
      descripcion: 'Reinstalación del sistema operativo, configuración inicial y puesta a punto básica para dejar el equipo listo para usar.',
      precio: 75000,
      detalleTurno: 'Quiero sacar un turno para reinstalación de Windows.',
      icono: '💿'
    },
    {
      id: 'srv-ssd-ram',
      nombre: 'Instalación SSD / Upgrade RAM',
      descripcion: 'Instalación de unidad SSD, ampliación de memoria RAM y verificación de reconocimiento correcto del hardware.',
      precio: 50000,
      detalleTurno: 'Quiero sacar un turno para instalación de SSD o upgrade de RAM.',
      icono: '🧩'
    },
    {
      id: 'srv-diagnostico-reparacion',
      nombre: 'Diagnóstico + reparación hardware',
      descripcion: 'Diagnóstico técnico de fallas, revisión de componentes y coordinación de reparación según disponibilidad de repuestos.',
      precio: 90000,
      detalleTurno: 'Quiero sacar un turno para diagnóstico y reparación de hardware.',
      icono: '🔧'
    },
    {
      id: 'srv-armado-medida',
      nombre: 'Armado de PC a medida',
      descripcion: 'Ensamblaje profesional de PC, organización de cables, instalación inicial y revisión de funcionamiento general.',
      precio: 65000,
      detalleTurno: 'Quiero sacar un turno para armado de PC a medida.',
      icono: '⚙️'
    },
    {
      id: 'srv-mantenimiento-empresa',
      nombre: 'Mantenimiento preventivo empresa',
      descripcion: 'Servicio mensual para empresas: revisión preventiva, limpieza, control de estado y soporte técnico programado.',
      precio: 120000,
      periodo: '/mes',
      detalleTurno: 'Quiero consultar por mantenimiento preventivo mensual para empresa.',
      icono: '🏢'
    }
  ];

  const obtenerLinkWhatsapp = (servicio) => {
    const mensaje = [
      'Hola Titan Forge, quiero consultar por servicios técnicos.',
      servicio.detalleTurno,
      'Mi nombre es:',
      'Mi equipo/modelo es:',
      'Disponibilidad para turno:'
    ].join('\n');

    return `https://wa.me/${whatsappServicios}?text=${encodeURIComponent(mensaje)}`;
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
              <span className="precio-etiqueta">Precio orientativo</span>
              <span className="precio-valor">
                ${servicio.precio.toLocaleString('es-AR')}
                {servicio.periodo && <small>{servicio.periodo}</small>}
              </span>
              <span className="precio-descuento">Turnos y detalles finales se coordinan por WhatsApp.</span>
            </div>

            <a 
              className="btn-contratar-servicio"
              href={obtenerLinkWhatsapp(servicio)}
              target="_blank"
              rel="noreferrer"
            >
              Solicitar turno por WhatsApp
            </a>
          </div>
        ))}
      </div>

      <div className="servicios-info-adicional">
        <h3>📌 Información Importante</h3>
        <ul>
          <li>Los equipos para mantenimiento deben ser entregados en nuestra sucursal.</li>
          <li>El armado de PC incluye garantía de 6 meses sobre el ensamblaje.</li>
          <li>Los turnos y presupuestos se coordinan por WhatsApp con el área de ventas y servicios.</li>
        </ul>
      </div>
    </div>
  );
}

export default ArmarPC;
