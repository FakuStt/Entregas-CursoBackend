import express from 'express';
import { getProducts } from '../utils.js';
import productModel from '../models/products.model.js';


const router = express.Router();

//RUTA DONDE SE MUESTRAN LOS PRODUCTOS AREGADOS HASTA EL MOMENTO
router.get('/', (req, res) => {
    res.render('home', { products: getProducts() });
});

//RUTA DONDE SE MUESTRAN LOS PRODUCTOS ACTUALIZADOS EN TIEMPO REAL
router.get('/realtimeproducts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
        const sort = req.query.sort || 'asc'; // Valor por defecto
        const query = req.query.query || '';

        let queryObject = {};
        if (query) {
            queryObject.category = { $regex: query, $options: 'i' };
        }

        let sortOptions = {};
        if (sort === 'asc') {
            sortOptions = { price: 1 };
        } else if (sort === 'desc') {
            sortOptions = { price: -1 };
        }


        const options = {
            limit: limit,
            page: page,
            sort: sortOptions
        };

        const result = await productModel.paginate(queryObject, options);

        result.prevLink = result.hasPrevPage ? `/realtimeproducts?page=${result.prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null;
        result.nextLink = result.hasNextPage ? `/realtimeproducts?page=${result.nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null;
        console.log(result.docs)
        res.render('realtimeproducts', { docs: result.docs, prevLink: result.prevLink, nextLink: result.nextLink });
    } catch (error) {
        console.error(`Error al obtener productos: ${error.message}`);
        res.status(500).send('Error al obtener productos');
    }
});






export default router;