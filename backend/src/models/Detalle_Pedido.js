import crypto from 'crypto';

export class Detalle_Pedido {
    constructor(id_detalle, id_pedido, id_producto, cantidad, precio_unitario) {
        this.id_detalle = id_detalle;
        this.pedido_id = id_pedido;
        this.producto_id = id_producto;
        this.cantidad = cantidad;
        this.precio_unitario = precio_unitario;
    }

    // Getters
    getId() {
        return this.id_detalle;
    }

    getDetalleId() {
        return this.id_detalle;
    }

    getPedidoId() {
        return this.pedido_id;
    }

    getProductoId() {
        return this.producto_id;
    }

    getCantidad() {
        return this.cantidad;
    }

    getPrecioUnitario() {
        return this.precio_unitario;
    }

    // Setters
    setId(id_detalle) {
        this.id_detalle = id_detalle;
    }

    setDetalleId(id_detalle) {
        this.id_detalle = id_detalle;
    }

    setPedidoId(id_pedido) {
        this.pedido_id = id_pedido;
    }

    setProductoId(id_producto) {
        this.producto_id = id_producto;
    }

    setCantidad(cantidad) {
        this.cantidad = cantidad;
    }

    setPrecioUnitario(precio_unitario) {
        this.precio_unitario = precio_unitario;
    }

    // Hash
    getHash() {
        const data = `${this.pedido_id}-${this.producto_id}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}