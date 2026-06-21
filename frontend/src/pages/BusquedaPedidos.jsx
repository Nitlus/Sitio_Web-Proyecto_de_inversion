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

    // MAGIA FRONTEND: Extraemos solo los números del texto ingresado.
    // Así, si escriben "INV-45", "orden 45" o "45", siempre obtenemos el ID real (45)
    // para pasárselo a nuestra vista de DetallePedido.
    const matchNumerico = codigoLimpio.match(/\d+/);

    if (matchNumerico) {
      const idPedido = matchNumerico[0];
      navigate(`/pedido/${idPedido}`);
    } else {
      setError('El código ingresado no es válido. Debe contener el número de la orden.');
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
            ¿Compraste como invitado? Ingresá el ID de tu orden o el código temporal que te enviamos al correo para conocer el estado de tu hardware.
          </p>
        )}

        {error && <div className="busqueda-error">⚠️ {error}</div>}

        <form onSubmit={manejarBusqueda} className="busqueda-formulario">
          <input 
            type="text" 
            placeholder="Ej: 1254 o INV-1254" 
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
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