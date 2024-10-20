//RUTA PARA MANEJO DE SESSIONES
import express from "express"
import passport from "passport";
import { registerUser, loginUser, resetPasswordUser, profileUser } from "../controllers/session.controller.js";

const router = express.Router()

//Ingresar con nuevo usuario
router.post('/register', registerUser)

//Error al ingresar con nuevo usuario
router.get('/failregister', async (req,res)=>{
    console.log("Estrategia fallida"),
    res.send({error: "Failed"})
})

//Ingresar con usuario existente
router.post('/login', loginUser);

//Error al ingresar con usuario existente
router.get('/faillogin', (req,res)=>{
    res.send({error: "Login fallido"})
})

////Reestablecer contraseña
router.post('/reset-password', resetPasswordUser);

//Perfil de usuario
router.get('/profile', passport.authenticate("jwt", {session: false}), profileUser)

//Salir de la cuenta
router.post('/logout', (req, res) => {
    res.clearCookie('jwt')
    res.redirect('/login')
});

//Ingresar con github
router.get("/github", passport.authenticate("github",{scope:["user:email"]}),async(req,res)=>{})

//Perfil de github
router.get("/githubcallback",passport.authenticate("github",{failureRedirect:"/login"}),async(req,res)=>{
    req.session.user=req.user
    res.redirect("/profile")
}) 



export default router