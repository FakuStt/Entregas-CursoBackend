//CONTROLADOR DE USUARIOS - NO TRABAJA CON LA BASE DE DATOS
import UserService from "../dao/classes/user.dao.js";

const userService = new UserService;

//obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        let users = await userService.getUsers();
        res.send({ status: "success", payload: users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//obtener usuario por id
export const getUserById = async (req, res) => {
    try {
        const { uid } = req.params
        let user = await userService.getUserById(uid)
        res.send({ status: "success", payload: user })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//crear usuario
export const createUser = async (req, res) => {
    try {
        const user = req.body
        let newUser = await userService.createUser(user)
        res.send({ status: "success", payload: newUser })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//eliminar usuario
export const deleteUser = async (req, res) => {
    try {
        const { uid } = req.params;
        let deletedUser = await userService.deleteUser(uid);
        res.send({ status: "success", message: "Se ha eliminado el usuario de manera correcta" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//actualizar usuario
export const updateUser = async (req, res) => {
    try {
        const { uid } = req.params.id;
        const { user } = req.body;
        let updateUser = await userService.updateUser(uid, user);
        res.send({ status: "success", payload: updateUser })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}