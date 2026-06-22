import '../css/Modal.css';

function Modal({
  abierto,
  titulo,
  mensaje,
  tipo = 'info',
  textoConfirmar = 'Aceptar',
  textoCancelar,
  onConfirmar,
  onCerrar,
}) {
  if (!abierto) return null;

  const manejarConfirmar = () => {
    if (onConfirmar) {
      onConfirmar();
      return;
    }

    onCerrar?.();
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onCerrar}>
      <div
        className={`modal-panel modal-${tipo}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-cerrar" type="button" onClick={onCerrar} aria-label="Cerrar modal">
          ×
        </button>

        <div className="modal-icono" aria-hidden="true">
          {tipo === 'success' ? '✓' : tipo === 'warning' ? '!' : 'i'}
        </div>

        <h2 id="modal-titulo">{titulo}</h2>
        {mensaje && <p>{mensaje}</p>}

        <div className="modal-acciones">
          {textoCancelar && (
            <button className="modal-btn modal-btn-secundario" type="button" onClick={onCerrar}>
              {textoCancelar}
            </button>
          )}
          <button className="modal-btn modal-btn-principal" type="button" onClick={manejarConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
