import express from "express"
import cartRoute from "./routes/cart.router.js"
import productsRoute from "./routes/products.router.js"
import homeRoute from "./routes/home.router.js"
import realTimeProductsRoute from "./routes/home.router.js"
import handlebars from "express-handlebars"
import __dirname from "./utils.js"
import { Server } from "socket.io"

const app = express()
const PORT = 8080

let products = []

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use("/api/carts", cartRoute)
app.use("/api/products", productsRoute)
app.use("/", homeRoute)
app.use("/realtimeproducts", realTimeProductsRoute)

app.engine('handlebars',handlebars.engine())

app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

app.use(express.static(__dirname + '/public'))

const httpServer = app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))
const socketServer = new Server(httpServer)

socketServer.on('connection', socket => {
    console.log("Nuevo cliente conectado")

    socket.on('message', data => {
        console.log(`soy la data ${data}`)
    })
})