// Conexión y desconexión de Socket.io
const socket = io();

socket.on('connect', () => console.log('Conectado al servidor'));
socket.on('disconnect', () => console.log('Desconectado del servidor'));

// Inicialización del DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('El DOM está cargado');
    setupAddProductButton();
    crearCart();
    fetchProducts();
    fetchCarts();
});

// Fetch y renderizar productos
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
    }
}

// Fetch y renderizar carritos
async function fetchCarts() {
    try {
        const response = await fetch('/api/carts');
        const carts = await response.json();
        renderCarts(carts);
    } catch (error) {
        console.error('Error al obtener carritos:', error);
    }
}

// Actualización cada cierto tiempo
setInterval(() => {
    fetchProducts();
    fetchCarts();
}, 5000);

// Solicitar carritos y manejar respuesta
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

// Renderizar carritos en el DOM
function renderCarts(carts) {
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer) {
        cartContainer.innerHTML = '';
        carts.forEach(cart => {
            cartContainer.innerHTML += createCartHTML(cart);
        });
    }
}

// Crear nuevo carrito
async function crearCart() {
    try {
        const confirmation = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se va a crear un nuevo carrito vacío.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, crear carrito',
            cancelButtonText: 'Cancelar'
        });

        if (confirmation.isConfirmed) {
            const response = await fetch('/api/carts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: [] })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Creado', 'El carrito ha sido creado con éxito.', 'success');
                fetchCarts();
            } else {
                Swal.fire('Error', data.message || 'No se pudo crear el carrito.', 'error');
            }
        }
    } catch (error) {
        console.error('Error al crear el carrito:', error);
        Swal.fire('Error', 'Ocurrió un problema al intentar crear el carrito.', 'error');
    }
}


// Confirmación de acciones
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
async function emptyCart(cartID) {
    try {
        const confirmation = await Swal.fire({
            title: '¿Estás seguro de vaciar el carrito?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, vaciarlo',
            cancelButtonText: 'Cancelar'
        });

        if (confirmation.isConfirmed) {

            const response = await fetch(`/api/carts/${cartID}/empty`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                Swal.fire('Vaciado', 'El carrito ha sido vaciado.', 'success');
                fetchCarts();
            } else {
                const data = await response.json();
                Swal.fire('Error', data.message || 'No se pudo eliminar el carrito.', 'error');
            }
        }
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
    }
}

// Eliminar carrito
async function deleteCart(cartID) {
    try {
        const confirmation = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminarlo',
            cancelButtonText: 'Cancelar'
        });

        if (confirmation.isConfirmed) {
            console.log("ID del carrito a eliminar:", cartID);

            const response = await fetch(`/api/carts/${cartID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                Swal.fire('Eliminado', 'El carrito ha sido eliminado.', 'success');
                fetchCarts();
            } else {
                const data = await response.json();
                Swal.fire('Error', data.message || 'No se pudo eliminar el carrito.', 'error');
            }
        }
    } catch (error) {
        console.error('Error al eliminar el carrito:', error);
        Swal.fire('Error', 'Ocurrió un problema al intentar eliminar el carrito.', 'error');
    }
}

// Agregar producto al carrito
async function addProductToCart(productID) {
    const addProductToCartButton = document.getElementById(`addProductToCartButton-${productID}`);

    if (addProductToCartButton) {
        addProductToCartButton.addEventListener('click', () => {
            Swal.fire({
                title: 'Agregar al carrito',
                html: `
                    <input id="cartId" class="swal2-input" type="text" placeholder="Id del Carrito">
                    <input id="quantity" class="swal2-input" type="number" placeholder="Cantidad a agregar" min="1">
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const cartId = document.getElementById('cartId').value;
                    const quantity = document.getElementById('quantity').value;

                    if (!cartId || !quantity) {
                        Swal.showValidationMessage('Todos los campos son obligatorios.');
                        return false;
                    }

                    return { cartId, quantity };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const { cartId, quantity } = result.value;

                    console.log("Info:", { cartId, productID, quantity });

                    const response = await fetch(`/api/carts/${cartId}/product/${productID}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ quantity })
                    });

                    if (response.ok) {
                        Swal.fire('Agregado', 'El producto ha sido agregado al carrito!', 'success');
                        fetchCarts();
                    } else {
                        const data = await response.json();
                        Swal.fire('Error', data.message || 'No se pudo agregar el producto al carrito.', 'error');
                    }
                }
            });
        });
    }
}

async function deleteProductCart(cartID, productID) {
    try {
        const confirmation = await Swal.fire({
            title: '¿Estás seguro de eliminarlo?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminarlo',
            cancelButtonText: 'Cancelar'
        });
        if (confirmation.isConfirmed) {
            console.log("ID del carrito a eliminar:", cartID);

            const response = await fetch(`/api/carts/${cartID}/products/${productID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                Swal.fire('Eliminado', 'El producto ha sido eliminado del carrito.', 'success');
                fetchCarts();
            } else {
                const data = await response.json();
                Swal.fire('Error', data.message || 'No se pudo eliminar el producto del carrito.', 'error');
            }
        }
    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error);
    }
}


