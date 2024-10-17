import UserService from "../dao/classes/user.dao.js";
import { generateToken } from "../utils.js";
import { transport } from "../utils.js";

const userService = new UserService;

export const registerUser = async (req, res) => {
    try {
        const {first_name, last_name, email, age, password, role} = req.body;
        let user = await userService.registerUser(first_name, last_name, email, age, password, role);
        if(!user){
            res.redirect('/failregister')
        }
        const access_token = generateToken(user)
        res.cookie("jwt", access_token, {httpOnly: true, secure: false})
        console.log(user)
        await transport.sendMail({
            from:"facundo.stazione@gmail.com",
            to: user.email,
            subject: "Correo de bienvenida",
            html: `
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bienvenido a nuestra tienda</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        width: 100%;
                        background-color: #f4f4f4;
                        padding: 20px 0;
                    }
                    .email-content {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border: 1px solid #dddddd;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #333;
                        font-size: 24px;
                    }
                    p {
                        color: #666;
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .welcome-text {
                        margin-top: 20px;
                    }
                    .button-container {
                        margin-top: 30px;
                    }
                    .button-container a {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #dddddd;
                        font-size: 12px;
                        color: #999;
                    }
                </style>
            </head>
            <body>

                <div class="email-container">
                    <div class="email-content">
                        <h1>¡Bienvenido a nuestra tienda, ${user.first_name}!</h1>
                        <p class="welcome-text">Nos alegra mucho que te hayas unido a nuestra comunidad. Con tu cuenta en nuestra tienda, podrás disfrutar de una experiencia de compra personalizada, acceder a descuentos exclusivos y mucho más.</p>
                        <p>Recuerda que siempre puedes visitar tu perfil para actualizar tus datos o verificar tus compras recientes.</p>

                        <div class="button-container">
                            <a href="https://ecommerce.com/profile" target="_blank">Visita tu perfil</a>
                        </div>

                        <div class="footer">
                            <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos a través de nuestro servicio de atención al cliente.</p>
                            <p>¡Esperamos que disfrutes de tu experiencia con nosotros!</p>
                            <p><strong>El equipo de Tu tienda ecommerce</strong></p>
                        </div>
                    </div>
                </div>

            </body>
            `,
            attachments:[]
        })
        res.redirect('/profile')
    } catch (error) {
        console.log(error);
        res.redirect('/failregister')
    }
}

export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await userService.loginUser(email, password);
        if(!user){
            res.redirect('/faillogin')
        }
        const access_token = generateToken(user)
        res.cookie("jwt", access_token, {httpOnly: true, secure: false})

        await transport.sendMail({
            from:"facundo.stazione@gmail.com",
            to: user.email,
            subject: "Correo de login",
            html: `
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Inicio de Sesión Exitoso</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        width: 100%;
                        background-color: #f4f4f4;
                        padding: 20px 0;
                    }
                    .email-content {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border: 1px solid #dddddd;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #333;
                        font-size: 24px;
                    }
                    p {
                        color: #666;
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .login-info {
                        margin-top: 20px;
                        border-top: 1px solid #dddddd;
                        padding-top: 20px;
                    }
                    .login-info p {
                        margin: 5px 0;
                    }
                    .login-info strong {
                        color: #333;
                    }
                    .button-container {
                        margin-top: 30px;
                    }
                    .button-container a {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #dddddd;
                        font-size: 12px;
                        color: #999;
                    }
                </style>
            </head>
            <body>
    
                <div class="email-container">
                    <div class="email-content">
                        <h1>Inicio de sesión exitoso, ${user.first_name}!</h1>
                        <p>Te informamos que has iniciado sesión correctamente en tu cuenta de nuestra tienda ecommerce.</p>
    
                        <div class="button-container">
                            <a href="https://ecommerce.com/profile" target="_blank">Revisar mi perfil</a>
                        </div>
    
                        <div class="footer">
                            <p>Si no reconoces este inicio de sesión, por favor <a href="https://ecommerce.com/contact" target="_blank">contacta a nuestro soporte</a> de inmediato.</p>
                            <p><strong>El equipo de Tu tienda ecommerce</strong></p>
                        </div>
                    </div>
                </div>
    
            </body>
            `,
            attachments:[]
        })

        return res.redirect('/profile')
    } catch (error) {
        console.log(error);
        res.redirect('/faillogin')
    }
}

export const resetPasswordUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        let user = await userService.resetPasswordUser(email, password);
        if(!user){
            res.status(500).send({ status: "error", error: "Error interno del servidor" });
        }
        res.redirect('/realtimeproducts')
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const profileUser = async (req, res) => {
    try {
        let user = await userService.profileUser(req.user);
        res.send({ user })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: error.message });
    }
}