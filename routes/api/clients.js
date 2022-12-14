const {getAll, create, upDate, getById, getAllActive, getBuyersBest}  = require('../../models/client.model');
const router = require('express').Router(); 
const { body} = require('express-validator');
const {checkError} = require('../../helpers/validator')

// Recupera los clientes
router.get('/', async (req, res) => {
    try {
        const result = await getAll();
        res.json(result);
    } catch (err) {
        res.json(err.message);
    }
});

/// DEVUELVE LOS PRODUCTOS MAS VENDIDOS VOL.
router.get('/buyers/best',
    async (req, res) => {
    try {
        const result = await getBuyersBest();
        res.json(result);
    } catch (err) {
        res.json(err.message);
    }
});

// Recupera en cliente por Activo/inactivo
router.get('/status/:active', async (req, res) => {
    try {
        const { active } = req.params;
        const cliente = await getAllActive(active);
        res.json(cliente);
    } catch (err) {
        res.json(err);
    }
});

// Registro y validacion de Cliente.
router.post('/register',
    body('name_client')
        .isLength({ min: 3, max: 35 })
        .withMessage('El nombre debe tener entre 3 y 35 caracteres.'),

    body('mail_client')
        .custom((value) => {
            const regExpMail = /^([a-zA-ZÀ-ÿ0-9_\.\-\u00f1\u00d1])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
            return regExpMail.test(value);
        })
        .withMessage('El formato de email no es válido.'),
        
    body('direction')
        .isLength({ min: 3, max: 50 })
        .withMessage('La dirección debe tener entre 3 y 50 caracteres.'),
    
    body('phone')
        .custom((value) => {
            const regExpPhone = /^[0-9]{9,11}$/;
            return regExpPhone.test(value);
        })
        .withMessage('El número debe tener entre 9 y 11 caracteres.'),

    body('status')
        .custom((value) => {
            const regExpStatus =  /^[0-1]$/;
            return regExpStatus.test(value);
        })
        .withMessage('El campo es obligatorio.'),
    checkError,    
    async (req, res) => {
        const result = await create(req.body);
        res.json(result);
    },
);

// Modificación y validación de clientes
router.put('/edit/:clientId',
    body('name_client')
        .isLength({ min: 3, max: 35 })
        .withMessage('El nombre debe tener entre 3 y 35 caracteres.'),

    body('mail_client')
        .custom((value) => {
        const regExpMail = /^([a-zA-ZÀ-ÿ0-9_\.\-\u00f1\u00d1])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
        return regExpMail.test(value);
        })
        .withMessage('El formato de email no es válido.'),

    body('direction')
        .isLength({ min: 3, max: 50 })
        .withMessage('La dirección debe tener entre 3 y 50 caracteres.'),

    body('phone')
        .custom((value) => {
            const regExpPhone = /^[0-9]{9,11}$/;
            return regExpPhone.test(value);
        })
        .withMessage('El número debe tener entre 9 y 11 caracteres.'),
        
    body('status')
        .custom((value) => {
            const regExpStatus =  /^[0-1]$/;
            return regExpStatus.test(value);
        })
        .withMessage('El campo es obligatorio.'),
    checkError,    
    async (req, res) => {
        const { clientId } = req.params;
        const result = await upDate(clientId, req.body);
        res.json(result);
    }
);

// Recupera en cliente por id
router.get('/:clienteId', async (req, res) => {
    try {
        const { clienteId } = req.params;
        const cliente = await getById(clienteId);
        res.json(cliente);
    } catch (err) {
        res.json(err);
    }
});

module .exports = router;  