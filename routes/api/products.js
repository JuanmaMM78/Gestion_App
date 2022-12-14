const {getAll, create, upDate, getByProductActive, getById, getSalesBest}  = require('../../models/product.model');
const { body} = require('express-validator');
const { checkError } = require('../../helpers/validator');
const { checkRole } = require('../../helpers/middlewares');
const multer = require('multer');
const upload = multer({ dest: 'public/images' });
const fs = require('fs');
const router = require('express').Router(); 

/// DEVUELVE TODOS LOS PRODUCTOS
router.get('/', async (req, res) => {
    try {
        const products = await getAll();
        res.json(products);
    } catch (err) {
        res.json(err.message);
    }
});

/// DEVUELVE LOS PRODUCTOS MAS VENDIDOS VOL.
router.get('/sales/best',
    checkRole,
    async (req, res) => {
    try {
        const result = await getSalesBest();
        res.json(result);
    } catch (err) {
        res.json(err.message);
    }
});

/// FILTRO POR PRODUCTOS ACTIVOS
router.get('/active/:status', async (req, res) => {
    try{
        const {status} = req.params;
        const result = await getByProductActive(status);
        res.json(result);
    }
    catch (err) {
        res.json(err);
    }
})

/// registro y validacion de products
router.post('/register', upload.single('image'),
    checkRole,
    body('name_product')
        .isLength({ min: 3, max: 40 })
        .withMessage('El nombre debe tener entre 3 y 40 caracteres.'),

    body('origin')
        .custom((value) => {
            const regExpOrin =  /^[Cc]+ampo|[Rr]+efrigeracion$/;
            return regExpOrin.test(value);
        })
    .withMessage('El campo es obligatorio.'),
 
    body('caliber')
    .custom((value) => {
        const regExpOrin =  /^[Pp]+equeño|[Mm]+ediano|[Gg]+rande$/;
        return regExpOrin.test(value);
    })
    .withMessage('El campo es obligatorio.'),

    body('price')
        .custom((value) => {
            const regExpRole =  /^([0-9]{1,2}(\.[0-9]{1,2})?)$/;
            return regExpRole.test(value);
        })
        .withMessage('Ejemplo--> 23.45'),

    body('stock_initial')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('Número Max 7 dígitos.'),  
    
    body('stock_now')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('El stock actual Max 7 digitos'),   

    body('status')
        .custom((value) => {
            const regExpStatus =  /^[0-1]$/;
            return regExpStatus.test(value);
        })
        .withMessage('El campo es obligatorio.'),
    
        checkError,
              
    async (req, res) => {
        /// PREPARAMOS LA RUTA PARA LA INSERCION DE LA IMAGEN
        const extension = '.' + req.file.mimetype.split('/')[1];
        const newName = req.file.filename + extension;
        const newPath = req.file.path + extension;
    
        fs.renameSync(req.file.path, newPath);
        req.body.image = newName;
        /// INSERTAMOS EL PRODUCTO
        const result = await create(req.body);   
        res.json(result);
    },    
);

/// modificacion y validacion de products
router.put('/edit/:productId', upload.single('image'),
    checkRole,
    body('name_product')
        .isLength({ min: 3, max: 40 })
        .withMessage('El nombre debe tener entre 3 y 40 caracteres.'),

    body('origin')
        .custom((value) => {
            const regExpOrin =  /^[Cc]+ampo|[Rr]+efrigeracion$/;
            return regExpOrin.test(value);
        })
    .withMessage('El campo es obligatorio.'),
 
    body('caliber')
    .custom((value) => {
        const regExpOrin =  /^[Pp]+equeño|[Mm]+ediano|[Gg]+rande$/;
        return regExpOrin.test(value);
    })
    .withMessage('El campo es obligatorio.'),

    body('price')
        .custom((value) => {
            const regExpRole =  /^([0-9]{1,2}(\.[0-9]{1,2})?)$/;
            return regExpRole.test(value);
        })
        .withMessage('Ejemplo--> 23.45'),

    body('stock_initial')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('Número Max 7 digitos'),  
    
    body('stock_now')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('El stock actual Max 7 digitos'),   

    body('status')
        .custom((value) => {
            const regExpStatus =  /^[0-1]$/;
            return regExpStatus.test(value);
        })
        .withMessage('El campo es obligatorio.'),

        checkError,
     async (req, res) => {
        const { productId } = req.params;
        /// PREPARAMOS LA RUTA DEL ARCHIVO IMAGEN PARA INSERTARLO        
        const extension = '.' + req.file.mimetype.split('/')[1];
        const newName = req.file.filename + extension;
        const newPath = req.file.path + extension;
     
        fs.renameSync(req.file.path, newPath);
        req.body.image = newName;
        /// ACTUALIZAMOS EL PRODUCTO
        const result = await upDate(productId, req.body);
        res.json(result);
})

router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await getById(productId);
        res.json(product);
    } catch (err) {
        res.json(err);
    }
});

module .exports = router   