const dotenv = require('dotenv');
dotenv.config();

module.exports.allow = process.env.SMTP_ALLOW === 'true';

module.exports.client = {
    host: process.env.SMTP_HOST,
    ssl: process.env.SMTP_ALLOWINSECURE !== 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
};

module.exports.templatePath = 'email/templates/';

module.exports.from = 
  `Oulu Smart Campus <${process.env.SMTP_FROMADDR || 'smartcampus-noreply@smartcampus.oulu.test'}>`; 