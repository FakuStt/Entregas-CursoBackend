//javascript

const socket = io();

//let products = []

let eliminarButton = document.getElementById("eliminarButton")
let agregarButton = document.getElementById("agregarButton")

function eliminarProduct() {
    Swal.fire({
        title: 'Ingresa el id del Producto a eliminar:',
        input: "number",
        text: "id...",
        icon: 'warning',
        inputValidator: (value) => {
            return !value && "Debes ingresar un id"
        }
    }).then(result => {
        socket.emit('productsEliminado', result.value)
    })
}

function agregarProduct() {
    Swal.fire({
        title: 'Para agregar un producto, completa lo siguiente:',
        html: `
            <input id="title" class="swal2-input" type="text" placeholder="Título" name="title">
            <input id="description" class="swal2-input" type="text" placeholder="Descripción" name="description">
            <input id="price" class="swal2-input" type="number" placeholder="Precio" name="price">
            <input id="code" class="swal2-input" type="text" placeholder="Código" name="code">
            <input id="stock" class="swal2-input" type="number" placeholder="Stock" name="stock">
            <input id="status" class="swal2-input" type="text" placeholder="Status" name="status">
            <input id="category" class="swal2-input" type="text" placeholder="Categoria" name="category">
            <input id="thumbnails" class="swal2-input" type="text" placeholder="Thumbnails" name="thumbnails">

        `,
        focusConfirm: false,
        preConfirm: () => {
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const price = document.getElementById('price').value;
            const code = document.getElementById('code').value;
            const stock = document.getElementById('stock').value;
            const status = document.getElementById('status').value;
            const category = document.getElementById('category').value;
            const thumbnails = document.getElementById('thumbnails').value;

            if (!title || !description || !price || !code || !stock || !category) {
                Swal.showValidationMessage('Todos los campos son obligatorios.');
                return false; // Esto evita que la alerta se cierre si hay campos vacíos.
            }

            return {
                title: title,
                id: 0,
                description: description,
                price: parseFloat(price),
                code: code,
                stock: parseInt(stock, 10),
                category: category,
                status: status,
                thumbnails: thumbnails
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newProduct = result.value;
            // Emitir el nuevo producto al servidor
            socket.emit('newProduct', newProduct);

            // Opcional: mostrar una alerta de confirmación
            Swal.fire('Producto añadido', 'Tu producto ha sido añadido exitosamente', 'success');
        }
    });
}

