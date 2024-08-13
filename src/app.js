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
        socket.emit('updateProducts', products); // Envía los productos de vuelta al cliente con un evento personalizado
    } catch (error) {
        console.error('Error fetching products:', error);
        socket.emit('updateProductsError', { error: 'Failed to fetch products' }); // Envía un error si ocurre
    }
});
    
    socket.on('getCarts', async () => {
        try {
            const carts = await cartModel.find();
            socket.emit('updateCarts', carts); // Envía los carritos de vuelta al cliente con un evento personalizado
        } catch (error) {
            console.error('Error fetching carts:', error);
            socket.emit('updateCartsError', { error: 'Failed to fetch carts' }); 
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
    socket.on('addProduct', async (productData, callback) => {
            const newProduct = new productModel(productData);
            await newProduct.save();
            
            callback({ success: true });
            // Emitir el evento a todos los clientes conectados para actualizar la lista de productos en tiempo real
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
    socket.on('addProductToCart', async ({ cartId, productId }, callback) => {
        console.log('addProductToCart event received');
        console.log('cartId:', cartId);
        console.log('productId:', productId);
    
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                const message = 'Carrito no encontrado';
                console.error(message);
                if (typeof callback === 'function') {
                    return callback({ success: false, message });
                }
                return;
            }
    
            const product = await productModel.findById(productId);
            if (!product) {
                const message = 'Producto no encontrado';
                console.error(message);
                if (typeof callback === 'function') {
                    return callback({ success: false, message });
                }
                return;
            }
    
            // Verifica si el producto ya está en el carrito
            const existingProduct = cart.products.find(p => p.product.toString() === productId.toString());
            if (existingProduct) {
                // Incrementa la cantidad si ya existe
                existingProduct.quantity += 1;
                console.log('Product quantity updated:', existingProduct);
            } else {
                // Agrega el producto al carrito
                cart.products.push({ product: productId, quantity: 1 });
                console.log('Product added:', { product: productId, quantity: 1 });
            }
    
            await cart.save();
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

