// realtimeproducts.router.js
import express from 'express';
import { getProducts } from '../utils.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('realTimeProducts', { products: getProducts() });
});

export default router;
