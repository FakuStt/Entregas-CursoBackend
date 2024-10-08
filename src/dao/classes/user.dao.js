import userModel from "../models/user.model.js";
import { createHash } from "../../utils.js";
import { isValidPassword } from "../../utils.js";

class UserService {
    async getUsers(){
        let users = await userModel.find();
        return users;
    }

    async getUserById(id) {
        let user = await userModel.findById(id);
        return user;
    }

    async createUser(user) {
        let newUser = new userModel(user);
        let result = await newUser.save();
        return result;
    }

    async updateUser(id, newDataUser) {
        let updateUser = await userModel.findByIdAndUpdate(id, newDataUser);
        return updateUser;
    }

    async deleteUser(id) {
        let deletedUser = await userModel.findByIdAndDelete(id);
        return deletedUser;
    }

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