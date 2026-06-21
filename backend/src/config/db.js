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
		usuario_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
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

module.exports = {
	sequelize,
	Sequelize,
	conectarBaseDeDatos,
	Usuario,
	Categoria,
	Producto,
	Pedido,
	DetallePedido,
};
