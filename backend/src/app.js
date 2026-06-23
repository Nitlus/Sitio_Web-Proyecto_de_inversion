const express = require('express');
const cors = require('cors');

const { seedDatabase } = require('../scripts/seed');
const { sequelize, Usuario, Categoria, Producto, Pedido, DetallePedido, asegurarEsquemaPedidos } = require('./config/db');
const { cargarUsuarioOpcional } = require('./middlewares/auth');
const usuariosRoutes = require('./routes/usuarios_routes');
const categoriasRoutes = require('./routes/categorias_routes');
const productosRoutes = require('./routes/productos_routes');
const pedidosRoutes = require('./routes/pedidos_routes');
const detallePedidosRoutes = require('./routes/detalle_pedidos_routes');

const app = express();

async function leerEstadoTablas() {
	const [usuarios, categorias, productos] = await Promise.all([
		Usuario.count(),
		Categoria.count(),
		Producto.count(),
	]);

	return {
		usuarios,
		categorias,
		productos,
	};
}

async function prepararBaseYSeedearSiHaceFalta() {
	try {
		await sequelize.authenticate();
		await sequelize.sync();
		await asegurarEsquemaPedidos();
		const estado = await leerEstadoTablas();
		const tablasConDatos = Object.values(estado).filter((total) => total > 0).length;
		const tablasVacias = Object.values(estado).filter((total) => total === 0).length;

		if (tablasConDatos > 0 && tablasVacias > 0) {
			throw new Error(
				`La base de datos quedó en un estado parcial: usuarios=${estado.usuarios}, categorias=${estado.categorias}, productos=${estado.productos}`
			);
		}

		if (tablasConDatos === 3) {
			console.log('La base de datos ya tiene datos cargados. No se ejecuta el seed.');
			return { seeded: false, estado };
		}

		await seedDatabase();
		return { seeded: true, estado: await leerEstadoTablas() };
	} catch (error) {
		throw error;
	}
}

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(cargarUsuarioOpcional);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/detalle-pedidos', detallePedidosRoutes);

app.use((req, res) => {
	res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
	const status = error.status || 500;
	res.status(status).json({ error: error.message || 'Error interno del servidor' });
});

async function bootstrap({ startServer = true } = {}) {
	await prepararBaseYSeedearSiHaceFalta();

	if (!startServer) {
		return app;
	}

	const port = Number(process.env.PORT || 3000);
	app.listen(port, () => {
		console.log(`Servidor escuchando en el puerto ${port}`);
	});

	return app;
}

if (require.main === module) {
	const seedOnly = process.argv.includes('--seed-only');
	bootstrap({ startServer: !seedOnly }).catch((error) => {
		console.error('Error iniciando la aplicación:', error);
		process.exitCode = 1;
	});
}

module.exports = {
	app,
	bootstrap,
	prepararBaseYSeedearSiHaceFalta,
	models: {
		Usuario,
		Categoria,
		Producto,
		Pedido,
		DetallePedido,
	},
};
