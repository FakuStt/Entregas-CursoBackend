//RUTA PARA MANEJO DE PRODUCTOS
import { Router } from "express";
import { getPaginateProducts, getProductById, createProduct, updatedProduct, deleteProduct } from "../controllers/product.controller.js";

const router = Router();

//Mostrar los productos paginados
router.get('/', getPaginateProducts);

//Mostrar producto por ID
router.get('/:pid', getProductById);

//Agregar un nuevo producto
router.post('/', createProduct);

//Actualizar un producto
router.put('/:pid', updatedProduct);

//Eliminar un producto
router.delete('/:pid', deleteProduct);


export default router;


