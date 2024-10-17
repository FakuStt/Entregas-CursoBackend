import CartService from "../dao/classes/cart.dao.js";
import { transport } from "../utils.js";

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
        console.log(req.params.cid)
        let cartById = await cartService.getCartById(req.params.cid);
        res.render('cartDetail', { cart: cartById })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

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
            res.redirect('/api/carts')
        };
        await transport.sendMail({
            from:"facundo.stazione@gmail.com",
            to: req.user.email,
            subject: "Compra finalizada",
            html: `
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Compra Finalizada - Ticket</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        width: 100%;
                        background-color: #f4f4f4;
                        padding: 20px 0;
                    }
                    .email-content {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border: 1px solid #dddddd;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }       
                    h1 {
                        color: #333;
                        font-size: 24px;
                    }
                    p {
                        color: #666;
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .ticket-info {
                        margin-top: 20px;
                        border-top: 1px solid #dddddd;
                        padding-top: 20px;
                    }
                    .ticket-info p {
                        margin: 5px 0;
                    }
                    .ticket-info strong {
                        color: #333;
                    }
                    .button-container {
                        margin-top: 30px;
                    }
                    .button-container a {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #dddddd;
                        font-size: 12px;
                        color: #999;
                    }
                </style>
            </head>
            <body>

                <div class="email-container">
                    <div class="email-content">
                        <h1>¡Gracias por tu compra, ${ticketCart.purchaser}!</h1>
                        <p>Tu compra ha sido completada exitosamente. A continuación te proporcionamos los detalles de tu ticket de compra:</p>

                        <div class="ticket-info">
                            <p><strong>Código del Ticket:</strong> ${ticketCart.code}</p>
                            <p><strong>Fecha de la Compra:</strong> ${ticketCart.purchase_datetime}</p>
                            <p><strong>Monto Total:</strong> $${ticketCart.amount}</p>
                            <p><strong>Comprador:</strong> ${ticketCart.purchaser}</p>
                        </div>

                        <div class="button-container">
                            <a href="https://eccommerce.com" target="_blank">Visita nuestra tienda</a>
                        </div>

                        <div class="footer">
                            <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos a través de nuestro servicio de atención al cliente.</p>
                            <p>Gracias por confiar en nosotros.</p>
                            <p><strong>Tu tienda ecommerce</strong></p>
                        </div>
                    </div>
                </div>

            </body>
            `,
            attachments:[]
        })

        res.render('ticket', {ticketCart})
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }

}