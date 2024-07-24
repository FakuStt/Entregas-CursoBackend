//javascript

const socket = io();

//let products = []

let title = document.getElementById("title")
let price = document.getElementById("price")
let status = document.getElementById("status")
let code = document.getElementById("code")
let description = document.getElementById("description")
let id = document.getElementById("id")
let thumbnails = document.getElementById("thumbnails")
let category = document.getElementById("category")

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
        products = products.filter((product)=> product.id !== result.value)
        socket.emit(products)
    })
}

function agregarProduct() {
    Swal.fire({
        title: 'Para agregar un producto, completa lo siguiente:',
        html: `
            <input id="title" type:"number" placeholder="Titulo" name:"title">
            <input id="description" type:"text" placeholder="Descripcion" name:"description">
            <input id="price" type:"number" placeholder="Precio" name:"price">
            <input id="code" type:"text" placeholder="Codigo" name:"code">
            <input id="stock" type:"number" placeholder="Stock" name:"stock">
        `,
        inputValidator: (value) => {
            return !value && "Debes ingresar un id"}
    }).then(result => {
        //Agregar el producto al arreglo de productos
    });

}

