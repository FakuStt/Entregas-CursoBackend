const express = require("express")
const cartRoute = require("./routes/cart.router.js")
const productsRoute = require("./routes/products.router.js")

const app = express()
const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use("/api/carts", cartRoute)
app.use("/api/products", productsRoute)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})