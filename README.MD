# Proyecto Final - Backend I

## Alumno: Facundo Stazione

## Descripción

Este proyecto es un sistema de ecommerce desarrollado como parte del curso "Backend I". La aplicación proporciona una API para gestionar productos y carritos de compra, con funcionalidades completas de CRUD (Crear, Leer, Actualizar y Eliminar), así como opciones para paginación y filtrado. Además, la aplicación integra funcionalidades en tiempo real usando Socket.io y permite una interfaz de usuario enriquecida con Handlebars y SweetAlert2.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript del lado del servidor.
- **Express**: Framework para Node.js para facilitar el desarrollo de aplicaciones web.
- **MongoDB**: Base de datos NoSQL para el almacenamiento de datos.
- **Handlebars**: Motor de plantillas para renderizar vistas en el servidor.

## Dependencias

- `express`: Framework para crear aplicaciones web en Node.js.
- `express-handlebars`: Motor de plantillas para Express.
- `mongoose`: Librería para modelar datos en MongoDB.
- `mongoose-paginate-v2`: Plugin para paginación de resultados en Mongoose.
- `multer`: Middleware para la gestión de archivos subidos.
- `socket.io`: Librería para la comunicación en tiempo real.
- `sweetalert2`: Librería para la creación de alertas bonitas y funcionales.

## Endpoints de la API

### Productos

- **`GET /api/products`**
  - **Descripción**: Obtiene todos los productos, con soporte para paginación y filtrado.
  - **Parámetros Opcionales**:
    - `limit`: Número de productos a devolver (por defecto es 10).
    - `page`: Número de página a devolver (por defecto es 1).
    - `sort`: Ordenar productos por precio (`asc` o `desc`).
    - `query`: Filtro por categoría o disponibilidad.

- **`GET /api/products/:pid`**
  - **Descripción**: Obtiene un producto específico por su ID.

- **`POST /api/products`**
  - **Descripción**: Crea un nuevo producto con los datos proporcionados en el cuerpo de la solicitud.

- **`PUT /api/products/:pid`**
  - **Descripción**: Actualiza un producto existente por su ID.

- **`DELETE /api/products`**
  - **Descripción**: Elimina un producto por su ID.

### Carritos

- **`GET /api/carts/:cid`**
  - **Descripción**: Obtiene un carrito específico por su ID.

- **`POST /api/carts`**
  - **Descripción**: Crea un nuevo carrito.

- **`POST /:cid/product/:pid`**
  - **Descripción**: Agrega un producto a un carrito específico por sus IDs.

- **`DELETE /:cid/product/:pid`**
  - **Descripción**: Elimina un producto de un carrito específico por sus IDs.

- **`PUT /:cid`**
  - **Descripción**: Actualiza un carrito específico por su ID.

- **`PUT /:cid/product/:pid`**
  - **Descripción**: Actualiza la información de un producto en un carrito específico por sus IDs.

- **`DELETE /:cid`**
  - **Descripción**: Elimina un carrito por su ID.

### Interfaz de Usuario

- **`GET /`**
  - **Descripción**: Muestra la lista de productos con su información correspondiente.

- **`GET /realtimeproducts`**
  - **Descripción**: Proporciona una vista en tiempo real de productos y carritos, con botones para ejecutar todas las funcionalidades anteriores.

## Instalación

1. Clona el repositorio: `git clone <URL_DEL_REPOSITORIO>`
2. Navega al directorio del proyecto: `cd <DIRECTORIO_DEL_PROYECTO>`
3. Instala las dependencias: `npm install`
4. Configura las variables de entorno si es necesario.
5. Inicia el servidor: `npm start`

### Gracias por llegar hasta aca
