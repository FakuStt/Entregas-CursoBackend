//FUNCIONES UTILES PARA USAR EN TODO EL CODIGO

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import productModel from './dao/models/products.model.js';
import cartModel from './dao/models/cart.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import nodemailer from 'nodemailer'
import dotenv from "dotenv";

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//obtener todos los productos
export async function getProducts(reqParams) {
        const limit = parseInt(reqParams.limit) || 10;
        const page = parseInt(reqParams.page, 10) || 1;
        const sort = reqParams.sort || 'asc';
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
        console.error('Error al obtener productos', error);
        console.log('No se pueden cargar los productos');
        return null;
    }
}

//agregar un producto al carrito
export async function agregarCarrito({ cartId, productId }, callback){
    const cart = await cartModel.findById(cartId);
            if (!cart) {
                const message = 'Carrito no encontrado';
                console.error(message);
                if (typeof callback === 'function') {
                    return callback({ success: false, message });
                }
                return;
            }
    
            const product = await productModel.findById(productId);
            if (!product) {
                const message = 'Producto no encontrado';
                console.error(message);
                if (typeof callback === 'function') {
                    return callback({ success: false, message });
                }
                return;
            }
    
            // Verifica si el producto ya está en el carrito
            const existingProduct = cart.products.find(p => p.product.toString() === productId.toString());
            if (existingProduct) {
                // Incrementa la cantidad si ya existe
                existingProduct.quantity += 1;
                console.log('Product quantity updated:', existingProduct);
            } else {
                // Agrega el producto al carrito
                cart.products.push({ product: productId, quantity: 1 });
                console.log('Product added:', { product: productId, quantity: 1 });
            }
    
            await cart.save();
            return cart
}

//autentificacion de passport
export const passportCall = (strategy)=>{
    return async(req,res,next)=>{
        passport.authenticate(strategy, function(err, user, info){
            if(err){
                return next(err)
            }
            if(!user){
                return res.status(401).send({error: info.message ? info.message: info.toString()})
            }
            req.user = user;
            next()
        })

        (req, res, next)
    }
}

//Hashear la password
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

//Validar password
export const isValidPassword = (user, password)=> bcrypt.compareSync(password, user.password)

const PRIVATE_KEY = process.env.PRIVATE_KEY

//generar token
export const generateToken = (user) => {
    const token = jwt.sign({user}, PRIVATE_KEY, {expiresIn: "1h"})
    return token
}

const authToken = (req,res,next)=>{
    const authHeader = req.headers.authorization
    if (!authHeader){
        return res.status(401).send({error: "No autenticado"})
    }
    const token = authHeader.split(" ")[1]
    jwt.verify(token, PRIVATE_KEY, (error, credentials)=> {
        if(error){
            return res.status(403).send({error: "No estas autorizado"})
        }
        req.user = credentials.user
        next()
    })
}

//autorizacion segun el rol
export const authorization = (role) => {
    return async (req, res, next) => {
        if(!req.user) return res.status(401).send({error: "Unauthorized"})
        if (req.user.role !== role) return res.status(403).send({error: "No permission"})
        next()
    }
}

//para enviar emails
export const transport = nodemailer.createTransport({
    service: "gmail",
    port: process.env.PORT,
    auth:{
        user:process.env.USER_EMAIL,
        pass:process.env.USER_PASS
    }
})

//agregar producto al carrito
export async function addProductToCart(cartId, productId, quantity = 1) {
    try {
        
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            throw new Error("Carrito no encontrado");
        }
        const existingProductIndex = cart.products.findIndex(product => product.productId.toString() === productId);
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }

        await cart.save();
        console.log("Producto agregado/modificado correctamente");
    } catch (error) {
        console.error("Error agregando producto al carrito:", error);
    }
}


export default { getProducts,agregarCarrito, __dirname, authToken };
