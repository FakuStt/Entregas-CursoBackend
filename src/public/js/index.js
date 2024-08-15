const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    console.log("El DOM esta cargado");

    setupAddProductButton();

    crearCart();
});

async function getCarts() {
    try {
        const carts = await cartModel.find();
        socket.emit('updateCarts', carts); // Envía los carritos de vuelta al cliente con un evento personalizado
    } catch (error) {
        console.error('Error fetching carts:', error);
        socket.emit('updateCartsError', { error: 'Failed to fetch carts' }); 
    }
}

// Renderizar carritos
function renderCarts(carts) {
    socket.emit('getCarts');
}


// Solicitar productos
function getProducts() {
    socket.emit('getProducts');
}



// Crear nuevo carrito
function crearCart() {
    const crearCartButton = document.getElementById('crearCartButton');
    if (crearCartButton) {
        crearCartButton.addEventListener('click', () => {
            socket.emit('createCart');
        });
    }
}

// Vaciar carrito
function emptyCart(cartID) {
    Swal.fire({
        title: '¿Estás seguro de que deseas vaciar este carrito?',
        text: "Esta acción eliminará todos los productos del carrito.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            socket.emit('emptyCart', cartID);
        }
    });
}

// Eliminar carrito
function deleteCart(cartID) {
    Swal.fire({
        title: '¿Estás seguro de que deseas eliminar este carrito?',
        text: "Esta acción eliminará el carrito permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            socket.emit('deleteCart', cartID);
        }
    });
}

// Agregar producto a carrito
function addProductToCart(productID) {
    Swal.fire({
        title: 'Ingresa el ID del carrito para agregar el producto:',
        input: 'text',
        inputPlaceholder: 'ID del carrito',
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const enteredCartID = result.value;
            if (enteredCartID) {
                socket.emit('addProductToCart', { cartId: enteredCartID, productId: productID });
            } else {
                Swal.fire('Error', 'El ID del carrito no puede estar vacío', 'error');
            }
        }
    }).catch(error => {
        Swal.fire('Error', 'Hubo un problema al procesar tu solicitud', 'error');
        console.error('Error al procesar la solicitud:', error);
    });
}

// Modificar producto
function modifyProduct(productID) {
    Swal.fire({
        title: 'Modifica los datos del producto:',
        html: `
            <input id="title" class="swal2-input" type="text" placeholder="Título">
            <input id="description" class="swal2-input" type="text" placeholder="Descripción">
            <input id="price" class="swal2-input" type="number" placeholder="Precio">
            <input id="code" class="swal2-input" type="text" placeholder="Código">
            <input id="stock" class="swal2-input" type="number" placeholder="Stock">
            <select id="status" class="swal2-input">
                <option value="true">Disponible</option>
                <option value="false">No disponible</option>
            </select>
            <input id="category" class="swal2-input" type="text" placeholder="Categoría">
            <input id="thumbnails" class="swal2-input" type="text" placeholder="Thumbnails">
        `,
        focusConfirm: false,
        preConfirm: () => {
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const price = document.getElementById('price').value;
            const code = document.getElementById('code').value;
            const stock = document.getElementById('stock').value;
            const status = document.getElementById('status').value === 'true';
            const category = document.getElementById('category').value;
            const thumbnails = document.getElementById('thumbnails').value;

            if (!title || !description || !price || !code || !stock || !category || !thumbnails) {
                Swal.showValidationMessage('Todos los campos son obligatorios.');
                return false;
            }

            return {
                id: productID,
                title: title,
                description: description,
                price: parseFloat(price),
                code: code,
                stock: parseInt(stock, 10),
                status: status,
                category: category,
                thumbnails: thumbnails
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const updatedProduct = result.value;
            socket.emit('updateProduct', updatedProduct);
            Swal.fire('Producto modificado', 'Los datos del producto han sido actualizados exitosamente', 'success');
        }
    });
}

// Eliminar producto
function deleteProduct(productID) {
    Swal.fire({
        title: '¿Estás seguro de que deseas eliminar este producto?',
        text: "Esta acción eliminará el producto permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            socket.emit('deleteProduct', productID);
        }
    });
}

// Modificar cantidad de producto en carrito
function modifyProductQuantity(cartID, productID) {
    Swal.fire({
        title: 'Modificar cantidad del producto en el carrito',
        html: `
            <input id="quantity" class="swal2-input" type="number" placeholder="Cantidad">
        `,
        focusConfirm: false,
        preConfirm: () => {
            const quantity = document.getElementById('quantity').value;

            if (!quantity || quantity <= 0) {
                Swal.showValidationMessage('La cantidad debe ser mayor que 0.');
                return false;
            }

            return {
                cartId: cartID,
                productId: productID,
                quantity: parseInt(quantity, 10)
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const data = result.value;
            socket.emit('updateProductQuantity', data);
            Swal.fire('Cantidad actualizada', 'La cantidad del producto en el carrito ha sido actualizada', 'success');
        }
    });
}

// Agregar nuevo producto
function setupAddProductButton() {
    const addProductButton = document.getElementById('addProductButton');
    
    if (addProductButton) {
        console.log('Botón encontrado');
        addProductButton.addEventListener('click', () => {
            console.log('Botón clickeado');
            Swal.fire({
                title: 'Agregar un nuevo producto',
                html: `
                    <input id="title" class="swal2-input" type="text" placeholder="Título">
                    <input id="description" class="swal2-input" type="text" placeholder="Descripción">
                    <input id="price" class="swal2-input" type="number" placeholder="Precio">
                    <input id="code" class="swal2-input" type="text" placeholder="Código">
                    <input id="stock" class="swal2-input" type="number" placeholder="Stock">
                    <select id="status" class="swal2-input">
                        <option value="true">Disponible</option>
                        <option value="false">No disponible</option>
                    </select>
                    <input id="category" class="swal2-input" type="text" placeholder="Categoría">
                    <input id="thumbnails" class="swal2-input" type="text" placeholder="Thumbnails (URL)">
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const title = document.getElementById('title').value.trim();
                    const description = document.getElementById('description').value.trim();
                    const price = document.getElementById('price').value.trim();
                    const code = document.getElementById('code').value.trim();
                    const stock = document.getElementById('stock').value.trim();
                    const status = document.getElementById('status').value === 'true';
                    const category = document.getElementById('category').value.trim();
                    const thumbnails = document.getElementById('thumbnails').value.trim();

                    if (!title || !description || !price || !code || !stock || !category || !thumbnails) {
                        Swal.showValidationMessage('Todos los campos son obligatorios.');
                        return false;
                    }

                    return {
                        title,
                        description,
                        price: parseFloat(price),
                        code,
                        stock: parseInt(stock, 10),
                        status,
                        category,
                        thumbnails
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const newProduct = result.value;
                    socket.emit('addProduct', newProduct, (response) => {
                        if (response.success) {
                            Swal.fire('Producto agregado', 'El nuevo producto ha sido agregado exitosamente', 'success');
                        } else {
                            Swal.fire('Error', response.message || 'Hubo un problema al agregar el producto', 'error');
                        }
                    });
                }
            });
        });
    } else {
        console.log('Botón NO encontrado');
    }
}


// Socket.io listeners
socket.on('productListUpdated', (products) => {
    renderProducts(products);
});

socket.on('cartListUpdated', (carts) => {
    renderCarts(carts);
});

socket.on('errorMessage', (message) => {
    Swal.fire('Error', message, 'error');
});

// Inicializar solicitudes
getProducts();
getCarts();



