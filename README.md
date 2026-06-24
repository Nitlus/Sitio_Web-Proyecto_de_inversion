# Titan Forge

Titan Forge es un sitio web de e-commerce orientado a la venta de componentes de PC, PCs armadas y servicios técnicos. El proyecto permite navegar un catálogo de hardware, ver fichas de productos, agregar artículos al carrito, finalizar compras, consultar pedidos y acceder a un área de servicios para armado, mantenimiento y reparación de computadoras.

El sistema está dividido en dos partes principales:

- `frontend`: aplicación web desarrollada con React y Vite.
- `backend`: API REST desarrollada con Node.js, Express, Sequelize y SQLite.

## Herramientas externas utilizadas

- **ngrok**: se utiliza para exponer públicamente el backend local y consumirlo desde el frontend mediante la URL `https://unclog-playmate-slush.ngrok-free.dev`. En las peticiones se agrega el header `ngrok-skip-browser-warning` para evitar la pantalla intermedia de advertencia de ngrok.
- **Vercel**: se utiliza para desplegar el frontend. El archivo `frontend/vercel.json` redirige todas las rutas hacia `index.html`, permitiendo que React Router maneje la navegación del sitio.
- **DolarAPI**: el backend consulta `https://dolarapi.com/v1/dolares/bolsa` para obtener la cotización del dólar bolsa y convertir los precios cargados en dólares a pesos argentinos. La cotización se guarda en caché durante una hora y, si falla la API, se usa un valor de respaldo.
- **WhatsApp / wa.me**: se utiliza para contactar al área técnica y para enviar comprobantes o consultas vinculadas con pedidos y servicios.

## Lenguajes y tecnologías utilizadas

- **JavaScript**: lenguaje principal del frontend y backend.
- **JSX**: construcción de componentes y páginas en React.
- **HTML**: estructura base de la aplicación frontend.
- **CSS**: estilos del sitio, layouts, páginas y componentes.
- **Node.js**: entorno de ejecución del backend.
- **Express**: servidor web y definición de endpoints REST.
- **React**: construcción de la interfaz de usuario.
- **React Router DOM**: navegación interna del sitio.
- **Vite**: herramienta de desarrollo y build del frontend.
- **Sequelize**: ORM para modelar y consultar la base de datos.
- **SQLite**: base de datos local utilizada por el backend.
- **JWT**: autenticación mediante tokens.
- **Nodemailer**: envío de correos vinculados con pedidos.

## Páginas del sitio web

- **Inicio (`/`)**: muestra el carrusel principal de Titan Forge, un producto destacado y una vitrina de productos populares.
- **Catálogo (`/tienda/:categoria?/:subcategoria?`)**: lista productos, permite navegar por categorías/subcategorías, buscar por nombre y ordenar por precio, nombre o productos más pedidos.
- **Detalle de producto (`/producto/:id`)**: muestra la ficha técnica, imagen, stock, precios y permite seleccionar cantidad para agregar al carrito.
- **Producto destacado (`/destacados`)**: consulta el producto más pedido y redirige automáticamente a su ficha.
- **Login (`/login`)**: permite iniciar sesión con email y contraseña.
- **Registro (`/register`)**: permite crear una cuenta de cliente.
- **Mis pedidos (`/mis-pedidos`)**: si el usuario está logueado muestra su historial; si no lo está, muestra el formulario para rastrear un pedido por código.
- **Detalle de pedido (`/pedido/:id`)**: muestra el estado del pedido, datos de compra, método de pago/envío y productos incluidos.
- **Carrito (`/carrito`)**: permite revisar productos agregados, cambiar cantidades, eliminar artículos y avanzar al checkout.
- **Resumen de compra (`/resumen-compra`)**: checkout del pedido. Solicita datos personales, método de envío, método de pago, calcula costos y crea el pedido en el backend.
- **Área técnica (`/armar-pc`)**: muestra servicios técnicos disponibles, precios orientativos y links para solicitar turno por WhatsApp.

## Endpoints del backend

Base de la API: `/api`

### Usuarios

- `POST /api/usuarios/registro`: registra un cliente y devuelve usuario + token JWT.
- `POST /api/usuarios/login`: inicia sesión y devuelve usuario + token JWT.
- `GET /api/usuarios`: lista usuarios. Requiere rol `admin`.
- `GET /api/usuarios/:id`: obtiene un usuario por ID. Requiere rol `admin`.
- `POST /api/usuarios`: crea un usuario. Requiere rol `admin`.
- `PUT /api/usuarios/:id`: actualiza un usuario. Requiere rol `admin`.
- `DELETE /api/usuarios/:id`: elimina un usuario. Requiere rol `admin`.

