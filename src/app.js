import express from "express";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import http from "http";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from "mongoose";

//Importo rutas y funciones
import cartRoute from "./routes/cart.router.js";
import productsRoute from "./routes/products.router.js";
import viewsRoute from "./routes/views.router.js";
import userRouter from "./routes/users.router.js"
import { getProducts, addProduct, deleteProduct } from "./utils.js";
import userModel from "./models/user.model.js";
import cartModel from "./models/cart.model.js";
import productModel from "./models/products.model.js";


//No me anduvo importar el dirname desde utils, acudi a esta solucion
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://facu12345:facu12345@cluster0.0zg4wjj.mongodb.net/coderbase?retryWrites=true&w=majority&appName=Cluster0")

.then(()=> {
    console.log("Conectado a la DB")
})
.catch(error=>{
    console.error("No se pudo conectar a la DB",error)
})

/*  CONECTAR CON LA DB Y BUSCAR EN USUARIOS POR INDICE AQUELLOS QUE TENGAN EL NOMBRE CHESS
const environment = async () => {
    await mongoose.connect("mongodb+srv://facu12345:facu12345@cluster0.0zg4wjj.mongodb.net/coderbase?retryWrites=true&w=majority&appName=Cluster0");
    let response = await userModel
        .find({first_name: "Chess"})
        .explain("executionStats");
    console.log(response);
}

environment();
*/

//Rutas
app.use("/api/carts", cartRoute);
app.use("/api/products", productsRoute);
app.use("/", viewsRoute);
app.use("/realtimeproducts", viewsRoute);
app.use("/user", userRouter)

app.engine('handlebars', handlebars.engine());

app.set('views', path.join(__dirname ,'views'));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

const server = http.createServer(app);
const socketServer = new Server(server);

socketServer.on('connection', (socket) => {

    console.log('Nuevo cliente conectado');
    
    // Obtener productos
    socket.on('getProducts', async (callback) => {
        const products = await productModel.find();
        callback(products);
    });

    // Obtener carritos
    socket.on('getCarts', async (callback) => {
        const carts = await cartModel.find();
        callback(carts);
    });

    // Crear carrito
    socket.on('createCart', async () => {
        const newCart = new cartModel({ products: [] });
        await newCart.save();
        socketServer.emit('updateCarts', await cartModel.find());
        socket.emit('cartCreated', newCart._id);
    });

    // Vaciar carrito
    socket.on('emptyCart', async (cartId) => {
        const cart = await cartModel.findById(cartId);
        if (cart) {
            cart.products = [];
            await cart.save();
            socketServer.emit('updateCarts', await cartModel.find());
            socket.emit('cartEmptied', cartId);
        }
    });

    // Eliminar carrito
    socket.on('deleteCart', async (cartId) => {
        await cartModel.findByIdAndDelete(cartId);
        socketServer.emit('updateCarts', await cartModel.find());
        socket.emit('cartDeleted', cartId);
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
            const product = await productModel.findById(productId);
            if (product) {
                const existingProduct = cart.products.find(p => p.product.toString() === productId.toString());
                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    cart.products.push({ product: productId, quantity: 1 });
                }
                await cart.save();
                socketServer.emit('updateCarts', await cartModel.find());
            }
        }
    });

    // Actualizar cantidad de producto en carrito
    socket.on('updateProductQuantity', async ({ cartId, productId, quantity }) => {
        const cart = await cartModel.findById(cartId);
        if (cart) {
            const product = cart.products.find(p => p.product.toString() === productId.toString());
            if (product) {
                product.quantity = quantity;
                await cart.save();
                socketServer.emit('updateCarts', await cartModel.find());
            }
        }
    })

    /*
    // ENVIAR LISTA ACTUALIZADA A CLIENTE
    socket.emit('updateProducts', getProducts());

    // MANEJAR LA ADICION DE UN PRODUCTO
    socket.on('newProduct', (product) => {
        addProduct(product);
        socketServer.emit('updateProducts', getProducts());
    });

    // MANEJAR LA ELIMINACIO DE UN PRODUCTO
    socket.on('productsEliminado', (id) => {
        deleteProduct(id);
        socketServer.emit('updateProducts', getProducts());
    });

    // MANEJAR LA DESCONECCION DEL USUARIO
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
    */
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
