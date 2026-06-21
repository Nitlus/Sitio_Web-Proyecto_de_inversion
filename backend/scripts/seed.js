const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const BCRYPT_SALT_ROUNDS = 10;


const { sequelize, Usuario, Categoria, Producto } = require('../src/config/db');

const usuariosCsvPath = path.join(__dirname, '..', 'usuarios_seed.csv');
const categoriasCsvPath = path.join(__dirname, '..', 'categorias_seed.csv');
const productosCsvPath = path.join(__dirname, '..', 'productos_por_categoria.csv');

function readCsv(filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`No existe el archivo CSV: ${filePath}`);
	}

	return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function parseCsv(text) {
	const rows = [];
	let currentRow = [];
	let currentField = '';
	let inQuotes = false;

	for (let index = 0; index < text.length; index += 1) {
		const character = text[index];
		const nextCharacter = text[index + 1];

		if (character === '"') {
			if (inQuotes && nextCharacter === '"') {
				currentField += '"';
				index += 1;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}

		if (character === ',' && !inQuotes) {
			currentRow.push(currentField);
			currentField = '';
			continue;
		}

		if ((character === '\n' || character === '\r') && !inQuotes) {
			if (character === '\r' && nextCharacter === '\n') {
				index += 1;
			}

			currentRow.push(currentField);
			currentField = '';

			if (currentRow.some((value) => value.trim() !== '')) {
				rows.push(currentRow);
			}

			currentRow = [];
			continue;
		}

		currentField += character;
	}

	if (currentField.length > 0 || currentRow.length > 0) {
		currentRow.push(currentField);
		if (currentRow.some((value) => value.trim() !== '')) {
			rows.push(currentRow);
		}
	}

	return rows;
}

function rowsToObjects(filePath) {
	const [headerRow, ...dataRows] = parseCsv(readCsv(filePath));

	if (!headerRow) {
		throw new Error(`El archivo CSV no tiene encabezado: ${filePath}`);
	}

	return dataRows.map((row) => {
		const record = {};
		headerRow.forEach((header, index) => {
			record[header] = row[index] ?? '';
		});
		return record;
	});
}

function toNumber(value) {
	const normalized = String(value ?? '').trim();
	if (normalized === '') {
		return null;
	}

	const numberValue = Number(normalized);
	if (Number.isNaN(numberValue)) {
		throw new Error(`No se pudo convertir a número: ${value}`);
	}

	return numberValue;
}

function hashPassword(value) {
	const password = String(value ?? '').trim();
	if (password === '') {
		return password;
	}

	if (/^\$2[aby]\$\d{2}\$/.test(password)) {
		return password;
	}

	return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);
}

async function seedDatabase() {
	const usuarios = rowsToObjects(usuariosCsvPath);
	const categorias = rowsToObjects(categoriasCsvPath);
	const productos = rowsToObjects(productosCsvPath);

	const transaction = await sequelize.transaction();
	try {
		await Usuario.bulkCreate(
			usuarios.map((usuario) => ({
				nombre: usuario.nombre,
				email: usuario.email,
				contraseña_hash: hashPassword(usuario['contraseña_hash']),
				rol: usuario.rol,
				es_invitado: toNumber(usuario.es_invitado) ?? 0,
			})),
			{ transaction }
		);

		await Categoria.bulkCreate(
			categorias.map((categoria) => ({
				id: toNumber(categoria.id),
				nombre: categoria.nombre,
				parent_id: toNumber(categoria.parent_id),
			})),
			{ transaction }
		);

		await Producto.bulkCreate(
			productos.map((producto) => ({
				nombre: producto.nombre,
				descripcion: producto.descripcion,
				precio: toNumber(producto.precio),
				stock: toNumber(producto.stock) ?? 0,
				tipo_producto: producto.tipo_producto,
				condicion: producto.condicion,
				categoria_id: toNumber(producto.categoria_id),
			})),
			{ transaction }
		);

		await transaction.commit();
	} catch (error) {
		await transaction.rollback().catch(() => {});
		throw error;
	}

	console.log(
		`Seed completado correctamente. Usuarios: ${usuarios.length}, categorías: ${categorias.length}, productos: ${productos.length}`
	);
	return {
		usuarios: usuarios.length,
		categorias: categorias.length,
		productos: productos.length,
	};
}

module.exports = {
	seedDatabase,
};
