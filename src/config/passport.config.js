import passport from "passport";
import jwt from "passport-jwt";
import dotenv from "dotenv";
import userModel from "../models/user.model.js";
import GitHubStrategy from "passport-github2"

dotenv.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;


const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt']; // Nombre de la cookie que contiene el token
    }
    console.log('Token extraído de la cookie:', token);
    return token;
};

const initializePassport=()=>{

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY
    }, async(jwt_payload, done)=>{
        try {
            const user = await userModel.findById(jwt_payload.user._id);
            if (user) {
                return done(null, user);
            }else {
                console.log('Usuario no encontrado en la base de datos');
                return done(null, false); // Usuario no encontrado
            }
        } catch (error) {
            console.error('Error en la verificación del JWT:', error);
            return done(error)
        }
    }))


    passport.use('github', new GitHubStrategy({
        clientID: "Iv23liG33RmFOhLhs9HC",
        clientSecret: "f31b283dcfb0661c2913e6cf64ce884ea8fa3b14",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile)
            let user = await userModel.findOne({ email: profile._json.email })
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 20,
                    email: profile._json.email,
                    password: ""
                }
                let result = await userService.create(newUser)
                done(null, result)
            }
            else {
                done(null, user)
            }
        } catch (error) {
            console.log(error)
            res.redirect('/faillogin')
        }}))


    passport.serializeUser((user,done)=>{
        done(null, user._id)
    })
    passport.deserializeUser(async(id, done)=>{
        let user = await userModel.findById(id)
        done(null, user)
    })
}

export default initializePassport