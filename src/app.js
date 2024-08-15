import express from "express";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import http from "http";
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";

// Importar rutas y modelos
import cartRoute from "./routes/cart.router.js";
import productsRoute from "./routes/products.router.js";
import viewsRoute from "./routes/views.router.js";
import cartModel from "./models/cart.model.js";
import productModel from "./models/products.model.js";
import { agregarCarrito } from "./utils.js";

// Resolver __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Middleware para parseo de JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos
mongoose.connect("mongodb+srv://facu12345:facu12345@cluster0.0zg4wjj.mongodb.net/coderbase?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Conectado a la DB"))
    .catch(error => console.error("No se pudo conectar a la DB", error));

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use("/api/carts", cartRoute);
app.use("/api/products", productsRoute);
app.use("/", viewsRoute);
app.use("/realtimeproducts", viewsRoute);

// Configuración de servidor HTTP y Socket.io
const httpServer = http.createServer(app);
const socketServer = new Server(httpServer);

socketServer.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
    socket.on('getProducts', async () => {
    try {
        const products = await productModel.find();
        socketServer.emit('updateProducts', products); // Envía los productos de vuelta al cliente con un evento personalizado
    } catch (error) {
        console.error('Error fetching products:', error);
        socketServer.emit('updateProductsError', { error: 'Failed to fetch products' }); // Envía un error si ocurre
    }
    });
    
    socket.on('getCarts', async () => {
        try {
            const carts = await cartModel.find();
            socketServer.emit('updateCarts', carts); // Envía los carritos de vuelta al cliente con un evento personalizado
        } catch (error) {
            console.error('Error fetching carts:', error);
            socketServer.emit('updateCartsError', { error: 'Failed to fetch carts' }); 
        }
    });
    
    socket.on('createCart', async () => {
        const newCart = new cartModel({ products: [] });
        await newCart.save();
        const carts = await cartModel.find();
        socketServer.emit('updateCarts', carts);
    });

    socket.on('emptyCart', async (cartId) => {
        const cart = await cartModel.findById(cartId);
        if (cart) {
            cart.products = [];
            await cart.save();
            const carts = await cartModel.find();
            socketServer.emit('updateCarts', carts);
        }
    });

    socket.on('deleteCart', async (cartId) => {
        await cartModel.findByIdAndDelete(cartId);
        const carts = await cartModel.find();
        socketServer.emit('updateCarts', carts);
    });

    socket.on('addProduct', async (productData, callback) => {
        const newProduct = new productModel(productData);
        await newProduct.save();
        
        callback({ success: true });
        socketServer.emit('productListUpdated', await productModel.find()); // Emite el evento para actualización de productos
    });

    socket.on('updateProduct', async (productData) => {
        await productModel.findByIdAndUpdate(productData.id, productData, { new: true });
        socketServer.emit('productListUpdated', await productModel.find()); // Emite el evento para actualización de productos
    });

    socket.on('deleteProduct', async (productId) => {
        await productModel.findByIdAndDelete(productId);
        socketServer.emit('productListUpdated', await productModel.find()); // Emite el evento para actualización de productos
    });

    socket.on('addProductToCart', async ({ cartId, productId }, callback) => {
        try {
            const cart = agregarCarrito({ cartId, productId }, callback);
            console.log('Cart updated:', cart);
    
            if (typeof callback === 'function') {
                callback({ success: true });
            }
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            if (typeof callback === 'function') {
                callback({ success: false, message: 'Error interno del servidor' });
            }
        }
    });

    socket.on('updateProductQuantity', async ({ cartId, productId, quantity }) => {
        const cart = await cartModel.findById(cartId);
        if (cart) {
            const product = cart.products.find(p => p.product.toString() === productId);
            if (product) {
                product.quantity = quantity;
                await cart.save();
                socketServer.emit('updateCarts', await cartModel.find());
            }
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

