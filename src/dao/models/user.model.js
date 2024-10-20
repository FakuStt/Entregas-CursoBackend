//Modelo de usuarios
import mongoose from "mongoose";

const userCollection = "Users";

const userSchema = new mongoose.Schema({
    first_name: {type: String, require: true},
    last_name: {type: String, require: true},
    email: { type: String, require: true, unique: true },
    age: {type: Number, require: true},
    password: {type: String, require: true},
    role: {type: String, default: "user"}
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel