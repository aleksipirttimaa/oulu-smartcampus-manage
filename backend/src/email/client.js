const config = require('../config/email');
const nunjucks =  require('nunjucks');

const SMTPClient = require('emailjs').SMTPClient;

const client = new SMTPClient(config.client);

function subject(name) {
    if (name === 'password-reset-request') {
        return 'Password reset request';
    } else if (name === 'password-reset') {
        return 'Your password has been changed';
    } else if (name === 'add-user') {
        return 'Welcome to Smart Campus';
    }
    return 'Message from Smart Campus';
}

function render(name, params) {
    nunjucks.configure(config.templatePath);
    return nunjucks.render(name + '.email' , params);
}

function sendTemplate(name, user, params, cb) {
    if (!config.allow) {
        return cb('SMTP not allowed, check backend configuration.', null);
    }
    client.send({
        from: config.from,
        to: user.email,
        subject: subject(name),
        text: render(name, params),
    }, cb);
}

module.exports.sendPasswordResetRequest = function(user, jwt, cb) {
    return sendTemplate('password-reset-request', user, { jwt: jwt }, cb);
};

module.exports.sendPasswordReset = function(user, cb) {
    return sendTemplate('password-reset', user, null, cb);
};

module.exports.sendUserAdd = function(user, cb) {
    return sendTemplate('add-user', user, { name: user.name, username: user.username }, cb);
};