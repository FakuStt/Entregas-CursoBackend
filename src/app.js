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
import homeRoute from "./routes/home.router.js";
import realTimeProductsRoute from "./routes/realtimeproducts.router.js";
import userRouter from "./routes/users.router.js"
import { getProducts, addProduct, deleteProduct } from "./utils.js";


//No me anduvo importar el dirname desde utils, acudi a esta solucion
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://facu12345:facu12345@cluster0.0zg4wjj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

.then(()=> {
    console.log("Conectado a la DB")
})
.catch(error=>{
    console.error("No se pudo conectar a la DB",error)
})

//Rutas
app.use("/api/carts", cartRoute);
app.use("/api/products", productsRoute);
app.use("/", homeRoute);
app.use("/realtimeproducts", realTimeProductsRoute);
app.use("/user", userRouter)

app.engine('handlebars', handlebars.engine());

app.set('views', path.join(__dirname ,'views'));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

const server = http.createServer(app);
const socketServer = new Server(server);

socketServer.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
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
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
