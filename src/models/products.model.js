import mongoose from "mongoose";


const productCollection = "productos"

const productSchema = new mongoose.Schema({
    
    title: {type:String, require:true},
    description: {type:String, require:true},
    code: {type:String, require:true},
    price: {type:Number, require:true},
    category: {type:String, require:true},
    status: {type:String, default: true, require: false},
    stock: {type:Number, require: true},
    thumbnails: {type:String, require:false}
    
})

const productModel = mongoose.model(productCollection, productSchema)

export default productModel