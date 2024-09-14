// Conexión y desconexión de Socket.io
const socket = io();

socket.on('connect', () => console.log('Conectado al servidor'));
socket.on('disconnect', () => console.log('Desconectado del servidor'));

// Inicialización del DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('El DOM está cargado');
    setupAddProductButton();
    crearCart();
    getProducts();
    getCarts();
});

// Solicitar y manejar carritos
async function getCarts() {
    try {
        const response = await fetch('/api/carts');
        const carts = await response.json();
        socket.emit('updateCarts', carts); 
    } catch (error) {
        console.error('Error fetching carts:', error);
        socket.emit('updateCartsError', { error: 'Failed to fetch carts' }); 
    }
}

function renderCarts(carts) {
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer) {
        cartContainer.innerHTML = ''; 
        carts.forEach(cart => {
            cartContainer.innerHTML += createCartHTML(cart);
        });
    }
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

// Confirmación y acciones de carritos y productos
function confirmAction(title, text, confirmText, callback) {
    Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) callback();
    });
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
    }).then(result => {
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
    confirmAction(
        '¿Estás seguro de que deseas eliminar este producto?',
        'Esta acción eliminará el producto permanentemente.',
        'Sí, eliminar',
        () => socket.emit('deleteProduct', productID)
    );
}

// Modificar cantidad de producto en carrito
function modifyProductQuantity(cartID, productID) {
    Swal.fire({
        title: 'Modificar cantidad del producto en el carrito',
        html: '<input id="quantity" class="swal2-input" type="number" placeholder="Cantidad">',
        focusConfirm: false,
        preConfirm: () => {
            const quantity = parseInt(document.getElementById('quantity').value, 10);
            if (quantity <= 0) {
                Swal.showValidationMessage('La cantidad debe ser mayor que 0.');
                return false;
            }
            return { cartId: cartID, productId: productID, quantity };
        }
    }).then(result => {
        if (result.isConfirmed) {
            socket.emit('updateProductQuantity', result.value);
            Swal.fire('Cantidad actualizada', 'La cantidad del producto en el carrito ha sido actualizada', 'success');
        }
    });
}

// Configurar botón para agregar producto
function setupAddProductButton() {
    const addProductButton = document.getElementById('addProductButton');
    if (addProductButton) {
        addProductButton.addEventListener('click', () => {
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
                    const product = {
                        title: document.getElementById('title').value.trim(),
                        description: document.getElementById('description').value.trim(),
                        price: parseFloat(document.getElementById('price').value.trim()),
                        code: document.getElementById('code').value.trim(),
                        stock: parseInt(document.getElementById('stock').value.trim(), 10),
                        status: document.getElementById('status').value === 'true',
                        category: document.getElementById('category').value.trim(),
                        thumbnails: document.getElementById('thumbnails').value.trim()
                    };
                    if (Object.values(product).some(val => !val)) {
                        Swal.showValidationMessage('Todos los campos son obligatorios.');
                        return false;
                    }
                    return product;
                }
            }).then(result => {
                if (result.isConfirmed) {
                    socket.emit('addProduct', result.value, response => {
                        Swal.fire(
                            response.success ? 'Producto agregado' : 'Error',
                            response.success ? 'El nuevo producto ha sido agregado exitosamente' : response.message || 'Hubo un problema al agregar el producto',
                            response.success ? 'success' : 'error'
                        );
                    });
                }
            });
        });
    } else {
        console.log('Botón NO encontrado');
    }
}

// Socket.io listeners
socket.on('productListUpdated', () => location.reload());
socket.on('cartListUpdated', () => location.reload());
socket.on('updateCarts', (carts) => {
    renderCarts(carts);
});
socket.on('cartListUpdated', (carts) => {
    // Actualiza la lista de carritos
    renderCarts(carts);
});
socket.on('errorMessage', message => Swal.fire('Error', message, 'error'));








