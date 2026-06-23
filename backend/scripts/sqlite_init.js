const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, '..', 'data', 'database.db');

function ejecutarSql(db, sql) {
    return new Promise((resolve, reject) => {
        db.exec(sql, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

async function CrearBaseDeDatos() {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    const db = new sqlite3.Database(dbPath);

    try {
        await ejecutarSql(db, `
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                contraseña_hash TEXT NOT NULL,
                rol TEXT NOT NULL,
                es_invitado INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS categorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL UNIQUE,
                parent_id INTEGER,
                FOREIGN KEY (parent_id) REFERENCES categorias(id)
                    ON UPDATE CASCADE
                    ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                precio REAL NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                tipo_producto TEXT NOT NULL,
                condicion TEXT NOT NULL,
                categoria_id INTEGER NOT NULL,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo TEXT NOT NULL UNIQUE CHECK(codigo GLOB '[A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9]'),
                usuario_id INTEGER,
                fecha TEXT NOT NULL,
                hora TEXT NOT NULL,
                total REAL NOT NULL,
                estado TEXT NOT NULL,
                metodo_pago TEXT NOT NULL,
                metodo_envio TEXT NOT NULL,
                costo_envio REAL NOT NULL DEFAULT 0,
                direccion_envio TEXT NOT NULL,
                telefono_contacto TEXT NOT NULL,
                email_contacto TEXT NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                    ON UPDATE CASCADE
                    ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS detalle_pedido (
                id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
                pedido_id INTEGER NOT NULL,
                producto_id INTEGER NOT NULL,
                cantidad INTEGER NOT NULL,
                precio_unitario REAL NOT NULL,
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT
            );
        `);

        console.log('Base de datos creada o verificada correctamente.');
    } finally {
        db.close();
    }
}

module.exports = {
    CrearBaseDeDatos,
};

if (require.main === module) {
    CrearBaseDeDatos().catch((error) => {
        console.error('Error creando la base de datos:', error);
        process.exitCode = 1;
    });
}
