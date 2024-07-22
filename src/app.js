import express from "express"
import cartRoute from "./routes/cart.router.js"
import productsRoute from "./routes/products.router.js"
import handlebars from "express-handlebars"
import __dirname from "./utils.js"

const app = express()
const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use("/api/carts", cartRoute)
app.use("/api/products", productsRoute)

app.engine('handlebars',handlebars.engine())

app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

app.use(express.static(__dirname + '/public'))

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})