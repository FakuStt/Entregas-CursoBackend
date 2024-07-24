import { getProducts } from "../utils.js";

// FUNCION PARA MANIPULAR PRODUCTOS
export function setupRealTimeProducts(serverSocket) {
    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado a realTimeProducts');
        
        // ENVIAR LA LISTA DE LOS PRODUCTOS ACTUALIZADOS AL CLIENTE
        socket.emit('updateProducts', getProducts());

        // MANEJAR LA ADICION DE UN NUEVO PRODUCTO
        socket.on('newProduct', (product) => {
            addProduct(product);
            serverSocket.emit('updateProducts', getProducts());
        });

        // MANEJAR LA ELIMINACION DE UN PRODUCTO
        socket.on('productsEliminado', (id) => {
            deleteProduct(id);
            serverSocket.emit('updateProducts', getProducts());
        });

        // MANEJAR LA DESCONECCION DE UN CLIENTE
        socket.on('disconnect', () => {
            console.log('Cliente desconectado de realTimeProducts');
        });
    });
}



