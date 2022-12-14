const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const { getById } = require('../models/user.model');

const checkToken = async (req, res, next) => {
    if (!req.headers['authorization']) {
        return res.json({ error: 'No has incluido la cabecera de autorización' });
    }
    const { authorization: token } = req.headers

    let obj;
    try {
        obj = jwt.verify(token, 'en un lugar de la mancha');
    } catch (error) {
        return res.json({ error: 'El token no tiene un formato válido' });
    }

    if (dayjs().unix() > obj.expiresAt) {
        return res.json({ error: 'El token ha caducado' });
    }

    const user = await getById(obj.userId)
    req.user = user;

    next();
}

/// COMPROBAMOS EL ROLE DEL USUARIO PARA EL ACCESO 
const checkRole = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'master') {
        return res.json({ error: 'Debes ser administrador' });
    }
    next();
}

module.exports = {
    checkToken, checkRole
}