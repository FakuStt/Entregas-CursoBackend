import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";


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

productSchema.plugin(mongoosePaginate)

const productModel = mongoose.model(productCollection, productSchema)

export default productModel