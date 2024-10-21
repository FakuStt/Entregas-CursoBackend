//CONTROLADOR PARA CARRITOS - NO TRABAJA CON LA BASE DE DATOS
import CartService from "../dao/classes/cart.dao.js";
import { transport } from "../utils.js";

const cartService = new CartService;

//crear carrito
export const createCart = async (req,res) => {
    try {
        let newCart = await cartService.createCart();
        console.log(`Carrito con ID ${newCart._id} creado correctamente`)
        res.send({status: "success", newCart})
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//vaciar carrito
export const emptyCart = async (req,res) => {
    try {
        const cartId = req.params.cid;
        let emptyCart = await cartService.emptyCart(cartId);
        res.send({status: "success", payload: emptyCart});
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//obtener carrito por id
export const getCartById = async (req,res) => {
    try {
        console.log(req.params.cid)
        let cartById = await cartService.getCartById(req.params.cid);
        console.log(cartById)
        res.render('cartDetail', { cart: cartById })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//obtener todos los carritos
export const getAllCarts = async (req,res) => {
    try {
        const carts = await cartService.getAllCarts()
        console.log(carts)
        res.render('carts', { carts })
    } catch (error) {
        console.error('Error al obtener carritos:', error);
        res.status(500).send('Error al obtener carritos');
    }
}

//guardar producto en carrito
export const saveProductIdInCartId = async (req,res) => {
    try {
        const {  quantity } = req.body;
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const cart = await cartService.getCartById(cartId);

        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        const productIndex = cart.products.findIndex(p => p.product == productId);

        if (productIndex > -1) {
            cart.products[productIndex].quantity += parseInt(quantity);
        } else {
            cart.products.push({ product: productId, quantity: parseInt(quantity) });
        }

        const updatedCart = await cart.save();
        res.json({ status: "success", cart: updatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//eliminar producto de carrito
export const deleteProductInCart = async (req, res) => {
    try {
        const cartId = req.params.cid;
        console.log(cartId)
        const productId = req.params.pid;
        let updateCart = await cartService.deleteProductInCart(cartId, productId);
        res.send({ status: "success", payload: updateCart });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

//actualizar carrito
export const updateCart = async (req,res) => {
    try {
        const cartId = req.params.cid;
        const dataCart = req.body;
        let updCart = await cartService.updateCart(cartId, dataCart);
        res.send({status: "success", payload: updCart});
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//actualizar producto en carrito
export const updateProductInCart = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body;

        if (isNaN(quantity) || quantity < 0) {
            return res.status(400).send({ status: "error", message: "La cantidad debe ser un número válido y mayor o igual a 0." });
        }

        const updProCart = await cartService.updateProductInCart(cartId, productId, quantity);
        if (!updProCart) {
            return res.status(404).send({ status: "error", message: "No se encontró el carrito o el producto." });
        }

        res.send({ status: "success", payload: updProCart });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

//eliminar carrito
export const deleteCart = async (req,res) => {
    try {
        const cartId = req.params.cid
        console.log(cartId)
        let deletedCart = await cartService.deleteCart(cartId);
        res.send({status: "success", payload: deletedCart});
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

//finalizar compra de carrito
export const purchaseCart = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const user = req.user;

        const ticketCart = await cartService.purchaseCart(cartId, user); 
        
        if (!ticketCart) {
            console.log("No se ha podido completar la compra");
            return res.status(400).json({ status: "error", message: "No se pudo completar la compra." });
        }

        await transport.sendMail({
            from: process.env.EMAIL,
            to: req.user.email,
            subject: "Compra finalizada",
            html: `
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Compra Finalizada - Ticket</title>
                </head>
                <body>
                    <h1>¡Gracias por tu compra, ${ticketCart.purchaser}!</h1>
                    <p>Tu compra ha sido completada exitosamente. A continuación los detalles:</p>
                    <p><strong>Código del Ticket:</strong> ${ticketCart.code}</p>
                    <p><strong>Fecha de la Compra:</strong> ${ticketCart.purchase_datetime}</p>
                    <p><strong>Monto Total:</strong> $${ticketCart.amount}</p>
                    <p><strong>Comprador:</strong> ${ticketCart.purchaser}</p>
                </body>
            `
        });

        return res.render('ticket', { ticketCart });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "error", message: error.message });
    }
};
