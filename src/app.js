import express from "express"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import multer from "multer"
import path from "path" //PARA UTILIZARLO PARA ARCHIVO ESTATICO
import cartRoute from "./routes/cart.router.js"
import productsRoute from "./routes/products.router.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 8080

//Crear una carpeta "descargas"
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, path.resolve(__dirname,"./descargas"))
    },
    filename:(req,file,cb)=>{
        const timestamp = Date.now()
        const originalname= file.originalname
        const ext = path.extname(originalname)
        cb(null, `${timestamp}-${originalname}`)
    }
})

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

/* PARA SERVIR EL ARCHIVO ESTATICO - SI NO FUNCIONA REVISAR DIAPO DE CLASE 8
app.use(express.static(path.join(__dirname,"public")))
*/

app.use("/api/carts", cartRoute)
app.use("/api/products", productsRoute)

/* PARA MOSTRAR EL ARCHIVO ESTATICO EN LA RUTA /
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})
*/
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})