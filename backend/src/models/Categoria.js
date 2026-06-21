import crypto from 'crypto';

export class Categoria {
    constructor(id, nombre, parentId = null) {
        this.id = id;
        this.nombre = nombre;
        this.parentId = parentId;
    }

    // Getters
    getId() {
        return this.id;
    }

    getNombre() {
        return this.nombre;
    }

    // Setters
    setId(id) {
        this.id = id;
    }

    setNombre(nombre) {
        this.nombre = nombre;
    }

    setParentId(parentId) {
        this.parentId = parentId;
    }

    // Getter for parent category id (subcategorías)
    getParentId() {
        return this.parentId;
    }

    // Hash
    getHash() {
        return crypto.createHash('sha256').update(this.nombre).digest('hex');
    }
}
