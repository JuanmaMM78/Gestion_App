const {getAll, create, upDate, getById, getByEmail, newPasssword, getStatusUsers}  = require('../../models/user.model');
const { body} = require('express-validator');
const { createToken, sendEmail } = require('../../helpers/utils');
const { checkError} = require('../../helpers/validator');
const { checkToken, checkRole } = require('../../helpers/middlewares');

const bcrypt = require('bcryptjs');
const router = require('express').Router(); 
const nodemailer = require("nodemailer");


router.get('/profile', checkToken, (req, res) => {
    res.json(req.user);
});

/// recupera todos lo usuarios
router.get('/', checkToken, 
    async (req, res) => {
    try {
        const result = await getAll();
        res.json(result);
    } catch (err) {
        res.json(err.message);
    }
});

/// recupera todos los usuarios por status
router.get('/status/:status',
    async (req, res) => {
        const {status} = req.params;
        try {
            const result = await getStatusUsers(status);
            res.json(result);
        } catch (err) {
            res.json(err.message);
        }
});

/// registro y validacion de Usuario y encriptacion del password
router.post('/register',
        checkToken,
        checkRole,
        body('name_user')
        .isLength({ min: 3, max: 20 })
        .withMessage('El nombre debe tener entre 3 y 20 caracteres.'),

        body('surname_user')
        .isLength({ min: 3, max: 30 })
        .withMessage('Los apellidos deben tener entre 3 y 30 caracteres.'),

        body('mail_user')
        .custom((value) => {
            const regExpMail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
            return regExpMail.test(value);
        })
        .withMessage('El formato de email no es válido.'),

        body('password_user')
        .custom((value) => {
            const regExpPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/;
            return regExpPassword.test(value);
        })
        .withMessage('La password debe contener: mayúscula, minúscula, un número y entre 4 y 8 caracteres.'),

        body('role')
        .custom((value) => {
            const regExpRole =  /^[Aa]+dmin|[Uu]+ser$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

        body('status')
        .custom((value) => {
            const regExpStatus =  /^[0-1]$/;
            return regExpStatus.test(value);
        })
        .withMessage('El campo es obligatorio.'),
        checkError,
    async (req, res) => {
        /// ENCRIPTAMOS LA PASSWORD ANTES DE INSERTAR EL USUARIO
        req.body.password_user = bcrypt.hashSync(req.body.password_user, 11);
        const result = await create(req.body);
        res.json(result);
    },
);

/// modificacion de password
router.put('/new-password/:userId',
        checkToken,
        body('password_user')
        .custom((value) => {
            const regExpPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/;
            return regExpPassword.test(value);
        })
        .withMessage('La password debe contener: mayúscula, minúscula, un número y entre 4 y 8 caracteres'),
        checkError,
    async (req, res) => {
        const { userId } = req.params;
        req.body.password_user = bcrypt.hashSync(req.body.password_user, 11);
        const result = await newPasssword(userId, req.body);
        res.json(result);
});

/// modificacion y validacion de Usuario y encriptacion del password
router.put('/edit/:userId',
        checkToken,
        checkRole,
        body('name_user')
        .isLength({ min: 3, max: 20 })
        .withMessage('El nombre debe tener entre 3 y 20 caracteres.'),

        body('surname_user')
        .isLength({ min: 3, max: 30 })
        .withMessage('El apellido debe tener entre 3 y 30 caracteres.'),

        body('mail_user')
        .custom((value) => {
            const regExpMail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
            return regExpMail.test(value);
        })
        .withMessage('El formato de email no es válido.'),

        body('role')
        .custom((value) => {
            const regExpRole =  /^[Mm]+aster|[Aa]+dmin|[Uu]+ser$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

        body('status')
        .custom((value) => {
            const regExpStatus =  /^[0-1]$/;
            return regExpStatus.test(value);
        })
        .withMessage('El campo es obligatorio.'),
        checkError,
    async (req, res) => {
        const { userId } = req.params;
        /// ENCRIPTAMOS LA PASSWORD ANTES DE MODIFICAR EL USUARIO
        req.body.password_user = bcrypt.hashSync(req.body.password_user, 11);
        const result = await upDate(userId, req.body);
        res.json(result);
});

// LOGIN Comprobación coincidencia del email en la DDBB y de la password
router.post('/login', async (req, res) => {
    const { mail_user, password_user } = req.body;

    const user = await getByEmail(mail_user);
    if (!user) {
        return res.status(403).json({ error: 'Error en usuario y/o contraseña' });
    }

    const equal = bcrypt.compareSync(password_user, user.password_user);
    if (!equal) {
        return res.status(403).json({ error: 'Error en usuario y/o contraseña' });
    }

    res.json({
        success: 'Login correcto',
        token: createToken(user)
    });
});

/// Envio de Email para recuperacion de Password
router.post('/send-email/recovery/:mailUser',
    async (req, res)=> {
        try {         
            const { mailUser } = req.params; 
            const user = await getByEmail(mailUser); 
            if (!user) {
                return res.status(403).json({ error: 'El usuario no existe' });
            }
            res.json({
                success: 'Envio correcto',
            });
            const token = createToken(user);
            const subject = "ThorAPP restablecer Usuario"
            const text = "Email de Recuperacion del Password";
            const link = `<h2>Hola ${user.name_user}</h2><p>Pincha en este enlace... <a href="http://localhost:4200/passwords?${token}">Link</a>...para cambiar tu Password.</p>`       
            const mail = await sendEmail(mailUser,text,link,subject)
        res.json(mail);
    } catch (err) {
        res.json(err);
    }
})

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await getById(userId);
        res.json(user);
    } catch (err) {
        res.json(err);
    }
});

module .exports = router;