// Modificar producto
async function modifyProduct(productID) {
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
    }).then(async (result) => {
        if (result.isConfirmed) {
            const data = result.value;

            const response = await fetch(`/api/products/${productID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                Swal.fire('Producto modificado', 'Los datos del producto han sido actualizados exitosamente', 'success');
                fetchProducts();
            } else {
                const data = await response.json();
                Swal.fire('Error', data.message || 'No se pudo modificar el producto.', 'error');
            }
        }
    });
}


// Modificar cantidad de producto en carrito
function modifyProductQuantity(cartID, productID) {
    Swal.fire({
        title: 'Modificar cantidad del producto en el carrito',
        html: '<input id="quantity" class="swal2-input" type="number" placeholder="Cantidad" min="1">',
        focusConfirm: false,
        preConfirm: () => {
            const quantity = parseInt(document.getElementById('quantity').value, 10);
            if (isNaN(quantity) || quantity < 1) {
                Swal.showValidationMessage('La cantidad debe ser mayor que 0.');
                return false;
            }
            return { quantity };
        }
    }).then(result => {
        if (result.isConfirmed) {
            fetch(`/api/carts/${cartID}/products/${productID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: result.value.quantity })
            })
            .then(response => {
                if (!response.ok) throw new Error('Error en la actualización');
                return response.json();
            })
            .then(data => {
                Swal.fire('Cantidad actualizada', 'La cantidad del producto en el carrito ha sido actualizada', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Error', 'Hubo un error al actualizar la cantidad', 'error');
            });
        }
    });
}

// Eliminar producto
function deleteProduct(productID) {
    confirmAction(
        '¿Estás seguro de que deseas eliminar este producto?',
        'Esta acción eliminará el producto permanentemente.',
        'Sí, eliminar',
        () => fetch(`/api/products/${productID}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) throw new Error('Error al eliminar el producto');
                Swal.fire('Producto eliminado', 'El producto ha sido eliminado exitosamente', 'success');
                fetchProducts();
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Error', 'Hubo un error al eliminar el producto', 'error');
            })
    );
}

// Crear HTML para cada carrito
function createCartHTML(cart) {
    return `
        <div class="cart">
            <div class="cart-info">
                <span>ID: ${cart._id}</span>
                <span>Cantidad de productos: ${cart.products.length}</span>
            </div>
            <div class="cart-actions">
                <button class="btn" onclick="emptyCart('${cart._id}')">Vaciar</button>
                <button class="btn" onclick="deleteCart('${cart._id}')">Eliminar</button>
            </div>
        </div>
    `;
}

// Renderizar productos en el DOM
function renderProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    if (productsContainer) {
        productsContainer.innerHTML = '';
        products.forEach(product => {
            productsContainer.innerHTML += createProductHTML(product);
            addProductToCart(product._id);
        });
    }
}

// Crear HTML para cada producto
function createProductHTML(product) {
    return `
        <div class="product">
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <p>Precio: $${product.price}</p>
            <p>Código: ${product.code}</p>
            <p>Stock: ${product.stock}</p>
            <button class="btn" onclick="modifyProduct('${product._id}')">Modificar</button>
            <button class="btn" id="addProductToCartButton-${product._id}">Agregar al Carrito</button>
            <button class="btn" onclick="deleteProduct('${product._id}')">Eliminar</button>
        </div>
    `;
}






