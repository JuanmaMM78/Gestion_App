const { executeQuery, executeQueryOne} = require('../helpers/utils');

const getAll = () => {
    return executeQuery('select * from clients');
}

const getAllActive = (active) => {
    return executeQuery('select * from clients where status = ?', [active]);
}

const getBuyersBest = () => {
    return executeQuery('select clients.* , sum(round((orders.price_sale * orders.vol_sale),2)) AS vol_price_sale FROM orders INNER JOIN clients ON clients.id_client = orders.id_Client WHERE orders.status ="aceptado" GROUP BY clients.name_client ORDER BY vol_price_sale desc')
}

const getById = (clienteId) => {
    return executeQueryOne('select * from clients where id_client = ?', [clienteId]);
}

const create = ({ name_client, mail_client, direction, phone, status }) => {
    return executeQuery(' insert into clients (name_client, mail_client, direction, phone,status) values (?,?,?,?,?)',[name_client, mail_client, direction, phone,status]);
}

const upDate = (clientId, { name_client, mail_client, direction, phone,status }) => {
    return executeQuery('UPDATE clients SET name_client = ?, mail_client = ?, direction = ?, phone = ?, status = ? WHERE id_client = ?', [name_client, mail_client, direction, phone,status, clientId]);
}

module.exports = {
    getAll, create, upDate, getById, getAllActive, getBuyersBest
}
