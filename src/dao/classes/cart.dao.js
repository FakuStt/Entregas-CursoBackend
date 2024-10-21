//CartService - Trabaja con la base de datos
import cartModel from "../models/cart.model.js";
import productModel from "../models/products.model.js";
import ProductService from "./product.dao.js";
import UserService from "./user.dao.js";
import ticketModel from "../models/ticket.model.js";

const productService = new ProductService;

class CartService{

    //crear carrito
    async createCart(){
        try{
            const newCart = new cartModel({
                products: []
            })
            const savedCart = await newCart.save();
            return savedCart
    
        } catch(error){
            console.error(error);
            return null;
        }
    }

    //obtener todos los carritos
    async getAllCarts(){
        try{
            const carts = cartModel.find();
            return carts;
        } catch(error){
            console.error(error)
            return null;
        }
    }

    //obtener carrito por id
    async getCartById(cartID){
        try{
            const encontrado = await cartModel.findById(cartID)
            if (encontrado){
                return encontrado;
            } else{
            console.log("Error, no se ha podido encontrar el carrito con ese id");
            return null;
            }
        } catch(error){
            console.error(error)
            return null;
        }
    }

    //guardar un producto en un carrito
    async saveProductIdInCartId(cartID, productID){
        try {
            const quantity = 1;
            const product = await productModel.findById(productID);
            const cart = await cartModel.findById(cartID);
    
            if (!cart || !product){
                console.log("No fue posible encontrar el carrito o el producto por esos id");
                return null;
            }
            const existeProduct = cart.products.find((product) => product.product === productID)
            if (existeProduct) {
                existeProduct.quantity += quantity;
            } else {
                cart.products.push({ product: productID, quantity: quantity });
            }
    
            console.log(`Se ha agregado el producto al carrito correctamente`);
            return await cart.save();
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    //eliminar un producto de un carrito
    async deleteProductInCart(cartId, productId) {
        try {
            const cart = await cartModel.findById(cartId);
            
            if (!cart) {
                console.log("No se encontró el carrito con ese ID");
                return null;
            }
    
            // Filtra el array de productos para eliminar el producto con el ID dado
            cart.products = cart.products.filter(p => p.product.toString() !== productId);
    
            return await cart.save();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    
    
    //actualizar un carrito
    async updateCart(cartId, dataCart){
        try {
            const encontrado = await productModel.findByIdAndUpdate(cartId, dataCart, {new: true});
        
            if (encontrado) {
                console.log("Carrito actualizado con éxito");
                return encontrado;
            } else {
                console.log("No se ha encontrado Carrito con el id proporcionado");
                return null;
            }
    
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    //actualizar un producto de un carrito
    async updateProductInCart(cartId, productId, quantity) {
        try {
            console.log(`Buscando carrito con ID: ${cartId}`);
            console.log(`Buscando producto con ID: ${productId}`);
            const product = await productModel.findById(productId);
            const cart = await cartModel.findById(cartId);
    
            if (!cart || !product) {
                console.log("No fue posible encontrar el carrito o el producto por esos id");
                return null;
            }
    
            // Comparar product.product con productId convertido a string
            const existeProduct = cart.products.find((prod) => prod.product.toString() === productId);
            if (existeProduct) {
                existeProduct.quantity = quantity; // Actualiza la cantidad
            } else {
                console.log("Error, no se ha podido encontrar el producto en el carrito");
                return null;
            }
    
            console.log(`Se ha actualizado la cantidad del producto del carrito correctamente`);
            return await cart.save(); // Guardar los cambios en el carrito
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    
    //eliminar un carrito
    async deleteCart(cartId){
        try {
            console.log(cartId)
            const cart = await cartModel.findByIdAndDelete(cartId);
            if (!cart){
                console.log("No fue posible encontrar el carrito por ese id");
                return null;
            }
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    //vaciar carrito
    async emptyCart(cartId){
        try {
            console.log(cartId)
            const cart = await cartModel.findById(cartId);
            if (!cart){
                console.log("No fue posible encontrar el carrito por ese id");
                return null;
            }
            cart.products = [];
            return await cart.save()
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    //finalizar compra de un carrito
    async purchaseCart(cartId, user) {
        const cart = await this.getCartById(cartId);
        if (!cart || !user || cart.products.length === 0) {
            return null;
        }
    
        let total = 0;
    
        for (const item of cart.products) {
            const product = await productService.getProductById(item.product);
    
            if (product && item.quantity > 0) {
                if (item.quantity > product.stock) {
                    const purchasableQuantity = product.stock; 
                    total += product.price * purchasableQuantity;

                    product.stock = 0;
                    await productService.updateProduct(item.product, { stock: product.stock });
    
                    item.quantity -= purchasableQuantity;
                    if (item.quantity <= 0) {
                        await this.deleteProductInCart(cartId, item.product);
                    } else {
                        await this.updateProductInCart(cartId, item.product, item.quantity);
                    }
                } else {
                    total += product.price * item.quantity;
                    product.stock -= item.quantity;
                    await productService.updateProduct(item.product, { stock: product.stock });
                    await this.deleteProductInCart(cartId, item.product);
                }
            }
        }
        if (total === 0) {
            return null;
        }
        const newTicket = await ticketModel.create({
            amount: total,
            purchaser: user.email,
            purchase_datetime: new Date(),
        });
    
        return newTicket;
    }

}

export default CartService;