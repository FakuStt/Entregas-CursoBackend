import { Router } from "express";
import cartModel from "../models/cart.model.js";
import productModel from "../models/products.model.js";

const router = Router();
//Agregar un carrito nuevo
router.post('/', async(req,res) => {

    try{
        const newCart = new cartModel({
            products: []
        })

        const savedCart = await newCart.save();

        res.status(200).json({ msg: `Carrito con ID ${savedCart._id} creado correctamente` });

    } catch(error){
        console.error(error);
        res.status(500).json({ msg: "Error al crear el carrito", error: error.message });
    }
})

//Mostrar un carrito por ID
router.get('/:cid', async (req,res) => {
    try{
        const cartID = parseInt(req.params.cid)
        const encontrado = await cartModel.findById(cartID)
        if (encontrado){
            res.status(200).json(encontrado)
        } else{
            res.status(500).json({ msg: "Error, no se ha podido encontrar el carrito con ese id"})
        }
    } catch(error){
        console.error(error)
        res.status(500).json({ status: "error", message: error.message });
    }
})

//Agregar un producto ID a un carrito por ID
router.post('/:cid/product/:pid', async(req, res) => {
    try {
        const cartID = parseInt(req.params.cid);
        const productID = parseInt(req.params.pid);
        const quantity = 1;
        const product = await productModel.findById(productID);
        const cart = await cartModel.findById(cartID);

        if (!cart || !product){
            return res.status(404).json({ msg: "No fue posible encontrar el carrito o el producto por esos id" })
        }
        const existeProduct = cart.products.find((product) => product.product === productID)
        if (existeProduct) {
            existeProduct.quantity += quantity;
        } else {
            cart.products.push({ product: productID, quantity: quantity });
        }

        await cart.save();
        res.status(200).json({msg: `Se ha agregado el producto al carrito correctamente`});
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: "error", message: error.message });
    }
});

//Eliminar un producto de un carrito
router.delete('/:cid/products/:pid', async(req,res) => {
    try{
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);
        const product = await productModel.findById(productId);
        const cart = await cartModel.findById(cartId);

        if (!cart || !product){
            return res.status(404).json({ msg: "No fue posible encontrar el carrito o el producto por esos id" })
        }
        const existeProduct = cart.products.find((product) => product.product === productId)
        if (existeProduct) {
            cart = cart.products.filter((prod) => prod.product !== productId)
        } else {
            res.status(500).json({ msg: "Error, no se ha podido encontrar el producto en el carrito"})
        }

        await cart.save()
        res.status(200).json({msg: `Se ha eliminado el producto del carrito correctamente`});

    }catch(error){
        console.error(error)
        res.status(500).json({ status: "error", message: error.message });
    }
})

router.put('/:cid', async (req,res) => {
    try {
        const cartId = parseInt(req.params.cid);

        const encontrado = await productModel.findByIdAndUpdate(cartId, req.body, {new: true});
    
        if (encontrado) {
            res.status(200).json({ msg: "Carrito actualizado con éxito", encontrado });
        } else {
            res.status(404).json({msg: "No se ha encontrado Carrito con el id proporcionado"});
        }

    } catch (error) {
        console.error(error)
        res.status(500).json({ status: "error", message: error.message });
    }
})

router.put('/:cid/products/:pid', async (req,res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);
        const product = await productModel.findById(productId);
        const cart = await cartModel.findById(cartId);
        const {quantity} = req.body;

        if (!cart || !product){
            return res.status(404).json({ msg: "No fue posible encontrar el carrito o el producto por esos id" })
        }

        const existeProduct = cart.products.find((product) => product.product === productId)
        if (existeProduct) {
            existeProduct.quantity = quantity
        } else {
            res.status(500).json({ msg: "Error, no se ha podido encontrar el producto en el carrito"})
        }

        await cart.save()
        res.status(200).json({msg: `Se ha actualizado la cantidad del producto del carrito correctamente`});

    } catch (error) {
        console.error(error)
        res.status(500).json({ status: "error", message: error.message });
    }
})

router.delete('/:cid', async (req, res)=>{
    try {
        const cartId = parseInt(req.params.cid)
        const cart = await cartModel.findById(cartId);
        if (!cart){
            return res.status(404).json({ msg: "No fue posible encontrar el carrito por ese id" })
        }
        cart.products = [];
        await cart.save()
        res.status(200).json({msg: `Se ha actualizado la cantidad del producto del carrito correctamente`});


    } catch (error) {
        console.error(error)
        res.status(500).json({ status: "error", message: error.message });
    }
})

export default router;