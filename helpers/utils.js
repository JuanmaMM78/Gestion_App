const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
}

const executeQueryOne = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) resolve(null);
            resolve(result[0]);
        });
    });
}

const createToken = (user) => {
    const obj = {
        userId: user.id_user,
        userRole: user.role,
        expiresAt: dayjs().add(1000, 'hours').unix()
    }
    return jwt.sign(obj, 'en un lugar de la mancha');
}



/// ENVIO DE EMAIL
const sendEmail = (mailUser, text, link, subject) => {   
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, 
        auth: {
        user: 'ThorAppProject@gmail.com',
        pass: 'cvporfxuzlzdjzyu',
        },
    });    
    const mailDate = {
        from: "ThorAppProject@gmail.com",
        to: mailUser,
        subject: subject,
        text: text,
        html: link
    }
    transporter.sendMail(mailDate, (error, info)=>{
        if(error) {
            res.status(500).send(error.message);
        } else {
            res.status(200).jsonp(req.body);
        }
    })
        return   
}

/// ENVIO DE MAIL DE LOS PEDIDOS PENDIENTES
const Email = async(orderId, status, mailUser, user, userName, comment) => { 
            const subject = `ThorAPP Notificación pedido nº ${orderId}`
            const Status = status.toUpperCase();
            const UserName = userName.toUpperCase();
            const token = createToken(user);
            const text = "Email de Validación de Pedido";
            const link = `<h3>Hola ${UserName} el pedido <strong>nº${orderId}</strong> esta en el estado de <strong>${Status}</strong> </h3><p>Comentario: ${comment}<p/><br><P>Pincha en este enlace... <a href="http://localhost:4200/">Link</a>...para ver el pedido.</P>`   
            return sendEmail(mailUser,text,link,subject)             
   
}

module.exports = {
    executeQuery, executeQueryOne, createToken,sendEmail,Email
}