const router = require('express').Router(); 

const { checkToken} = require('../helpers/middlewares');

const apiUsersRouter = require('./api/users'); 
const apiProductsRouter = require('./api/products');   
const apiOrdersRouter = require('./api/orders'); 
const apiClientsRouter = require('./api/clients'); 

router.use('/users', apiUsersRouter);
router.use('/products', checkToken, apiProductsRouter);
router.use('/orders',checkToken, apiOrdersRouter);
router.use('/clients', checkToken, apiClientsRouter);


module .exports = router   