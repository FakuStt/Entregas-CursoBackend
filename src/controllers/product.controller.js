import ProductService from "../dao/classes/product.dao.js";

const productService = new ProductService;

export const getPaginateProducts = async (req, res) => {
    try {
        const result = await productService.getPaginateProducts(req.query);
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const getProductById = async (req,res) => {
    try {
        const pid = parseInt(req.params.pid);
        let productId = await productService.getProductById(pid);
        res.status(200).json(productId);
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const createProduct = async (req,res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        let newProduct = await productService.createProduct(title, description, code, price, status, stock, category, thumbnails);
        res.status(200).json(newProduct);
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const updatedProduct = async (req,res) => {
    try {
        const uId = parseInt(req.params.pid);
        const dataUser = req.body;
        let updateProduct = await productService.updateProduct(uId, dataUser);
        res.status(200).json(updateProduct); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const deleteProduct = async (req,res) => {
    try {
        const pId = parseInt(req.params.pid);
        const deletedProduct = productService.deleteProduct(pId);
        res.status(200).json(deletedProduct); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}