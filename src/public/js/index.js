// index.js
import { getProducts } from "../utils.js";

// Esta función puede ser llamada desde cualquier lugar donde necesites manipular los productos
export function setupRealTimeProducts(io) {
    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado a realTimeProducts');
        
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
            console.log('Cliente desconectado de realTimeProducts');
        });
    });
}



