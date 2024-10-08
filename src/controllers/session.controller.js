import UserService from "../dao/classes/user.dao.js";
import { generateToken } from "../utils.js";

const userService = new UserService;

export const registerUser = async (req, res) => {
    try {
        const {first_name, last_name, email, age, password, role} = req.body;
        let user = await userService.registerUser(first_name, last_name, email, age, password, role);
        if(!user){
            res.redirect('/failregister')
        }
        const access_token = generateToken(user)
        res.cookie("jwt", access_token, {httpOnly: true, secure: false})
        console.log(user)
        res.redirect('/profile')
    } catch (error) {
        console.log(error);
        res.redirect('/failregister')
    }
}

export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await userService.loginUser(email, password);
        if(!user){
            res.redirect('/faillogin')
        }
        const access_token = generateToken(user)
        res.cookie("jwt", access_token, {httpOnly: true, secure: false})
        return res.redirect('/profile')
    } catch (error) {
        console.log(error);
        res.redirect('/faillogin')
    }
}

export const resetPasswordUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        let user = await userService.resetPasswordUser(email, password);
        if(!user){
            res.status(500).send({ status: "error", error: "Error interno del servidor" });
        }
        res.redirect('/realtimeproducts')
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const profileUser = async (req, res) => {
    try {
        let user = await userService.profileUser(req.user);
        res.send({ user })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}