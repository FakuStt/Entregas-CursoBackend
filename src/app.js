// app.js
import express from "express";
import cartRoute from "./routes/cart.router.js";
import productsRoute from "./routes/products.router.js";
import homeRoute from "./routes/home.router.js";
import realTimeProductsRoute from "./routes/realTimeProducts.router.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import __dirname from "./utils.js";
import { getProducts, addProduct, deleteProduct } from "./utils.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/carts", cartRoute);
app.use("/api/products", productsRoute);
app.use("/", homeRoute);
app.use("/realtimeproducts", realTimeProductsRoute);

app.engine('handlebars', handlebars.engine());

app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
    // Enviar la lista de productos actualizada al cliente
    socket.emit('updateProducts', getProducts());

    // Manejar la adición de un nuevo producto
    socket.on('newProduct', (product) => {
        addProduct(product);
        io.emit('updateProducts', getProducts());
    });

    // Manejar la eliminación de un producto
    socket.on('productsEliminado', (id) => {
        deleteProduct(id);
        io.emit('updateProducts', getProducts());
    });

    // Manejar la desconexión del cliente
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
