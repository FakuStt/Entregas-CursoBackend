//UserService - Trabaja con la base de datos
import userModel from "../models/user.model.js";
import { createHash } from "../../utils.js";
import { isValidPassword } from "../../utils.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";

class UserService {

    //obtener todos los usuarios
    async getUsers(){
        let users = await userModel.find();
        return users;
    }

    //obtener usuario por id
    async getUserById(id) {
        let user = await userModel.findById(id);
        return user;
    }

    //crear usuario
    async createUser(user) {
        let newUser = new userModel(user);
        let result = await newUser.save();
        return result;
    }

    //actualizar usuario
    async updateUser(id, newDataUser) {
        let updateUser = await userModel.findByIdAndUpdate(id, newDataUser);
        return updateUser;
    }

    //eliminar usuario
    async deleteUser(id) {
        let deletedUser = await userModel.findByIdAndDelete(id);
        return deletedUser;
    }

    //ingresar con nuevo usuario
    async registerUser(first_name, last_name, email, age, password, role){
        try {
            if (!first_name || !last_name || !email || !age || !password) {
                console.log("Todos los campos son requeridos");
                return null;
            }
            let exists = await userModel.findOne({ email })
            if(exists){
                console.log("Usuario ya registrado");
                return null;
            }
            
            const newUser = await userModel.create({
                first_name,
                last_name,
                email,
                age,
                role,
                password:  createHash(password),
            })
            
            await newUser.save()
            return newUser;

        } catch (error) {
            console.log(error);
            return null;
        }
    }

    //ingresar con usuario existente
    async loginUser(email, password){
        try {
            if(!email || !password) {
                console.log("Todos los campos son requeridos");
                return null;
            }
            const user = await userModel.findOne({email})
            if (!user){
                console.log("Usuario o constrase'a incorrecta");
                return null;
            }
            if(!isValidPassword(user, password)){
                console.log("Usuario o contrase;a incorrecta");
                return null;
            }
            return user;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    //reestablecer constraseña
    async resetPasswordUser(email, password){
        try {
            const user = await userModel.findOne({ email });
            if (!user) {
                console.log("Usuario no encontrado");
                return null;
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;

            return await user.save();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    //perfil del usuario
    async profileUser(dataUser){
        try {
            console.log(dataUser)
            const user = await userModel.findById(dataUser._id).lean()
            if(!user){
                console.log("No se ha encontrado el usuario");
                return null;
            } 
            console.log(user);
            return user;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

}

export default UserService;