import cartModel from "../models/cart.model.js";
import productModel from "../models/products.model.js";
import ProductService from "./product.dao.js";
import UserService from "./user.dao.js";
import ticketModel from "../models/ticket.model.js";

const productService = new ProductService;
const userService = new UserService;

class CartService{
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

    async getAllCarts(){
        try{
            const carts = cartModel.find();
            return carts;
        } catch(error){
            console.error(error)
            return null;
        }
    }

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

    async deleteProductInCart(cartId, productId){
        try{
            const product = await productModel.findById(productId);
            const cart = await cartModel.findById(cartId);
    
            if (!cart || !product){
                console.log("No fue posible encontrar el carrito o el producto por esos id");
                return null;
            }
            const existeProduct = cart.products.find((product) => product.product === productId)
            if (existeProduct) {
                cart = cart.products.filter((prod) => prod.product !== productId)
            } else {
                console.log("Error, no se ha podido encontrar el producto en el carrito");
                return null;
            }
            console.log(`Se ha eliminado el producto del carrito correctamente`);
            return await cart.save()
    
        }catch(error){
            console.error(error)
            return null;
        }
    }

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

    async updateProductInCart(cartId, productId, quantity){
        try {
            const product = await productModel.findById(productId);
            const cart = await cartModel.findById(cartId);
    
            if (!cart || !product){
                console.log("No fue posible encontrar el carrito o el producto por esos id");
                return null;
            }
    
            const existeProduct = cart.products.find((product) => product.product === productId)
            if (existeProduct) {
                existeProduct.quantity = quantity
            } else {
                console.log("Error, no se ha podido encontrar el producto en el carrito");
                return null;
            }
    
            console.log(`Se ha actualizado la cantidad del producto del carrito correctamente`);
            return await cart.save();
    
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    async deleteCart(cartId){
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart){
                console.log("No fue posible encontrar el carrito por ese id");
                return null;
            }
            cart.products = [];
            console.log(`Se ha actualizado la cantidad del producto del carrito correctamente`);
            return await cart.save();
    
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    async purchaseCart(cartId, userId){
        const cart = this.getCartById(cartId);
        const user = userService.getUserById(userId);
        if((!cart) || (!user) || (cart.products.length === 0)){
            return null;
        }
        let i = 0;
        let total = 0;
        while (i < cart.products.length){
            const item = cart.products[i];
            const product = productService.getProductById(item.product);
            if((product) && (item.quantity) <= product.stock){
                total += product.price * item.quantity;
                product.stock -= item.quantity;
                productService.updateProduct(item.product, product);
                this.deleteProductInCart(cartId, item.product)
            };
            i++;
        };
        if(total === 0){
            return null;
        };
        const newTicket = await ticketModel.create({
            amount: total,
            purchaser: user.email
        });
        return newTicket
    }
}

export default CartService;