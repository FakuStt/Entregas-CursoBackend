import express from "express"
import User from "../models/user.model.js"
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport";

const router = express.Router()

router.post('/register', passport.authenticate('register',{failureRedirect: '/failregister'}) ,async (req, res) => {
    res.send({status: "success", message: "Usuario registrado"})
});

router.get('/failregister', async (req,res)=>{
    console.log("Estrategia fallida"),
    res.send({error: "Failed"})
})

router.post('/login', passport.authenticate('login', {failureRedirect: '/faillogin'})  ,async (req, res) => {
    
        if (!req.user) return res.status(400).send({status: "error", error: "Valores incompletos"});

        req.session.user={
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            age: req.user.age,
            email: req.user.email
        }
        res.send({status: "success", payload: req.user})
});

router.get('/faillogin', (req,res)=>{
    res.send({error: "Login fallido"})
})

router.post('/reset-password', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ status: "error", error: "Usuario no encontrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        await user.save();
        res.redirect('/realtimeproducts')

    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "error", error: "Error interno del servidor" });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error al cerrar sesión');
        res.redirect('/login');
    });
});


export default router