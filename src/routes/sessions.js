import express from "express"
import User from "../models/user.model.js"
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport";
import { passportCall } from "../utils.js";
import { generateToken } from "../utils.js";
import { authorization } from "../utils.js";
import bcrypt from "bcryptjs"
import userModel from "../models/user.model.js";

const router = express.Router()

router.post('/register', async (req,res)=> {
    try {
        const {first_name, last_name, email, age, password, role} = req.body
        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).json({ msg: "Todos los campos son requeridos" });
        }
        let exists = userModel.findOne({ email })
        if(exists){
            res.status(400).send({error: "Usuario ya registrado"})
        }
        
        const newUser = await userModel.create({
            first_name,
            last_name,
            email,
            age,
            role,
            password:  createHash(password),
        })
        await newUser.save()
    
        const access_token = generateToken(newUser)
        res.cookie("jwt", access_token, {httpOnly: true, secure: false})
        console.log(newUser)
        return res.redirect('/profile')
    } catch (error) {
        console.log(error);
        res.redirect('/failregister')
    }
})

router.get('/failregister', async (req,res)=>{
    console.log("Estrategia fallida"),
    res.send({error: "Failed"})
})

router.post('/login', async (req, res) => {

        try {
            const {email, password} = req.body
            if(!email || !password) {
                return res.status(400).json({ msg: "Todos los campos son requeridos" });
            }
            const user = userModel.findOne({email: email})
            if (!user) return res.status(400).send({status: "error", error: "Usuario o constrase'a incorrecta"});
     
            
            if(!isValidPassword(user, user.password)) return res.status(400).send({status: "error", error: "Usuario o contrase;a incorrecta"});
            const access_token = generateToken(user)
            res.cookie("jwt", access_token, {httpOnly: true, secure: false})
            return res.redirect('/profile')
        } catch (error) {
            console.log(error);
            res.redirect('/faillogin')
        }

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

router.get('/profile', passportCall('jwt'), async(req,res) => {
    try {
        const user = userModel.findById(user._id)
        if(!user) return res.status(400).send({err: "No se ha encontrado el usuario"})
         
        res.send({first_name: user.first_name, last_name: user.last_name, age: user.age, email: user.email, role: user.role || user})
    } catch (error) {
        console.log(error)
        res.status(500).send({status: "error", error: "Error al intentar acceder a datos de usuario"})
    }
})

router.post('/logout', (req, res) => {
    res.clearCookie('jwt')
    res.redirect('/login')
});


router.get("/github", passport.authenticate("github",{scope:["user:email"]}),async(req,res)=>{})

router.get("/githubcallback",passport.authenticate("github",{failureRedirect:"/login"}),async(req,res)=>{
    req.session.user=req.user
    res.redirect("/profile")
}) 



export default router