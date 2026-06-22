import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/BusquedaPedidos.css';

function BusquedaPedidos() {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { usuario } = useAuth(); // Leemos si el usuario está logueado

  const manejarBusqueda = (e) => {
    e.preventDefault();
    setError('');

    const codigoLimpio = codigo.trim();

    if (!codigoLimpio) {
      setError('Por favor, ingresá un código de seguimiento.');
      return;
    }

    const codigoPedido = codigoLimpio.toUpperCase();
    const tieneFormatoCodigoPedido = /^[A-Z0-9]{5}$/.test(codigoPedido);
    const matchNumerico = codigoPedido.match(/^\d+$/);

    if (tieneFormatoCodigoPedido || matchNumerico) {
      navigate(`/pedido/${codigoPedido}`);
    } else {
      setError('El código ingresado no es válido. Debe tener 5 caracteres con letras mayúsculas y números.');
    }
  };

  return (
    <div className="busqueda-pedidos-container">
      <div className="busqueda-card">
        
        <div className="busqueda-icono">📦</div>
        <h1 className="busqueda-titulo">Rastrear mi Pedido</h1>
        
        {usuario ? (
          <p className="busqueda-subtitulo">
            Hola <strong className="texto-resaltado">{usuario.nombre}</strong>. Podés rastrear cualquier orden ingresando el código a continuación.
          </p>
        ) : (
          <p className="busqueda-subtitulo">
            ¿Compraste como invitado? Ingresá el código de pedido que te enviamos al correo para conocer el estado de tu hardware.
          </p>
        )}

        {error && <div className="busqueda-error">⚠️ {error}</div>}

        <form onSubmit={manejarBusqueda} className="busqueda-formulario">
          <input 
            type="text" 
            placeholder="Ej: A7K2P" 
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            maxLength={5}
            className="input-codigo"
            autoComplete="off"
          />
          <button type="submit" className="btn-buscar-pedido">
            Buscar Estado
          </button>
        </form>

        <div className="busqueda-ayuda">
          <p>💡 <strong>¿Dónde encuentro mi código?</strong></p>
          <p>Lo podés encontrar en el asunto del correo electrónico de confirmación que recibiste al finalizar el checkout, o en tu comprobante de pago.</p>
        </div>

      </div>
    </div>
  );
}

export default BusquedaPedidos;
