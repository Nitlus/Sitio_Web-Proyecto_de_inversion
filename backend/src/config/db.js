const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: path.join(__dirname, '..', '..', 'data', 'database.db'),
	logging: false,
});

const Usuario = sequelize.define(
	'Usuario',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		nombre: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		email: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true,
		},
		contraseña_hash: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		rol: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		es_invitado: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
	},
	{
		tableName: 'usuarios',
		timestamps: false,
	}
);

const Categoria = sequelize.define(
	'Categoria',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		nombre: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true,
		},
		parent_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
	},
	{
		tableName: 'categorias',
		timestamps: false,
	}
);

const Producto = sequelize.define(
	'Producto',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		nombre: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		descripcion: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		precio: {
			type: DataTypes.REAL,
			allowNull: false,
		},
		stock: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		tipo_producto: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		condicion: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		categoria_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		tableName: 'productos',
		timestamps: false,
	}
);

const Pedido = sequelize.define(
	'Pedido',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		codigo: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true,
			validate: {
				len: [5, 5],
				is: /^[A-Z0-9]{5}$/,
			},
		},
		usuario_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		fecha: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		hora: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		total: {
			type: DataTypes.REAL,
			allowNull: false,
		},
		estado: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		metodo_pago: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		metodo_envio: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		costo_envio: {
			type: DataTypes.REAL,
			allowNull: false,
			defaultValue: 0,
		},
		direccion_envio: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		telefono_contacto: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		email_contacto: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{
		tableName: 'pedidos',
		timestamps: false,
	}
);

const DetallePedido = sequelize.define(
	'DetallePedido',
	{
		id_detalle: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		pedido_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		producto_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		cantidad: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		precio_unitario: {
			type: DataTypes.REAL,
			allowNull: false,
		},
	},
	{
		tableName: 'detalle_pedido',
		timestamps: false,
	}
);

Categoria.hasMany(Categoria, {
	foreignKey: 'parent_id',
	as: 'subcategorias',
});

Categoria.belongsTo(Categoria, {
	foreignKey: 'parent_id',
	as: 'categoriaPadre',
});

Categoria.hasMany(Producto, {
	foreignKey: 'categoria_id',
	as: 'productos',
});

Producto.belongsTo(Categoria, {
	foreignKey: 'categoria_id',
	as: 'categoria',
});

Usuario.hasMany(Pedido, {
	foreignKey: 'usuario_id',
	as: 'pedidos',
});

Pedido.belongsTo(Usuario, {
	foreignKey: 'usuario_id',
	as: 'usuario',
});

Pedido.hasMany(DetallePedido, {
	foreignKey: 'pedido_id',
	as: 'detalles',
});

DetallePedido.belongsTo(Pedido, {
	foreignKey: 'pedido_id',
	as: 'pedido',
});

Producto.hasMany(DetallePedido, {
	foreignKey: 'producto_id',
	as: 'detallesPedido',
});

DetallePedido.belongsTo(Producto, {
	foreignKey: 'producto_id',
	as: 'producto',
});

async function conectarBaseDeDatos() {
	await sequelize.authenticate();
	return sequelize;
}

async function asegurarEsquemaPedidos() {
	const [columnas] = await sequelize.query('PRAGMA table_info(pedidos)');
	if (!Array.isArray(columnas) || columnas.length === 0) {
		return;
	}

	const columnasPorNombre = new Map(columnas.map((columna) => [columna.name, columna]));
	const faltaEmailContacto = !columnasPorNombre.has('email_contacto');
	const usuarioIdEsObligatorio = columnasPorNombre.get('usuario_id')?.notnull === 1;

	if (!faltaEmailContacto && !usuarioIdEsObligatorio) {
		return;
	}

	if (faltaEmailContacto) {
		await sequelize.query("ALTER TABLE pedidos ADD COLUMN email_contacto TEXT NOT NULL DEFAULT 'No informado'");
	}

	if (!usuarioIdEsObligatorio) {
		return;
	}

	await sequelize.query('PRAGMA foreign_keys = OFF');
	try {
		await sequelize.transaction(async (transaction) => {
			await sequelize.query(
				`
				CREATE TABLE pedidos_nueva (
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
				)
				`,
				{ transaction }
			);

			await sequelize.query(
				`
				INSERT INTO pedidos_nueva (
					id,
					codigo,
					usuario_id,
					fecha,
					hora,
					total,
					estado,
					metodo_pago,
					metodo_envio,
					costo_envio,
					direccion_envio,
					telefono_contacto,
					email_contacto
				)
				SELECT
					id,
					codigo,
					usuario_id,
					fecha,
					hora,
					total,
					estado,
					metodo_pago,
					metodo_envio,
					costo_envio,
					direccion_envio,
					telefono_contacto,
					email_contacto
				FROM pedidos
				`,
				{ transaction }
			);

			await sequelize.query('DROP TABLE pedidos', { transaction });
			await sequelize.query('ALTER TABLE pedidos_nueva RENAME TO pedidos', { transaction });
		});
	} finally {
		await sequelize.query('PRAGMA foreign_keys = ON');
	}
}

module.exports = {
	sequelize,
	Sequelize,
	conectarBaseDeDatos,
	asegurarEsquemaPedidos,
	Usuario,
	Categoria,
	Producto,
	Pedido,
	DetallePedido,
};
