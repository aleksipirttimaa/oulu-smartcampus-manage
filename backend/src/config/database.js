const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    database: process.env.DB_URI || 'mongodb://localhost:27017/smartcampus'
};