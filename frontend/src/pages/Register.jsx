import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Auth.css';

function Register() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    telefono: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Petición POST de registro hacia tu API
      const respuesta = await fetch('http://localhost:3000/api/usuarios/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          dni: formData.dni,
          telefono: formData.telefono,
          contraseña: formData.password // Ajustado a Sequelize
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error al crear la cuenta. Revisa los datos.');
      }

      alert('¡Cuenta creada con éxito! Ahora podés iniciar sesión.');
      navigate('/login'); // Lo mandamos a loguearse

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-wide">
        <h2 className="auth-titulo">Crear Cuenta</h2>
        <p className="auth-subtitulo">Completá tus datos para registrarte en la plataforma.</p>

        {error && <div className="auth-error-alerta">⚠️ {error}</div>}

        <form onSubmit={manejarSubmit} className="auth-formulario">
          <div className="auth-grid-inputs">
            <div className="auth-input-group">
              <label>Nombre *</label>
              <input type="text" name="nombre" placeholder="Juan" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="auth-input-group">
              <label>Apellido *</label>
              <input type="text" name="apellido" placeholder="Pérez" value={formData.apellido} onChange={handleChange} required />
            </div>

            <div className="auth-input-group">
              <label>Email *</label>
              <input type="email" name="email" placeholder="juan@correo.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="auth-input-group">
              <label>DNI / CUIT *</label>
              <input type="text" name="dni" placeholder="12345678" value={formData.dni} onChange={handleChange} required />
            </div>

            <div className="auth-input-group">
              <label>Teléfono *</label>
              <input type="tel" name="telefono" placeholder="+54 9 351 1234567" value={formData.telefono} onChange={handleChange} required />
            </div>

            <div className="auth-input-group">
              <label>Contraseña *</label>
              <input type="password" name="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn-auth-enviar" disabled={cargando}>
            {cargando ? 'Procesando registro...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-footer-link">
          ¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión acá</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;