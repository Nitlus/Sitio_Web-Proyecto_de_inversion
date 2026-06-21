import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 10;

export class Usuario {
    constructor(id, nombre, email, contraseña_hash, rol, es_invitado) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.contraseña_hash = contraseña_hash;
        this.rol = rol;
        this.es_invitado = es_invitado;
    }

    // Getters
    getId() {
        return this.id;
    }

    getNombre() {
        return this.nombre;
    }

    getEmail() {
        return this.email;
    }

    getContraseñaHash() {
        return this.contraseña_hash;
    }

    getRol() {
        return this.rol;
    }

    getEsInvitado() {
        return this.es_invitado;
    }

    // Setters
    setId(id) {
        this.id = id;
    }

    setNombre(nombre) {
        this.nombre = nombre;
    }

    setEmail(email) {
        this.email = email;
    }

    setContraseñaHash(contraseña_hash) {
        this.contraseña_hash = contraseña_hash;
    }

    setRol(rol) {
        this.rol = rol;
    }

    setEsInvitado(es_invitado) {
        this.es_invitado = es_invitado;
    }

    // Métodos de seguridad para contraseña
    hashPassword(password) {
        this.contraseña_hash = bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);
    }

    verifyPassword(password) {
        return bcrypt.compareSync(password, this.contraseña_hash);
    }

    // Hash
    getHash() {
        return bcrypt.hashSync(this.email, BCRYPT_SALT_ROUNDS);
    }
}