### Categorías

- `GET /api/categorias`: lista categorías.
- `GET /api/categorias/:id`: obtiene una categoría por ID.
- `POST /api/categorias`: crea una categoría. Requiere rol `admin`.
- `PUT /api/categorias/:id`: actualiza una categoría. Requiere rol `admin`.
- `DELETE /api/categorias/:id`: elimina una categoría. Requiere rol `admin`.

### Productos

- `GET /api/productos`: lista productos. Acepta filtros como `nombre`, `categoria`, `subcategoria`, `orden` y `metodo_pago`.
- `GET /api/productos/:id`: obtiene el detalle de un producto.
- `POST /api/productos`: crea un producto. Requiere rol `admin`.
- `PUT /api/productos/:id`: actualiza un producto. Requiere rol `admin`.
- `DELETE /api/productos/:id`: elimina un producto. Requiere rol `admin`.

Valores usados para `orden`:

- `precio_asc`
- `precio_desc`
- `alfabetico_az`
- `alfabetico_za`
- `mas_pedido`

### Pedidos

- `GET /api/pedidos`: lista todos los pedidos. Requiere rol `admin`.
- `GET /api/pedidos/mis-pedidos`: lista pedidos del cliente autenticado.
- `GET /api/pedidos/:id`: obtiene un pedido por ID numérico o por código de pedido.
- `POST /api/pedidos`: crea un pedido. Puede ser de un cliente autenticado o de un invitado.
- `PUT /api/pedidos/:id`: actualiza un pedido. Requiere rol `admin`.
- `DELETE /api/pedidos/:id`: elimina un pedido. Requiere rol `admin`.

### Detalles de pedidos

- `GET /api/detalle-pedidos/pedido/:pedidoId`: lista detalles de un pedido. Requiere rol `admin`.
- `GET /api/detalle-pedidos/:id`: obtiene un detalle de pedido. Requiere rol `admin`.
- `POST /api/detalle-pedidos`: crea un detalle de pedido. Requiere rol `admin`.
- `PUT /api/detalle-pedidos/:id`: actualiza un detalle de pedido. Requiere rol `admin`.
- `DELETE /api/detalle-pedidos/:id`: elimina un detalle de pedido. Requiere rol `admin`.

## Librerías de Node.js utilizadas

### Backend

Dependencias principales:

- `bcryptjs`: encriptación y comparación de contraseñas.
- `cors`: habilitación de peticiones desde otros orígenes.
- `dotenv`: carga de variables de entorno.
- `express`: servidor HTTP y API REST.
- `jsonwebtoken`: generación y validación de tokens JWT.
- `nodemailer`: envío de correos de confirmación/notificación de pedidos.
- `sequelize`: ORM para interactuar con la base de datos.
- `sqlite3`: motor de base de datos SQLite.

Dependencia de desarrollo/ejecución local:

- `nodemon`: reinicio automático del servidor durante el desarrollo.

### Frontend

Dependencias principales:

- `react`: construcción de componentes de interfaz.
- `react-dom`: renderizado de React en el navegador.
- `react-router-dom`: rutas del sitio y navegación entre páginas.

Dependencias de desarrollo:

- `vite`: servidor de desarrollo y build del frontend.
- `@vitejs/plugin-react`: integración de React con Vite.
- `eslint`: análisis estático del código.
- `@eslint/js`: configuración base de ESLint.
- `eslint-plugin-react-hooks`: reglas para hooks de React.
- `eslint-plugin-react-refresh`: soporte de Fast Refresh.
- `globals`: definición de variables globales para ESLint.
- `@babel/core`: herramientas de transformación de JavaScript.
- `@rolldown/plugin-babel`: integración de Babel con Rolldown/Vite.
- `babel-plugin-react-compiler`: plugin del compilador de React.
- `@types/react`: tipos de React para tooling.
- `@types/react-dom`: tipos de React DOM para tooling.

## Funcionalidades principales

- Catálogo de productos con imágenes locales y filtros por categoría.
- Conversión de precios desde USD a ARS usando DolarAPI.
- Descuento del 15% para pagos por transferencia o efectivo.
- Carrito persistente mediante contexto de React.
- Checkout con retiro en sucursal, envío a domicilio y distintos métodos de pago.
- Generación de pedidos con código alfanumérico de seguimiento.
- Historial de pedidos para clientes autenticados.
- Búsqueda de pedidos por código para invitados.
- Notificaciones por correo mediante Nodemailer.
- Panel de endpoints administrativos para usuarios, categorías, productos, pedidos y detalles.
