//MIDDLEWARE PARA VERIFICAR SI ES O NO ES ADMIN
import passport from "passport";

export const isAdmin = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        
        if(err) {
            return next(err);
        }
        if(!user){
            console.log('Usuario no encontrado, redirigiendo a /login');
            return res.redirect('/login');
        }
        if(user.role !== "admin"){
            console.log('Usuario no es admin, redirigiendo a /home');
            return res.redirect('/');
        } 
        req.user = user;
        next()
    })(req,res,next)
};

export const isNotAdmin = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        
        if(err) {
            return next(err);
        }
        if(!user){
            console.log('Usuario no encontrado, redirigiendo a /login');
            return res.redirect('/login');
        }
        if(user.role === "admin"){
            console.log('Usuario es admin, redirigiendo a /realtimeproducts');
            return res.redirect('/realtimeproducts');
        } 
        req.user = user;
        next()
    })(req,res,next)
};