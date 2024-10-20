//Modelo de carrito
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const cartCollection = "carritos"

const cartSchema = new mongoose.Schema({
    products: [{
        product: {type: mongoose.Schema.Types.ObjectId, ref: "products", required: true},
        quantity: {type: Number, required: true, default: 1}
    }]
})

cartSchema.plugin(mongoosePaginate)

const cartModel = mongoose.model(cartCollection, cartSchema)

export default cartModel