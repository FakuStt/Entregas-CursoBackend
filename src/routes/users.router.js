//RUTA PARA MANEJO DE USUARIOS
import { Router } from "express";
import { createUser, updateUser, deleteUser, getUsers, getUserById } from "../controllers/user.controller.js";

const router = Router();

//Obtener todos los usuarios
router.get('/', getUsers);

//Obtener usuario por id
router.get('/:uid', getUserById);

//Crear usuario
router.post('/', createUser);

//Eliminar usuario
router.delete('/:uid', deleteUser);

//Actualizar usuario
router.put('/:uid', updateUser);

export default router;