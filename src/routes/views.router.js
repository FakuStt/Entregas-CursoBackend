import { Router } from 'express';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';
import { isAdmin, isNotAdmin } from '../middleware/adm.js';
import { getAllProducts, getAllProductsAndCarts } from '../controllers/view.controller.js';
import { transport } from '../utils.js';
import twilio from 'twilio'
import dotenv from "dotenv"

dotenv.config()


const client = twilio(process.env.TWILIO_ACOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

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


router.get('/reset-password', (req,res) => {
    const user = req.user
    res.render('resetPassword', {user});
})


router.get('/sms', async(req,res) => {
    let result = await client.messages.create({
        body:"SMS de prueba",
        from: process.env.TWILIO_SMS_NUMBER,
        to: "NUMERO DE TELEFONO DE USER"
    })
    res.send({status:"success", result: "mensaje enviado"})
})


export default router;