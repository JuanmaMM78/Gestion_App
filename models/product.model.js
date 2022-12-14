const { executeQuery, executeQueryOne } = require('../helpers/utils');

const getAll = () => {
    return executeQuery('select * from products');
}

const getById = (productId) => {
    return executeQueryOne('select * from products where id_product = ?', [productId]);
}

const getByProductActive = (status) => {
    return executeQuery('select * from products where status = ?', [status]);
}

const create = ({name_product, origin, caliber, price, stock_initial, stock_now, status,image }) => {
    return executeQuery ('insert into products (name_product, origin, caliber, price, stock_initial, stock_now, status,image) values (?, ?, ?, ?, ?, ?, ?, ?)',
    [name_product, origin, caliber, price, stock_initial, stock_now, status, image]);
}

const upDate = (productId, { name_product, origin, caliber, price, stock_initial, stock_now, status, image }) => {
    return executeQuery('UPDATE products SET name_product = ?, origin = ?, caliber = ?, price = ?, stock_initial = ?, stock_now = ?, status = ?, image = ? WHERE id_product = ?', [name_product, origin, caliber, price, stock_initial, stock_now, status, image, productId]);
}

const upDateStock = (orderId) => {
    return executeQuery('UPDATE products INNER JOIN orders ON orders.id_product = products.id_product SET products.stock_now = products.stock_now - orders.vol_sale  WHERE orders.id_order = ?', [orderId]);
}

const getSalesBest = () => {
    return executeQuery('SELECT products.* , sum(orders.vol_sale) AS vol_total_sale FROM orders INNER JOIN products ON products.id_product = orders.id_product WHERE orders.status ="aceptado" GROUP BY products.name_product ORDER BY vol_total_sale desc')
}

const upDateStockNew = (volOrder, idOrder) => {
    return executeQuery('UPDATE products INNER JOIN orders ON orders.id_product = products.id_product SET products.stock_now = products.stock_now + ?  WHERE orders.id_order = ?', [volOrder,idOrder]);
}

module.exports = {
    getAll, create, upDate, getByProductActive, getById, upDateStock, getSalesBest,upDateStockNew
}
