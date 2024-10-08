import express from "express"
import passport from "passport";
import { registerUser, loginUser, resetPasswordUser, profileUser } from "../controllers/session.controller.js";

const router = express.Router()

router.post('/register', registerUser)

router.get('/failregister', async (req,res)=>{
    console.log("Estrategia fallida"),
    res.send({error: "Failed"})
})

router.post('/login', loginUser);

router.get('/faillogin', (req,res)=>{
    res.send({error: "Login fallido"})
})

router.post('/reset-password', resetPasswordUser);

router.get('/profile', passport.authenticate("jwt", {session: false}), profileUser)

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