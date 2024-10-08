import CartService from "../dao/classes/cart.dao.js";

const cartService = new CartService;

export const createCart = async (req,res) => {
    try {
        let newCart = await cartService.createCart();
        console.log(`Carrito con ID ${newCart._id} creado correctamente`)
        res.send({status: "success", newCart}) //probar con payload: newCart
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const getCartById = async (req,res) => {
    try {
        const cartID = parseInt(req.params.cid);
        let cartById = await cartService.getCartById(cartID);
        res.send({status: "success", payload: cartById})
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const saveProductIdInCartId = async (req,res) => {
    try {
        const cartID = parseInt(req.params.cid);
        const productID = parseInt(req.params.pid);
        let updateCart = await cartService.saveProductIdInCartId(cartID, productID);
        res.send({status: "success", payload: updateCart});
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const deleteProductInCart = async (req,res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);
        let updateCart = await cartService.deleteProductInCart(cartId, productId);
        res.send({status: "success", payload: updateCart})
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const updateCart = async (req,res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const dataCart = req.body;
        let updCart = await cartService.updateCart(cartId, dataCart);
        res.send({status: "success", payload: updCart});
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const updateProductInCart = async (req,res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);
        const {quantity} = req.body;
        let updProCart = await cartService.updateProductInCart(cartId, productId, quantity);
        res.send({status: "success", payload: updProCart});
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const deleteCart = async (req,res) => {
    try {
        const cartId = parseInt(req.params.cid)
        let deletedCart = await cartService.deleteCart(cartId);
        res.send({status: "success", payload: deletedCart});
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const purchaseCart = async (req,res) => {
    try {
        const cartId = parseInt(req.params.cid)
        const userId = req.user._id
        const ticketCart = cartService.purchaseCart(cartId, userId)
        if(!ticketCart){
            console.log("No se ha podido completar la compra")
            res.redirect('/')
        };
        res.send({status: "success", ticketCart})
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }

}