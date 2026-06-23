import '../css/Footer.css';

function Footer() {
  return (
    <footer className="sitio-footer">
      <div className="footer-contenido">
        
        {/* ✨ NUEVO: Sobre Nosotros */}
        <div className="footer-seccion footer-sobre-nosotros">
          <h3>Sobre Titan Forge</h3>
          <p>Somos una casa especializada en soluciones informáticas. Nos dedicamos a la venta de hardware de última generación, computadoras prearmadas y componentes refaccionados de alta calidad.</p>
          <p>Además, contamos con un taller técnico experto en armado, limpieza profunda y reparación de PCs para llevar tu setup al máximo rendimiento.</p>
        </div>

        {/* Sucursales y Horarios */}
        <div className="footer-seccion">
          <h3>Nuestras Sucursales</h3>
          <p>📍 Obispo Salguero 453, Nueva Córdoba </p>
          <p>⏰ Lunes a Viernes de 09:00 a 19:00 hs.<br/>Sábados de 09:00 a 13:00 hs.</p>
        </div>

        {/* Contacto directo */}
        <div className="footer-seccion">
          <h3>Contacto</h3>
          <p>📞 Teléfono: +54 9 3517 56-8602</p>
          <p>💬 WhatsApp Ventas y Servicios: +54 9 3517 56-8602</p>
          <p>✉️ Email: contacto@titanforge.com</p>
        </div>

        {/* Redes Sociales */}
        <div className="footer-seccion">
          <h3>Seguinos</h3>
          <div className="redes-enlaces">
            <a href="https://www.instagram.com/titanforgecba?igsh=MXNjMm1hb3JhczdlMg%3D%3D" target="_blank" rel="noreferrer" aria-label="Instagram de Titan Forge">
              <svg className="red-social-icono" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
              Instagram
            </a>
          </div>
        </div>

      </div>
      <div className="footer-derechos">
        <p>&copy; {new Date().getFullYear()} Titan Forge. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;