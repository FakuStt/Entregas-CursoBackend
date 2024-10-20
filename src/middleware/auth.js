//MIDDLEWARE PARA AUTENTIFICAR
import passport from "passport";

export const isAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        
        if(err) {
            return next(err);
        }
        if(!user){
            console.log('Usuario no autenticado, redirigiendo a /login');
            return res.redirect('/login');
        } 
        req.user = user;
        next()
    })(req,res,next)
};

export const isNotAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (error, user) => {
        if(error) {
            return next(error);
        }
        if(!user) {
            return next()
        }
        return res.redirect('/profile')
    })(req,res,next)
};