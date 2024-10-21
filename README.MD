# Proyecto Final - Backend II - Coderhouse

## Descripción
Este es un Backend de ecommerce desarrollado como proyecto final del curso Backend II de Coderhouse. La aplicación permite a los usuarios gestionar un carrito de compras, navegar y filtrar productos, y finalizar compras generando un ticket con la información correspondiente. Los administradores pueden gestionar productos (crear, modificar y eliminar), mientras que los usuarios tienen acceso a todas las funcionalidades del carrito, incluida la compra de productos, ver detalles, modificar cantidades, entre otras.

## Tecnologías Utilizadas
- Node.js
- Express.js
- MongoDB con Mongoose
- Handlebars
- Passport (JWT y GitHub OAuth)
- Twilio (para envío de SMS)
- Nodemailer (para envío de correos)
- Multer (para subida de archivos)
- SweetAlert2 (para notificaciones)

## Instalación
1. Clonar este repositorio.
2. Ejecutar `npm install` para instalar las dependencias necesarias.
3. Configurar las variables de entorno. Un archivo `.env.example` está disponible como referencia.
    ```bash
    cp .env.example .env
    ```
4. Ejecutar el servidor:
    ```bash
    npm start
    ```

## Funcionalidades Principales
### Gestión del Carrito:
- Agregar productos al carrito.
- Eliminar productos del carrito.
- Actualizar la cantidad de productos.
- Ver el carrito completo con el detalle de productos.
- Finalizar la compra generando un ticket. El usuario recibe un correo con los detalles de la compra mediante Nodemailer.
- Control de stock: si el usuario intenta comprar más del stock disponible, el sistema le mostrará una alerta.

### Administración de Productos:
- Los usuarios con rol de administrador pueden gestionar los productos.
- Crear, modificar o eliminar productos desde la interfaz de administración.

### Filtrado y Visualización de Productos:
- Filtrado de productos por precio (menor a mayor y mayor a menor).
- Visualización de detalles de productos.

### Autenticación:
- Registro de usuarios.
- Ingreso de usuarios con sesión persistente usando JWT.
- Autenticación vía GitHub OAuth.
- Reestablecimiento de contraseñas.

### Notificaciones:
- Envío de SMS usando Twilio para confirmar acciones importantes.

## Estructura del Proyecto
El proyecto sigue una estructura organizada por carpetas para separar las responsabilidades:
- `src/config`: Configuración de base de datos y autenticación.
- `src/controllers`: Lógica de negocio y manejo de las rutas.
- `src/dao`: Acceso a datos y modelos de la base de datos (DAO).
- `src/middleware`: Middlewares para autenticación y autorización.
- `src/public`: Archivos públicos, incluyendo el archivo CSS.
- `src/routes`: Definición de las rutas de la aplicación.
- `src/views`: Vistas Handlebars para las distintas páginas de la aplicación.

## Rutas
Las principales rutas de la aplicación se dividen en:
- **Carritos (/api/carts)**:
    - Crear, modificar, eliminar y vaciar carritos.
    - Agregar productos a carritos y finalizar la compra.
- **Productos (/api/products)**:
    - Listar productos, con paginación y filtrado.
    - Agregar, modificar y eliminar productos (para administradores).
- **Sesiones (/api/sessions)**:
    - Registro, inicio de sesión, logout.
    - Autenticación vía GitHub.
    - Reestablecimiento de contraseñas.
- **Vistas (/**):
    - Visualización de productos para usuarios y administradores.
    - Páginas de registro, inicio de sesión y perfil de usuario.

## Estructura Detallada
### Controllers:
- `cart.controller.js`: Controlador para manejar la lógica de los carritos.
- `product.controller.js`: Controlador para productos.
- `session.controller.js`: Controlador para el manejo de sesiones (login, logout, etc.).
- `user.controller.js`: Controlador para la gestión de usuarios.
- `view.controller.js`: Controlador para renderizar vistas Handlebars.

### DAO:
- `cart.dao.js`: Acceso a la base de datos para carritos.
- `product.dao.js`: Acceso a la base de datos para productos.
- `user.dao.js`: Acceso a la base de datos para usuarios.

### Models:
- `cart.model.js`: Modelo de Mongoose para carritos.
- `products.model.js`: Modelo de Mongoose para productos.
- `ticket.model.js`: Modelo de Mongoose para tickets.
- `user.model.js`: Modelo de Mongoose para usuarios.

## Variables de Entorno
Las siguientes variables de entorno deben configurarse en el archivo `.env`:
- `MONGO_URI`: URL de conexión a MongoDB.
- `JWT_SECRET`: Secreto para firmar los tokens JWT.
- `GITHUB_CLIENT_ID`: ID del cliente para autenticación con GitHub.
- `GITHUB_CLIENT_SECRET`: Secreto del cliente para autenticación con GitHub.
- `TWILIO_SMS_NUMBER`: Número de Twilio para enviar SMS.
- `EMAIL_HOST`: Host para Nodemailer (por ejemplo, Gmail).
- `EMAIL_PORT`: Puerto para Nodemailer.
- `EMAIL_USER`: Usuario para autenticación en el servicio de correo.
- `EMAIL_PASS`: Contraseña o API key para el servicio de correo.

## ¡Gracias por haber llegado hasta aquí!

