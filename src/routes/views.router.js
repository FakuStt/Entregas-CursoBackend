import express from 'express';
import { getProducts } from '../utils.js';

const router = express.Router();

//RUTA DONDE SE MUESTRAN LOS PRODUCTOS AREGADOS HASTA EL MOMENTO
router.get('/', (req, res) => {
    res.render('home', { products: getProducts() });
});

//RUTA DONDE SE MUESTRAN LOS PRODUCTOS ACTUALIZADOS EN TIEMPO REAL
router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: getProducts() });
});

export default router;