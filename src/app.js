import express from "express";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import http from "http";
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import FileStore from "session-file-store";
import MongoStore from "connect-mongo";
import bodyParser from "body-parser"

// Importar rutas y modelos
import cartRoute from "./routes/cart.router.js";
import productsRoute from "./routes/products.router.js";
import viewsRoute from "./routes/views.router.js";
import sessionsRoute from "./routes/sessions.js";
import cartModel from "./models/cart.model.js";
import productModel from "./models/products.model.js";
import { agregarCarrito } from "./utils.js";
import { getProducts } from "./utils.js";


// const fileStorage = FileStore(session) NO SE USA, PASAMOS A GUADRAR LAS SESSION EN MONGODB

// Resolver __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Middleware para parseo de JSON y datos de formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    //store: new fileStorage({path:'/session', ttl: 100, retries: 0}),
    secret: 'secretCoder',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://facu12345:facu12345@cluster0.0zg4wjj.mongodb.net/coderbase?retryWrites=true&w=majority&appName=Cluster0"
    }),
}))


// Conectar a la base de datos
mongoose.connect("mongodb+srv://facu12345:facu12345@cluster0.0zg4wjj.mongodb.net/coderbase?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Conectado a la DB"))
    .catch(error => console.error("No se pudo conectar a la DB", error));

//app.engine('handlebars', handlebars.engine());
app.engine('handlebars', handlebars.engine({
    extname: '.handlebars',
    defaultLayout: 'main',
}))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use("/api/carts", cartRoute);
app.use("/api/products", productsRoute);
app.use("/", viewsRoute);
app.use("/api/sessions", sessionsRoute);


/* SESSION - CODIGO

    
    app.get('/', (req,res)=>{
        if(req.session.views){
            req.session.counter++;
            res.send(`Se ha visitado el sitio ${req.session.views} veces`)
        }else{
            req.session.views = 1;
            res.send(`<p>Visitas: ${req.session.views}</p>`)
        }
    })

   app.get('/session', (req,res)=>{
    if(req.session.counter){
        req.session.counter++;
        res.send(`Se ha visitado el sitio ${req.session.counter} veces`)
    }else{
        req.session.counter = 1;
        res.send(`Bienvenido`)
    }
})

app.get('/logout', (req,res)=>{
    req.session.destroy(err => {
        if (!err){
            res.clearCookie("connect.sid");
            res.send("Logout OK");
        } else {
            res.send({status: "Error al intentar salir", body: err})
        }
    })
})

app.get('/login',(req,res)=>{
    const {user, password} = req.query
    if(user !== "coder" || password !== "house"){
        res.send("Usuario o contrase'a incorrecta")
    } else{
        req.session.user = user;
        req.session.admin = true;
        res.send("Login OK")
    }
})

function auth(req,res,next){
    if (req.session?.user === "coder" && req.session?.admin){
        return next()
    } else{
        res.send("No estas autorizado")
    }
}

app.get('/privado', auth, (req,res)=>{
    res.send("Bienvenido a la seccion privada")
}) */


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

