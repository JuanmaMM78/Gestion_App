const { executeQuery, executeQueryOne } = require('../helpers/utils');

const getAll = () => {
    return executeQuery('select * from users');
}

const getStatusUsers = (status) => {
    return executeQuery('select * from users where status = ?', [status]);
}

const create = ({ name_user, surname_user, mail_user, password_user, role, status }) => {
    return executeQuery ('insert into users ( name_user, surname_user, mail_user, password_user, role, status) values (?, ?, ?, ?, ?, ?)',
    [ name_user, surname_user, mail_user, password_user, role, status]);
}

const upDate = (userId, { name_user, surname_user, mail_user, role, status}) => {
    return executeQuery('UPDATE users SET name_user = ?, surname_user = ?, mail_user = ?, role = ?, status = ?  WHERE id_user = ?', [ name_user, surname_user, mail_user, role, status, userId]);
}

const newPasssword = (userId, { password_user }) => {
    return executeQuery('update users set password_user = ? where id_user = ?', [password_user, userId]);
}

const getByEmail = (mail_user) => {
    return executeQueryOne('select * from users where mail_user = ?', [mail_user]);
}

const getById = (userId) => {
    return executeQueryOne('select * from users where id_user = ?', [userId]);
}

module.exports = {
    getAll, create, getByEmail, upDate, getById, newPasssword, getStatusUsers
}