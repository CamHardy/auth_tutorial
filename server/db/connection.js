const monk = require('monk');
const db = monk('localhost/auth-tutorial');

module.exports = db;