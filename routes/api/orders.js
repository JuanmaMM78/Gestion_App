const {getAllAndClientName, create, upDate, getById, getByOrderClientId, getByOrderDate, getByOrderProductId, getByOrderUserId, getUserBest, getByProductDate, getByPriceDate, checkStock, getAllAndClientNamePaginated, getAllForClientProductDatePaginated, getStatusAndClientNamePaginated, getAllForClientProductDateStatusPaginated }  = require('../../models/order.model');
const { body} = require('express-validator');
const { checkError } = require('../../helpers/validator');
const { checkRole, checkToken } = require('../../helpers/middlewares');
const { sendEmail, createToken, Email } = require('../../helpers/utils');
const { upDateStock, upDateStockNew } = require('../../models/product.model');
const { getByEmail } = require('../../models/user.model');
const router = require('express').Router(); 

/// recupera todos los pedidos y los campos nombre usuario, nombre producto, nombre cliente de las distintas tablas
router.get('/',async (req, res) => {
    try {
        const result = await getAllAndClientName();
        res.json(result);
    } catch (err) {
        res.json(err.message);
    }
});

/// recupera todos los pedidos segun status y los campos nombre usuario, nombre producto, nombre cliente de las distintas tablas, paginado
router.get('/status/:status/:page/:limit',
    async (req, res) => {
        const {status} = req.params;
        const {page} = req.params;
        const {limit} = req.params; 
        try {
            const result = await getStatusAndClientNamePaginated(status, page, limit);
            res.json(result);
        } catch (err) {
            res.json(err.message);
        }
});

/// recupera todos los pedidos y los campos nombre usuario, nombre producto, nombre cliente de las distintas tablas, paginado
router.get('/paginated/:page/:limit',
    async (req, res) => {
        const {page} = req.params;
        const {limit} = req.params; 
        try {
            const result = await getAllAndClientNamePaginated(page, limit);
            res.json(result);
        } catch (err) {
            res.json(err.message);
        }
});

/// recupera el usuario que mas vendio, cantidad y precio
router.get('/user/best',
    checkRole,
    async (req, res) => {
    try {
        const result = await getUserBest();
        res.json(result);
    } catch (err) {
        res.json(err.message);
    }
});

