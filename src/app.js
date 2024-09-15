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

// Importar rutas y modelos
import cartRoute from "./routes/cart.router.js";
import productsRoute from "./routes/products.router.js";
import viewsRoute from "./routes/views.router.js";
import sessionsRoute from "./routes/sessions.js";
import cartModel from "./models/cart.model.js";
import productModel from "./models/products.model.js";

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
initializePassport()

app.engine('handlebars', handlebars.engine({
    extname: '.handlebars',
    defaultLayout: 'main',
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

    // Manejar la adición de productos a carritos
    socket.on('addProductToCart', async ({ cartId, productId }) => {
        try {
            const cart = await cartModel.findById(cartId);
            if (cart) {
                // Asumiendo que tienes una función para agregar el producto al carrito
                cart.products.push({ product: productId, quantity: 1 });
                await cart.save();
                socketServer.emit('cartListUpdated', await cartModel.find());
            }
        } catch (error) {
            console.error('Error agregando producto al carrito:', error);
            socket.emit('errorMessage', 'Error al agregar producto al carrito');
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado'); // Muestra mensaje cuando un cliente se desconecta
    });
});

// Iniciar el servidor
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

