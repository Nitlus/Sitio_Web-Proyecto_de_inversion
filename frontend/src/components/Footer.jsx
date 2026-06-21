import '../css/Footer.css';

function Footer() {
  return (
    <footer className="sitio-footer">
      <div className="footer-contenido">
        
        {/* Sucursales y Horarios */}
        <div className="footer-seccion">
          <h3>Nuestras Sucursales</h3>
          <p>📍 Centro: Av. Colón 450, Córdoba Capital</p>
          <p>📍 Zona Norte: Rafael Núñez 3820, Cerro de las Rosas</p>
          <p>⏰ Horarios: Lunes a Viernes de 09:00 a 19:00 hs. Sábados de 09:00 a 13:00 hs.</p>
        </div>

        {/* Contacto directo */}
        <div className="footer-seccion">
          <h3>Contacto</h3>
          <p>📞 Teléfono: +54 (351) 424-9999</p>
          <p>💬 WhatsApp Ventas: +54 9 351 234-5678</p>
          <p>✉️ Email: soporte@tuempresa.com</p>
        </div>

        {/* Redes Sociales */}
        <div className="footer-seccion">
          <h3>Seguinos</h3>
          <div className="redes-enlaces">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">X (Twitter)</a>
          </div>
        </div>

      </div>
      <div className="footer-derechos">
        <p>&copy; {new Date().getFullYear()} Tu Empresa Computación. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;