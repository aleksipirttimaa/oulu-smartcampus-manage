const dotenv = require('dotenv');

dotenv.config();

module.exports = {
	secret: process.env.EXPRESS_SESSION_SECRET || 'keyboard cat',
};