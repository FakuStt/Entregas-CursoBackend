import { Router } from "express";
import { existsSync, writeFileSync, readFileSync } from "fs";

const router = Router();
const filePath ='../cart.json';
const filePath2 = '../products.json'; 

//Agregar un carrito nuevo
router.post('/', (req,res) => {
    if (!existsSync(filePath)) {
        writeFileSync(filePath, JSON.stringify([])); 
    }

    const data = readFileSync(filePath, "utf8"); 
    const carts = JSON.parse(data);
    
    const lastCart = carts[carts.length - 1];
    const newCartId = lastCart ? lastCart.id + 1 : 1;


    const newCart = {
        id: newCartId,
        products: [],
    };
    
    carts.push(newCart);
    
    writeFileSync(filePath, JSON.stringify(carts, null, 2));
    
    res.status(200).json({msg:`Carrito con ID ${newCart.id} creado correctamente`});
    
})

//Mostrar un carrito por ID
router.get('/:cid', (req,res) => {
    const cartID = parseInt(req.params.cid)
    const data = readFileSync(filePath, "utf8"); 
    const carts = JSON.parse(data);
    const carts2 = carts.find((cart) => cart.id === cartID)
    if (carts2){
        res.json(carts2.products)
    }
    res.status(400).json({msg: "No se ha podido encontrar un carrito con ese ID"})
})

//Agregar un producto ID a un carrito por ID
router.post('/:cid/product/:pid', (req, res) => {
    const cartID = parseInt(req.params.cid);
    const productID = parseInt(req.params.pid);
    const data = readFileSync(filePath, "utf8");
    let carts = JSON.parse(data);

    const cart = carts.find((cart) => cart.id === cartID);

    if (!cart) {
        return res.status(404).json({ msg: "No fue posible encontrar el carrito por su id" });
    }

    const data2 = readFileSync(filePath2, "utf8");
    const products = JSON.parse(data2);

    const product = products.find((product) => product.id === productID);

    if (!product) {
        return res.status(404).json({ msg: "No fue posible encontrar el producto por su id" });
    }

    const existeProduct = cart.products.find((product) => product.product === productID);

    if (existeProduct) {
        existeProduct.quantity += 1;
    } else {
        cart.products.push({ product: productID, quantity: 1 });
    }

    writeFileSync(filePath, JSON.stringify(carts, null, 2));

    res.status(200).json({msg: `Se ha agregado 1 unidad del producto con id ${productID} al carrito con id ${cartID}`});
});




export default router;