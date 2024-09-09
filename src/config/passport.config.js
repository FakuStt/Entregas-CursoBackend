import passport from "passport";
import local from "passport-local"
import User from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";
import GitHubStrategy from "passport-github2"

const localStrategy = local.Strategy

const initializePassport=()=>{
    /*
    passport.use('register', new localStrategy({
        passReqToCallback:true, usernameField:'email'}, async (req, username, password, done)=>{
            const {first_name, last_name, email, age} = req.body
            try {
                let user = await userService.findOne({email: username})
                if(user){
                    console.log("El usuario existe")
                    return done(null, false)
                }

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                }

                let result = await userService.create(newUser)
                return done(null, result)

            } catch (error) {
                return done("Error al obtener el usuario" + error)
            }
        }
    ))

    */
   //AUTENTIFICACION CON GITHUB

   passport.use('github', new GitHubStrategy({
    clientID: "Iv23lisTnS9KEYmWqi8f",
    clientSecret: "a57898809d61b7f190d18ddd9365bc9b898f7110",
    callBackURL:"http://localhost:8080/api/sessions/githubcallback"
   },async (accessToken, refreshToken, profile, done)=>{
        try {
            console.log(profile)
            let user = await userService.findOne({email: profile._json.email})
            if(!user){
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 20,
                    email: profile._json.email,
                    password: ""
                }
                let result = userService.create(newUser)
                done(null, result)
            } else{
                done(null, user)
            }
        } catch (error) {
            
        }
   }))

    passport.serializeUser((user,done)=>{
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done)=>{
        let user = await userService.findById(id)
        done(null, user)
    })

    /*passport.use('login', new localStrategy({usernameField:'email'}, async(username, password, done)=>{
        try {
            const user = await userService.findOne({email: username})
            if (!user){
                console.log("El usuario no existe")
                return done(null, false)
            }
            if(!isValidPassword(user, password)) return done(null, false)
                return done(null, user)
        } catch (error) {
            return done(error)
        }
    }))*/
}

export default initializePassport