/// registro y validacion de products
router.post('/register/:mailUser',
    body('id_client')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),  

    body('id_product')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

    body('vol_sale')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('Número Max 7 caracteres.'),  
                
    body('shipping')
        .custom((value) => {
            const regExpRole =  /^[Pp]+aquete|[Pp]+alets completo|[Pp]+alets incompleto$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

    body('meth_payment')
        .custom((value) => {
            const regExpRole =  /^[Tt]+arjeta|[Oo]+tros$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

    body('price_sale')
        .custom((value) => {
            const regExpRole =  /^([0-9]{1,2}(\.[0-9]{1,2})?)$/;
            return regExpRole.test(value);
        })
        .withMessage('Ejemplo--> 23.45'),

    body('id_user')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,4}$/;
            return regExpRole.test(value);
        })
        .withMessage('Deve ser un numero'),  

    body('date_order')
        .custom((value) => {
            const regExpRole =  /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
            return regExpRole.test(value);
        })
        .withMessage('La fecha debe tener el formato yyy-mm-dd'),

    body('status')
        .custom((value) => {
            const regExpRole =  /^[Aa]+ceptado|[Dd]+enegado|[Pp]+endiente$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

    body('comment')
        .isLength({max: 100 })
        .withMessage('Maximo 100 caracteres'),
        checkError,
       
    async (req, res) => {  
        const status = req.body.status;
        const comment = req.body.comment;
        const volSale = req.body.vol_sale; 
        const productId = req.body.id_product;
        const stock = await checkStock(productId);
        const stockNow = stock[0].stock_now
        const {mailUser} = req.params; 
             
         /// ENVIAMOS AVISO DE PEDIDO PENDIENTE POR EMAIL
        if (status === 'pendiente' && mailUser !== 'nomail@none.non') {
            const user = await getByEmail(mailUser);
            const userName = user.name_user; 
            const result = await create(req.body);
            const orderId = result.insertId;     
            Email(orderId, status, mailUser,user,userName,comment);
            res.json(result);

        } if (status === 'pendiente' && mailUser === 'nomail@none.non') {        
            res.json({errorMail:'No enviaste email'})

        } if (status !== 'pendiente') {
            /// COMPROBAMOS SI HAY ESTOCK ANTES DE INSERTAR EL PRODUCTO
            if (stockNow >= volSale){
                const result = await create(req.body);
                const orderId = result.insertId;            
                res.json(result);
                /// ACTUALIZAMOS EL STOCK ACTUAL
                if (status === 'aceptado'){
                    await upDateStock(orderId); 
                }              
            } else {
                return res.json({errorStock:'No hay Stock suficiente de este Producto!!!'})
            }   
         }      
    }      
);

/// modificacion de un pedido y validacion de products
router.put('/edit/:idOrder/:mailUser',
      body('id_client')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),  

    body('id_product')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

    body('vol_sale')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,7}$/;
            return regExpRole.test(value);
        })
        .withMessage('Número Max 7 caracteres.'),  
                
   body('shipping')
        .custom((value) => {
            const regExpRole =  /^[Pp]+aquete|[Pp]+alets completo|[Pp]+alets incompleto$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

    body('meth_payment')
        .custom((value) => {
            const regExpRole =  /^[Tt]+arjeta|[Oo]+tros$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

    body('price_sale')
        .custom((value) => {
            const regExpRole =  /^([0-9]{1,2}(\.[0-9]{1,2})?)$/;
            return regExpRole.test(value);
        })
        .withMessage('Ejemplo--> 23.45'),

    body('id_user')
        .custom((value) => {
            const regExpRole =  /^[0-9]{1,4}$/;
            return regExpRole.test(value);
        })
        .withMessage('Deve ser un numero'),  

    body('date_order')
        .custom((value) => {
            const regExpRole =  /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
            return regExpRole.test(value);
        })
        .withMessage('La fecha debe tener el formato yyy-mm-dd'),

    body('status')
        .custom((value) => {
            const regExpRole =  /^[Aa]+ceptado|[Dd]+enegado|[Pp]+endiente$/;
            return regExpRole.test(value);
        })
        .withMessage('El campo es obligatorio.'),

    body('comment')
        .isLength({max: 100 })
        .withMessage('Maximo 100 caracteres'),
        checkError,
    async (req, res) => {
        
        const status = req.body.status;
        const comment = req.body.comment;
        const volSale = req.body.vol_sale; 
        const productId = req.body.id_product;
        const stock = await checkStock(productId);
        const stockNow = stock[0].stock_now
        const {mailUser} = req.params; 
        const { idOrder } = req.params;
        const order = await getById(idOrder);
          /// ENVIAMOS AVISO DE PEDIDO PENDIENTE POR EMAIL
        if (mailUser !== 'nomail@none.non') {
            const user = await getByEmail(mailUser);
            const userName = user.name_user;   
            await Email(idOrder, status, mailUser,user,userName,comment);        
        }       
        /// CONTROLAMOS QUE NO VAYA VACIO EL DESTINATARIO DEL EMAIL
        if (order.status === 'pendiente' && mailUser === 'nomail@none.non' || status === 'pendiente' && mailUser === 'nomail@none.non') {     
             return res.json({errorMail:'Selecciona destinatario'});
        } 
            /// COMPROBAMOS SI HAY ESTOCK ANTES DE INSERTAR EL PRODUCTO
            if (stockNow >= volSale){
            /// ACTUALIZAMOS EL STOCK SEGUN EL ESTADO ANTERIOR                    
                if (order.status === 'aceptado'){
                    const volOrder = order.vol_sale;
                    await upDateStockNew(volOrder, idOrder); 
                } 
                /// ACTUALIZAMOS EL STOCK ACTUAL   
                if (status === 'aceptado'){
                    await upDateStock(idOrder); 
                }
                /// GUARDAMOS EL CAMBIO DEL PEDIDO A DDBB                
                const result = await upDate(idOrder, req.body);           
                res.json(result);                        
            } else {
                res.json({errorStock:'No hay Stock suficiente de este Producto!!!'})
            }         
    },
);

/// recupera todos los pedidos por usuario
router.get('/user/:userId', 
    async (req, res) => {
    const { userId } = req.params;
    try {
    const orders = await getByOrderUserId(userId);
    res.json(orders);
    } catch (err) {
        res.json(err.message);
    }
})

/// recupera pedidos por un producto
router.get('/product/:productId', 
    async (req, res) => {
        const { productId } = req.params;
    try {
        const orders = await getByOrderProductId(productId);
        res.json(orders);
    } catch (err) {
        res.json(err.message);
    }
})

/// recupera pedidos por un cliente
router.get('/client/:clientId', 
    async (req, res) => {
        const { clientId } = req.params;
    try {
        const orders = await getByOrderClientId(clientId);    
        res.json(orders);
    } catch (err) {
        res.json(err.message);
    }
})

/// recupera pedidos por fecha
router.get('/date/:dateOrder',
    async (req, res) => {
        const { dateOrder } = req.params;
        const date = new Date(dateOrder)
        const year = date.getFullYear();
        const month = date.getMonth()+1;
        const dt = date.getDate();
        const dateFormat= (year+'-' + month + '-'+dt);
    try {
    const orders = await getByOrderDate(dateFormat);
    res.json(orders);
    } catch (err) {
        res.json(err.message);
    }
})

///recupera todos los pedidos filtrados por fecha, cliente , producto y estado
router.get('/sales/filter/status/:clientId/:productId/:status/:datesince/:dateuntil/:page/:limit',
    checkRole,
    async (req, res) => {
        const { clientId } = req.params;
        const { productId } = req.params;  
        const { datesince } = req.params;
        const { dateuntil } = req.params;
        const { status } = req.params;    
        const { page } = req.params;
        const { limit } = req.params;      
    try {
        const orders = await getAllForClientProductDateStatusPaginated(clientId, productId, status,datesince, dateuntil, page, limit)
        res.json(orders);
    } catch (err){
        res.json(err.message)
    }   
})

///recupera todos los pedidos filtrados por fecha, cliente y producto
router.get('/sales/filter/:clientId/:productId/:datesince/:dateuntil/:page/:limit',
    checkRole,
    async (req, res) => {
        const { clientId } = req.params;
        const { productId } = req.params;  
        const { datesince } = req.params;
        const { dateuntil } = req.params;   
        const { page } = req.params;
        const { limit } = req.params;      
    try {
        const orders = await getAllForClientProductDatePaginated(clientId, productId, datesince, dateuntil, page, limit)
        res.json(orders);
    } catch (err){
        res.json(err.message)
    }   
})

///recupera el volumen de venta de productos en una franja de fechas
router.get('/sales/:datesince/:dateuntil',
    checkRole,
    async (req, res) => {
        const { datesince } = req.params;
        const { dateuntil } = req.params;       
    try {
        const orders = await getByProductDate(datesince, dateuntil)
        res.json(orders);
    } catch (err){
        res.json(err.message)
    }   
})

///recupera el volumen de venta de productos en una franja de fechas
router.get('/sales/price/:datesince/:dateuntil',
    checkRole,
    async (req, res) => {
        const { datesince } = req.params;
        const { dateuntil } = req.params;       
    try {
        const orders = await getByPriceDate(datesince, dateuntil)
        res.json(orders);
    } catch (err){
        res.json(err.message)
    }   
})

/// recupera el usuario que mas ha vendido, cantidad y precio
router.get('/user/best',
    checkRole,
    async (req, res) => {
        const { datesince } = req.params;
        const { dateuntil } = req.params;
    try {
        const result = await getUserBest(datesince, dateuntil);
        res.json(result);
    } catch (err) {
        res.json(err.message);
    }
});

/// envio de mail para validacion del pedido
router.post('/send-email/reminder/:orderId/:status/:mailUser', checkToken,
    async (req, res)=> {
    try {       
        const {orderId} = req.params;  
        const {status} = req.params;  
        const { mailUser } = req.params; 
        const Status = status.toUpperCase();
        const user = await getByEmail(mailUser); 
        if (!user) {
            return res.status(403).json({ error: 'El usuario no existe' });
        }
        res.json({
            success: 'Envio correcto',
        });
        const token = createToken(user);
        const text = "Email de Validación de Pedido";
        const link = `<h3>Hola ${user.name_user} el pedido <strong>nº${orderId}</strong> esta en el estado de <strong>${Status}</strong> </h3><P>Pincha en este enlace... <a href="http://localhost:4200/">Link</a>...para ver el pedido.</P>`    
        const mail = await sendEmail(mailUser,text,link)

    res.json(mail);
} catch (err) {
    res.json(err);
}
});

/// recupera todos los pedidos por id
router.get('/:orderId', 
    async (req, res) => {
    const { orderId } = req.params;
    try {
    const order = await getById(orderId);
    res.json(order);
    } catch (err) {
        res.json(err.message);
    }
})


module .exports = router   