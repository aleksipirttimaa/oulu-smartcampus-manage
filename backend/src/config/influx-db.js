const dotenv = require('dotenv');
dotenv.config();

module.exports.options = {
    host: process.env.INFLUX_HOST || 'smartcampus.oulu.fi',
    port: process.env.INFLUX_PORT || '443',
    protocol: process.env.INFLUX_PROTO || 'https',
    username: process.env.INFLUX_USER || 'smartcampus',
    password: process.env.INFLUX_PASS || 'keyboard cat',
    database: process.env.INFLUX_DB || 'dev'
};