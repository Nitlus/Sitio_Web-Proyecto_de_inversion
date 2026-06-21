import crypto from 'crypto';

export class Producto {
    constructor(id, nombre, descripcion, precio, stock, tipo_producto, condicion, categoria_id) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.tipo_producto = tipo_producto;
        this.condicion = condicion;
        this.categoria_id = categoria_id;
    }

    // Getters
    getId() {
        return this.id;
    }

    getNombre() {
        return this.nombre;
    }

    getDescripcion() {
        return this.descripcion;
    }

    getPrecio() {
        return this.precio;
    }

    getStock() {
        return this.stock;
    }

    getTipoProducto() {
        return this.tipo_producto;
    }

    getCondicion() {
        return this.condicion;
    }

    getCategoriaId() {
        return this.categoria_id;
    }

    // Setters
    setId(id) {
        this.id = id;
    }

    setNombre(nombre) {
        this.nombre = nombre;
    }

    setDescripcion(descripcion) {
        this.descripcion = descripcion;
    }

    setPrecio(precio) {
        this.precio = precio;
    }

    setStock(stock) {
        this.stock = stock;
    }

    setTipoProducto(tipo_producto) {
        this.tipo_producto = tipo_producto;
    }

    setCondicion(condicion) {
        this.condicion = condicion;
    }

    setCategoriaId(categoria_id) {
        this.categoria_id = categoria_id;
    }

    // Hash
    getHash() {
        const data = `${this.id}-${this.nombre}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}