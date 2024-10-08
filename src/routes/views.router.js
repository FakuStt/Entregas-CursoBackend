import { Router } from 'express';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';
import { isAdmin, isNotAdmin } from '../middleware/adm.js';
import { getAllProducts, getAllProductsAndCarts } from '../controllers/view.controller.js';

const router = Router();

//RUTA DONDE SE MUESTRAN LOS PRODUCTOS AGREGADOS HASTA EL MOMENTO VISTA DE USUARIO
router.get('/', isNotAdmin, getAllProducts);

//RUTA PARA ADMIN, VER PRODUCTOS EN TIEMPO REAL Y ACTUALIZARLOS
router.get('/realtimeproducts', isAdmin, getAllProductsAndCarts);

router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login');
});

router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register');
});

router.get('/profile', isAuthenticated, (req, res) => {
    const user = req.user;
    res.render('profile', {user});
});

router.get('/reset-password', isAuthenticated, (req,res) => {
    const user = req.user
    res.render('reset-password', {user});
})


export default router;