const { executeQuery, executeQueryOne} = require('../helpers/utils');

const getByAllPage = (page, limit) => {
    const offset = (page - 1) * limit;
    return executeQuery(
        'select * from country limit ? offset ?',
        [parseInt(limit), parseInt(offset)]
    );
}

const getAllAndClientName = () => {
    return executeQuery('SELECT orders.*, products.image, clients.name_client, products.name_product, users.name_user from clients INNER JOIN  orders ON clients.id_client = orders.id_client INNER JOIN products ON products.id_product = orders.id_product INNER JOIN users ON users.id_user = orders.id_user order by orders.id_order desc');
}

const getStatusAndClientNamePaginated = (status,page, limit) => {
    const offset = (page -1) * limit;
    return executeQuery('SELECT orders.*, products.image, clients.name_client, products.name_product, users.name_user from clients INNER JOIN  orders ON clients.id_client = orders.id_client INNER JOIN products ON products.id_product = orders.id_product INNER JOIN users ON users.id_user = orders.id_user where orders.status = ? order by orders.id_order desc limit ? offset ?', [status, parseInt(limit), parseInt(offset)]);
}

const getAllAndClientNamePaginated = (page, limit) => {
    const offset = (page -1) * limit;
    return executeQuery('SELECT orders.*, products.image, clients.name_client, products.name_product, users.name_user from clients INNER JOIN  orders ON clients.id_client = orders.id_client INNER JOIN products ON products.id_product = orders.id_product INNER JOIN users ON users.id_user = orders.id_user order by orders.id_order desc limit ? offset ?', [parseInt(limit), parseInt(offset)]);
}

const getById = (orderId) => {
    return executeQueryOne('select * from orders where id_order = ?', [orderId]);
}

const getByOrderProductId = (productId) => {
    return executeQuery('select orders.*, clients.name_client, products.name_product from clients inner join orders on orders.id_client = clients.id_client INNER JOIN products ON products.id_product = orders.id_product where orders.id_product = ?', [productId]);
}

const getByOrderClientId = (clientId) => {
    return executeQuery('select orders.*, clients.name_client, products.name_product from clients inner join orders on orders.id_client = clients.id_client INNER JOIN products ON products.id_product = orders.id_product where clients.id_client = ?', [clientId]);
}

const getByOrderDate = (dateOrder) => {
    return executeQuery('select orders.*, clients.name_client, products.name_product from clients inner join orders on orders.id_client = clients.id_client INNER JOIN products ON products.id_product = orders.id_product where orders.date_order = ?', [dateOrder]);
}

const getByOrderUserId = (userId) => {
    return executeQuery('select * from orders where id_user = ?', [userId]);
}

const create = ({id_client, id_product, vol_sale, shipping, meth_payment, price_sale, id_user, date_order, status, comment }) => {
    return executeQuery ('insert into orders (id_client, id_product, vol_sale, shipping, meth_payment, price_sale, id_user, date_order, status, comment ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id_client, id_product, vol_sale, shipping, meth_payment, price_sale, id_user, date_order, status, comment ]);
}

const upDate = (orderId, { id_client, id_product, vol_sale, shipping, meth_payment, price_sale, id_user, date_order, status, comment }) =>{
    return executeQuery('update orders set id_client = ?, id_product = ?, vol_sale = ?, shipping = ?, meth_payment = ?, price_sale = ?, id_user = ?, date_order = ?, status = ?, comment = ? where id_order = ?', [id_client, id_product, vol_sale, shipping, meth_payment, price_sale, id_user, date_order, status,comment, orderId]);
}

const getByProductDate = (datesince, dateuntil) => {
    return executeQuery('SELECT SUM(vol_sale) AS total_vol_sale, products.name_product FROM orders INNER JOIN products ON products.id_product = orders.id_product WHERE date_order BETWEEN ? AND ? GROUP BY products.name_product ORDER BY total_vol_sale desc ', [datesince, dateuntil])
}

const getByPriceDate = (datesince, dateuntil) => {
    return executeQuery('SELECT SUM(vol_sale) AS total_vol_sale, SUM(ROUND(price_sale * vol_sale),2) AS vol_price_sale, products.name_product FROM orders INNER JOIN products ON products.id_product = orders.id_product WHERE date_order BETWEEN ? AND ? GROUP BY products.name_product ORDER BY total_vol_sale desc', [datesince, dateuntil])
}

const getUserBest = () => {
    return executeQuery('SELECT users.* , sum(round((orders.price_sale * orders.vol_sale),2)) AS vol_price_sale FROM orders INNER JOIN users ON users.id_user = orders.id_user WHERE orders.status ="aceptado" GROUP BY users.name_user ORDER BY vol_price_sale desc')
}

const getAllForClientProductDatePaginated = (client,product,datesince,dateuntil,page,limit) => {
    const offset = (page -1) * limit;
    return executeQuery('SELECT orders.*, products.image, clients.name_client, products.name_product, users.name_user from clients INNER JOIN  orders ON clients.id_client = orders.id_client INNER JOIN products ON products.id_product = orders.id_product INNER JOIN users ON users.id_user = orders.id_user where clients.id_client = ? and products.Id_product = ? and orders.date_order between ? and ? order by orders.id_order desc limit ? offset ?', [client,product,datesince,dateuntil,parseInt(limit), parseInt(offset)]);
}

const getAllForClientProductDateStatusPaginated = (client,product,status,datesince,dateuntil,page,limit) => {
    const offset = (page -1) * limit;
    return executeQuery('SELECT orders.*, products.image, clients.name_client, products.name_product, users.name_user from clients INNER JOIN  orders ON clients.id_client = orders.id_client INNER JOIN products ON products.id_product = orders.id_product INNER JOIN users ON users.id_user = orders.id_user where clients.id_client = ? and products.Id_product = ? and orders.status = ? and orders.date_order between ? and ? order by orders.id_order desc limit ? offset ?', [client,product,status,datesince,dateuntil,parseInt(limit), parseInt(offset)]);
}

const checkStock = (productId) => {
    return executeQuery('select stock_now from products where id_product = ?', [productId])
}

module.exports = {
    getAllAndClientName, create, upDate, getById, getByOrderProductId, getByOrderClientId,getByOrderDate, getByOrderUserId, getUserBest, getByProductDate,getByPriceDate,checkStock,getByAllPage, getAllAndClientNamePaginated, getAllForClientProductDatePaginated, getStatusAndClientNamePaginated, getAllForClientProductDateStatusPaginated
}
