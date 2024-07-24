import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productsFilePath = path.join(__dirname, 'jsons', 'products.json');

let products = [];

try {
    const data = readFileSync(productsFilePath, 'utf8');
    products = JSON.parse(data);
} catch (error) {
    console.error('Error leyendo el archivo de productos:', error);
}

export function getProducts() {
    return products;
}

export function addProduct(product) {
    product.id = products.length ? products[products.length - 1].id + 1 : 1;
    products.push(product);
    saveProducts();
}

export function deleteProduct(id) {
    products = products.filter(product => product.id !== parseInt(id, 10));
    saveProducts();
}

function saveProducts() {
    try {
        writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
    } catch (error) {
        console.error('Error guardando el archivo de productos:', error);
    }
}

export default { getProducts, addProduct, deleteProduct, __dirname };
