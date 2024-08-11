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
import userRouter from "./routes/users.router.js";
import userModel from "./models/user.model.js";
import cartModel from "./models/cart.model.js";
import productModel from "./models/products.model.js";

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

// Configuración de Handlebars como motor de plantillas
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
app.use("/user", userRouter);

// Configuración de servidor HTTP y Socket.io
const httpServer = http.createServer(app);
const socketServer = new Server(httpServer);

socketServer.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
    // Emitir productos al conectar
    socket.on('getProducts', async () => {
        try {
            const products = await productModel.find();
            socket.emit('updateProducts', products); // Envía los productos de vuelta al cliente con un evento personalizado
        } catch (error) {
            console.error('Error fetching products:', error);
            socket.emit('updateProductsError', { error: 'Failed to fetch products' }); // Envía un error si ocurre
        }
    });
    

    // Emitir carritos al conectar
    socket.on('getCarts', async () => {
        try {
            const carts = await cartModel.find();
            socket.emit('updateCarts', carts); // Envía los carritos de vuelta al cliente con un evento personalizado
        } catch (error) {
            console.error('Error fetching carts:', error);
            socket.emit('updateCartsError', { error: 'Failed to fetch carts' }); // Envía un error si ocurre
        }
    });
    

    // Crear carrito
    socket.on('createCart', async () => {
        const newCart = new cartModel({ products: [] });
        await newCart.save();
        socketServer.emit('updateCarts', await cartModel.find());
    });

    // Vaciar carrito
    socket.on('emptyCart', async (cartId) => {
        const cart = await cartModel.findById(cartId);
        if (cart) {
            cart.products = [];
            await cart.save();
            socketServer.emit('updateCarts', await cartModel.find());
        }
    });

    // Eliminar carrito
    socket.on('deleteCart', async (cartId) => {
        await cartModel.findByIdAndDelete(cartId);
        socketServer.emit('updateCarts', await cartModel.find());
    });

    // Agregar producto
    socket.on('newProduct', async (productData) => {
        const newProduct = new productModel(productData);
        await newProduct.save();
        socketServer.emit('updateProducts', await productModel.find());
    });

    // Modificar producto
    socket.on('updateProduct', async (productData) => {
        await productModel.findByIdAndUpdate(productData.id, productData, { new: true });
        socketServer.emit('updateProducts', await productModel.find());
    });

    // Eliminar producto
    socket.on('deleteProduct', async (productId) => {
        await productModel.findByIdAndDelete(productId);
        socketServer.emit('updateProducts', await productModel.find());
    });

    // Agregar producto al carrito
    socket.on('addProductToCart', async ({ cartId, productId }) => {
        const cart = await cartModel.findById(cartId);
        if (cart) {
            const existingProduct = cart.products.find(p => p.product.toString() === productId);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }
            await cart.save();
            socketServer.emit('updateCarts', await cartModel.find());
        }
    });

    // Actualizar cantidad de producto en carrito
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

