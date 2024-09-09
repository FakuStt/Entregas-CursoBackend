import { Router } from 'express';
import productModel from '../models/products.model.js';
import { getProducts } from '../utils.js';
import cartModel from '../models/cart.model.js';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';


const router = Router();

/*
//RUTA DONDE SE MUESTRAN LOS PRODUCTOS AREGADOS HASTA EL MOMENTO
router.get('/', async(req, res) => {
        try {
            const result = await getProducts(req.query);
            console.log(result.docs)

            res.render('home', { 
            payload: result.docs,
            totalPages: result.totalPages,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink = result.hasPrevPage ? `http://localhost:8080/home?page=${result.prevPage}` : null,
            nextLink: result.nextLink = result.hasNextPage ? `http://localhost:8080/home?page=${result.nextPage}` : null,
            isValid: result.docs.length > 0 
        });
        }catch (error) {
        console.error(`Error al obtener productos: ${error.message}`);
        res.status(500).send('Error al obtener productos');
    }
});

//RUTA DONDE SE MUESTRAN LOS PRODUCTOS ACTUALIZADOS EN TIEMPO REAL
router.get('/realtimeproducts', async (req, res) => {
    try {
        const result = await getProducts(req.query);
        const carts = await cartModel.find().lean()
        console.log(carts)

        res.render('realtimeproducts', { 
            cart: carts,
            payload: result.docs,
            totalPages: result.totalPages,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink = result.hasPrevPage ? `http://localhost:8080/realtimeproducts?page=${result.prevPage}` : null,
            nextLink: result.nextLink = result.hasNextPage ? `http://localhost:8080/realtimeproducts?page=${result.nextPage}` : null,
            isValid: result.docs.length > 0 
        });

    } catch (error) {
        console.error(`Error al obtener productos: ${error.message}`);
        res.status(500).send('Error al obtener productos');
    }
});

router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login');
});

router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register');
});

router.get('/reset-password', isNotAuthenticated, (req,res)=> {
    res.render('resetPassword')
} )

router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
}); */

router.get('/', async (req,res)=>{
    res.render('profile')
})

router.get('/login', async (req,res)=>{
    res.render('login')
})

export default router;