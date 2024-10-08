import ProductService from "../dao/classes/product.dao.js";
import CartService from "../dao/classes/cart.dao.js";

const productService = new ProductService;
const cartService = new CartService;

export const getAllProducts = async (req, res) => {
    try {
        const result = await productService.getPaginateProducts(req.query);
        const carts = await cartService.getAllCarts()//Probar con .lean()
        res.render('home', { 
            cart: carts,
            payload: result.docs,
            totalPages: result.totalPages,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink = result.hasPrevPage ? `http://localhost:8080/home?page=${result.prevPage}` : null,
            nextLink: result.nextLink = result.hasNextPage ? `http://localhost:8080/home?page=${result.nextPage}` : null,
            isValid: result.docs.length > 0 
        });
    } catch (error) {
        console.error(`Error al obtener productos: ${error.message}`);
        res.status(500).send('Error al obtener productos');
    }
}

export const getAllProductsAndCarts = async (req, res) => {
    try {
        const result = await productService.getPaginateProducts(req.query);
        const carts = await cartService.getAllCarts() //PROBAR CON .lean()
        res.render('realTimeProducts', { 
            cart: carts,
            payload: result.docs,
            totalPages: result.totalPages,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink = result.hasPrevPage ? `http://localhost:8080/home?page=${result.prevPage}` : null,
            nextLink: result.nextLink = result.hasNextPage ? `http://localhost:8080/home?page=${result.nextPage}` : null,
            isValid: result.docs.length > 0 
        });
    } catch (error) {
        console.error(`Error al obtener productos: ${error.message}`);
        res.status(500).send('Error al obtener productos');
    }
}