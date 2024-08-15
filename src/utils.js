import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import productModel from './models/products.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productsFilePath = path.join(__dirname, 'jsons', 'products.json');


export async function getProducts(reqParams) {
        const limit = parseInt(reqParams.limit) || 10;
        const page = parseInt(reqParams.page, 10) || 1;
        const sort = reqParams.sort || 'asc'; // Valor por defecto
        const query = reqParams.query || '';

        let queryObject = {};
        if (query) {
            queryObject.category = { $regex: query, $options: 'i' };
        }

        let sortOptions = {};
        if (sort === 'asc') {
            sortOptions = { price: 1 };
        } else if (sort === 'desc') {
            sortOptions = { price: -1 };
        }
        

        const options = {
            limit: limit,
            page: page,
            sort: sortOptions,
            lean: true
        };

    try {
        const result = await productModel.paginate(queryObject, options);
        return result
    } catch (error) {
        console.error('Error al obtener productoss', error);
        res.status(500).json({ error: 'No se pueden cargar los productos', err });
    }
}



export default { getProducts, __dirname };
