import express from 'express'
import {readFileSync} from "fs"

const filePath = '../products.json'; 

const router = express.Router() 

if (filePath) {
    const data = readFileSync(filePath, "utf8")
    const products = JSON.parse(data)
    router.get('/', (req, res) => {
        res.render('home', { products });
    });

    router.get('/realtimeproducts', (req, res)=> {
        res.render('realTimeProducts', {products})
    })
}

export default router;