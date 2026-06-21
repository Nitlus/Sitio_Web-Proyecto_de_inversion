import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Petición exacta a tu controlador de usuarios en el backend
      const respuesta = await fetch('http://localhost:3000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contraseña: password }) // Coincide con tu modelo de Sequelize
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Credenciales inválidas. Inténtalo de nuevo.');
      }

      // Guardamos la sesión en el estado global (localStorage + React State)
      login(datos.usuario, datos.token);
      
      alert(`¡Bienvenido de nuevo, ${datos.usuario.nombre}!`);
      navigate('/'); // Redirige a la página principal

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-titulo">Iniciar Sesión</h2>
        <p className="auth-subtitulo">Ingresá a tu cuenta para gestionar tus pedidos gamer.</p>

        {error && <div className="auth-error-alerta">⚠️ {error}</div>}

        <form onSubmit={manejarSubmit} className="auth-formulario">
          <div className="auth-input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="auth-input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-auth-enviar" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-footer-link">
          ¿No tenés una cuenta? <Link to="/register">Registrate acá</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;