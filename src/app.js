import express from "express";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import http from "http";
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import bodyParser from "body-parser";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import db from "./config/database.js";
import dotenv from "dotenv"
import cors from "cors"
import { addProductToCart } from "./utils.js";

// Importar rutas y modelos
import cartRoute from "./routes/cart.router.js";
import productsRoute from "./routes/products.router.js";
import viewsRoute from "./routes/views.router.js";
import sessionsRoute from "./routes/sessions.js";
import cartModel from "./dao/models/cart.model.js";
import productModel from "./dao/models/products.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.PRIVATE_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        mongoOptions: {},
        ttl: 500
    }),
}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize())
app.use(passport.session())
// app.use(cors())
initializePassport()

app.engine('handlebars', handlebars.engine({
    extname: '.handlebars',
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');


// Rutas
app.use("/api/carts", cartRoute);
app.use("/api/products", productsRoute);
app.use("/", viewsRoute);
app.use("/api/sessions", sessionsRoute);



// Configuración de servidor HTTP y Socket.io
const httpServer = http.createServer(app);
const socketServer = new Server(httpServer);

socketServer.on('connection', socket => {
    console.log("Nuevo cliente conectado");

    socket.on('updateProduct', async (productData) => {
        try {
            await productModel.findByIdAndUpdate(productData.id, productData, { new: true });
            // Emitir evento para actualizar la lista de productos en el cliente
            socketServer.emit('productListUpdated', await productModel.find());
        } catch (error) {
            console.error('Error actualizando producto:', error);
            socket.emit('errorMessage', 'Error al actualizar el producto');
        }
    });

    // Manejar la adición de productos
    socket.on('addProduct', async (productData, callback) => {
        try {
            const newProduct = new productModel(productData);
            await newProduct.save();
            // Emitir evento para actualizar la lista de productos en el cliente
            socketServer.emit('productListUpdated', await productModel.find());
            callback({ success: true });
        } catch (error) {
            console.error('Error agregando producto:', error);
            callback({ success: false, message: 'Error al agregar el producto' });
        }
    });

    // Manejar la eliminación de productos
    socket.on('deleteProduct', async (productId) => {
        try {
            await productModel.findByIdAndDelete(productId);
            // Emitir evento para actualizar la lista de productos en el cliente
            socketServer.emit('productListUpdated', await productModel.find());
        } catch (error) {
            console.error('Error eliminando producto:', error);
            socket.emit('errorMessage', 'Error al eliminar el producto');
        }
    });

    socket.on('deleteProductCart', async (productId) => {
        if (!productId || productId.trim() === '') {
            console.error('ID de producto no válido:', productId);
            return;
        }
    
        try {
            await cartModel.findByIdAndDelete(productId);
            console.log('Producto eliminado con ID:', productId);
        } catch (error) {
            console.error('Error eliminando producto:', error);
        }
    });
    

    socket.on('createCart', async () => {
        try {
            const newCart = new cartModel({ products: [] });
            await newCart.save();
            socketServer.emit('cartListUpdated', await cartModel.find());
        } catch (error) {
            console.error('Error creando carrito:', error);
            socket.emit('errorMessage', 'Error al crear el carrito');
        }
    });

    // Manejar el vaciado de carritos
    socket.on('emptyCart', async (cartId) => {
        try {
            const cart = await cartModel.findById(cartId);
            if (cart) {
                cart.products = [];
                await cart.save();
                socketServer.emit('cartListUpdated', await cartModel.find());
            }
        } catch (error) {
            console.error('Error vaciando carrito:', error);
            socket.emit('errorMessage', 'Error al vaciar el carrito');
        }
    });

    // Manejar la eliminación de carritos
    socket.on('deleteCart', async (cartId) => {
        try {
            await cartModel.findByIdAndDelete(cartId);
            socketServer.emit('cartListUpdated', await cartModel.find());
        } catch (error) {
            console.error('Error eliminando carrito:', error);
            socket.emit('errorMessage', 'Error al eliminar el carrito');
        }
    });

    socket.on('modifyProductQuantity', async ({ cartId, productId, quantity }) => {
        try {
            console.log("estos son los ids:")
            console.log(cartId);
            console.log(productId);
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                return socket.emit('errorMessage', 'Carrito no encontrado');
            }
    
            const productIndex = cart.products.findIndex(product => product.productId.toString() === productId);
            if (productIndex === -1) {
                return socket.emit('errorMessage', 'Producto no encontrado en el carrito');
            }
    
            // Asegúrate de que quantity sea un número válido
            quantity = parseInt(quantity, 10);
            if (isNaN(quantity) || quantity <= 0) {
                return socket.emit('errorMessage', 'Cantidad no válida');
            }
    
            // Actualizar la cantidad del producto
            cart.products[productIndex].quantity = quantity;
            await cart.save();
    
            // Emitir evento para actualizar la lista de carritos
            socketServer.emit('cartListUpdated', await cartModel.find());
        } catch (error) {
            console.error('Error actualizando la cantidad del producto en el carrito:', error);
            socket.emit('errorMessage', 'Error al modificar la cantidad del producto');
        }
    });
    

    // Manejar la adición de productos a carritos
    socket.on('addProductToCart', async (data) => {
        try {
            const { productId, cartId, quantity } = data;
    
            // Verificar que productId no esté undefined
            if (!productId || !cartId || !quantity) {
                socket.emit('errorMessage', 'Faltan datos requeridos.');
                return;
            }
    
            // Busca el carrito por ID
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                socket.emit('errorMessage', 'Carrito no encontrado.');
                return;
            }
    
            // Verifica si el producto ya está en el carrito
            const productIndex = cart.products.findIndex(p => p.product == productId);
            if (productIndex > -1) {
                // Si el producto ya está en el carrito, actualiza la cantidad
                cart.products[productIndex].quantity += parseInt(quantity);
            } else {
                // Si el producto no está en el carrito, agrégalo
                cart.products.push({ product: productId, quantity: parseInt(quantity) });
            }
    
            // Guarda el carrito actualizado
            await cart.save();
            socket.emit('cartListUpdated', cart);
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error.message);
            socket.emit('errorMessage', 'Hubo un error al agregar el producto al carrito.');
        }
    });

    
    

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar el servidor
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

