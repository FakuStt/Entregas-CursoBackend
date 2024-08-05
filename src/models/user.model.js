import mongoose from "mongoose";


const userCollection = "usuarios"

const userSchema = new mongoose.Schema({
    nombre: {type:String, require:true, max: 100},
    apellido: {type:String, require:true, max: 50},
    email: {type:String, require:true, max: 20}
})

const userModel = mongoose.model(userCollection, userSchema)

export default userModel