import crypto from 'crypto';

export class Pedido {
    constructor(id, codigo, id_usuario, fecha, hora, total, estado, metodo_pago, metodo_envio, costo_envio, direccion_envio, telefono_contacto, email_contacto) {
        this.id = id;
        this.codigo = codigo;
        this.usuario_id = id_usuario;
        this.fecha = fecha;
        this.hora = hora;
        this.total = total;
        this.estado = estado;
        this.metodo_pago = metodo_pago;
        this.metodo_envio = metodo_envio;
        this.costo_envio = costo_envio;
        this.direccion_envio = direccion_envio;
        this.telefono_contacto = telefono_contacto;
        this.email_contacto = email_contacto;
    }

    // Getters
    getId() {
        return this.id;
    }

    getCodigo() {
        return this.codigo;
    }

    getUsuarioId() {
        return this.usuario_id;
    }

    getClienteId() {
        return this.getUsuarioId();
    }

    getFecha() {
        return this.fecha;
    }

    getHora() {
        return this.hora;
    }

    getTotal() {
        return this.total;
    }

    getEstado() {
        return this.estado;
    }

    getMetodoPago() {
        return this.metodo_pago;
    }

    getMetodoEnvio() {
        return this.metodo_envio;
    }

    getCostoEnvio() {
        return this.costo_envio;
    }

    getDireccionEnvio() {
        return this.direccion_envio;
    }

    getTelefonoContacto() {
        return this.telefono_contacto;
    }

    getEmailContacto() {
        return this.email_contacto;
    }

    // Setters
    setId(id) {
        this.id = id;
    }

    setCodigo(codigo) {
        this.codigo = codigo;
    }

    setUsuarioId(id_usuario) {
        this.usuario_id = id_usuario;
    }

    setClienteId(id_cliente) {
        this.setUsuarioId(id_cliente);
    }

    setFecha(fecha) {
        this.fecha = fecha;
    }

    setHora(hora) {
        this.hora = hora;
    }

    setTotal(total) {
        this.total = total;
    }

    setEstado(estado) {
        this.estado = estado;
    }

    setMetodoPago(metodo_pago) {
        this.metodo_pago = metodo_pago;
    }

    setMetodoEnvio(metodo_envio) {
        this.metodo_envio = metodo_envio;
    }

    setCostoEnvio(costo_envio) {
        this.costo_envio = costo_envio;
    }

    setDireccionEnvio(direccion_envio) {
        this.direccion_envio = direccion_envio;
    }

    setTelefonoContacto(telefono_contacto) {
        this.telefono_contacto = telefono_contacto;
    }

    setEmailContacto(email_contacto) {
        this.email_contacto = email_contacto;
    }

    // Hash
    getHash() {
        const data = `${this.codigo}-${this.usuario_id}-${this.fecha}-${this.hora}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}
