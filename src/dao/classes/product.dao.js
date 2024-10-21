//ProductService - Trabaja con la base de datos
import productModel from "../models/products.model.js";
import {getProducts} from "../../utils.js"

class ProductService {

    //obtener todos los productos paginados
    async getPaginateProducts(data){
        try{
            const result = await getProducts(data);
            return result;
        }catch (error){
            console.error(error)
            return null;
        }
    }

    //obtener producto por id
    async getProductById(pid){
        try {
            const encontrado = await productModel.findById(pid)
    
            if(encontrado){
                return encontrado;
            } else {
                console.log(`Producto con id ${productID} no fue encontrado`);
                return null;
            }
    
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    //crear producto
    async createProduct(title, description, code, price, status, stock, category, thumbnails){
        try {
            
            if (!title || !description || !code || !price || !stock || !category) {
                console.log("Todos los campos son requeridos");
                return null;
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
            return newProduct;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    //actualizar producto
    async updateProduct(pId, dataProd){
        try{
            const encontrado = await productModel.findByIdAndUpdate(pId, dataProd, {new: true});
        
            if (encontrado) {
                console.log("Producto actualizado con éxito");
                return encontrado;
            } else {
                console.log("No se ha encontrado producto con el id proporcionado");
                return null;
            }
        }catch(error){
            console.error(error);
            return null;
        }
    }

    //eliminar producto
    async deleteProduct(pId) {
        try {
            const encontrado = await productModel.findById(pId);
    
            if (encontrado) {
                const deletedProduct = await productModel.findByIdAndDelete(pId);
                console.log(`Producto con ID ${pId} eliminado correctamente`);
                return deletedProduct;
            } else {
                console.log(`Producto con ID ${pId} no se encontró`);
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    

}

export default ProductService;