import { Router } from "express";
import { createUser, updateUser, deleteUser, getUsers, getUserById } from "../controllers/user.controller.js";

const router = Router();

router.get('/', getUsers);

router.get('/:uid', getUserById);

router.post('/', createUser);

router.delete('/:uid', deleteUser);

router.put('/:uid', updateUser);

export default router;