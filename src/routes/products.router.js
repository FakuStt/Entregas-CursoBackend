import { Router } from "express";
import productModel from "../models/products.model.js";
import { getProducts } from "../utils.js";

const router = Router();

//Mostrar todos los productos
router.get('/', async(req, res) => {
    try{

        const result = await getProducts(req.query)

        res.status(200).json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null
        });
        
    }catch (error){
        console.error(error)
        res.status(500).json({ status: "error", message: error.message });
    }
});

//Mostrar producto por ID
router.get('/:pid', async(req, res) => {
    try {
        const productID = parseInt(req.params.pid);
        const encontrado = await productModel.findById(req.params.pid)

        if(encontrado){
            res.status(200).json(encontrado);
        } else {
            res.status(404).json({msg:`Producto con id ${productID} no fue encontrado`});
        }

    } catch (error) {

        console.error(error)
        res.status(500).json({ status: "error", message: error.message });

    }
});

//Agregar un nuevo producto
router.post('/', async(req, res) => {

    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        // Validar que los campos obligatorios están presentes
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ msg: "Todos los campos son requeridos" });
        }

        const newProduct = await productModel.create({
            title: title || "New Product",
            description: description || "New Description",
            code: code || "New code",
            price: price || 0,
            status: status !== undefined ? status : true,
            stock: stock || 0,
            category: category || null,
            thumbnails: thumbnails || null
        });

        const products = await productModel.find().lean();
        socketServer.emit('updatedProducts', products);
        res.status(200).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al agregar el producto", error: error.message });
    }
});

//Actualizar un producto
router.put('/:pid', async (req, res) => {
    try{
        const productID = parseInt(req.params.pid);
        const encontrado = await productModel.findByIdAndUpdate(productID, req.body, {new: true});
    
        if (encontrado) {
            res.status(200).json({ msg: "Producto actualizado con éxito", encontrado });
        } else {
            res.status(404).json({msg: "No se ha encontrado producto con el id proporcionado"});
        }
    }catch(error){
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar el producto", error: error.message });
    }
});

//Eliminar un producto
router.delete('/:pid', (req, res) => {

    try{
        const productID = parseInt(req.params.pid);

        const encontrado = productModel.findById(productID)

        if (encontrado){
            encontrado = productModel.findByIdAndDelete(productID)
            res.status(200).json({ msg: `Producto con ID ${productID} eliminado correctamente` });
        } else{
            res.status(404).json({ msg: `Producto con ID ${productID} no se encontro`})
        }
    }catch(error){
        console.error(error);
        res.status(500).json({ msg: "Error al eliminar el producto", error: error.message });
    }
});


export default router;


