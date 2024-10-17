import { Router } from "express";
import { createCart, getCartById, saveProductIdInCartId, deleteProductInCart, updateCart, updateProductInCart, deleteCart, purchaseCart, getAllCarts } from "../controllers/cart.controller.js";

const router = Router();
//Agregar un carrito nuevo
router.post('/', createCart)

//Mostrar todos los carritos
router.get('/', getAllCarts)

//Mostrar un carrito por ID
router.get('/:cid', getCartById)

//Agregar un producto ID a un carrito por ID
router.post('/:cid/product/:pid', saveProductIdInCartId);

//Eliminar un producto de un carrito
router.delete('/:cid/products/:pid', deleteProductInCart)

//Actualizar un carrito
router.put('/:cid', updateCart)

//Actualizar un producto en un carrito
router.put('/:cid/products/:pid', updateProductInCart)

//Eliminar un carrito
router.delete('/:cid', deleteCart)

router.get('/:cid/purchase', purchaseCart)

export default router;