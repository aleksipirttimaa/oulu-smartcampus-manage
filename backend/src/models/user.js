const jwtConfig = require('../config/jwt');
const Email = require('../email/client');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    superuser: {
        type: Boolean,
    },
    roles: {
        type: Array,
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

function validPassword(plaintext) {
    return plaintext.length >= 10;
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.getUserByUsername = function(username, callback){
    const query = { username: username };
    User.findOne(query, callback);
};

module.exports.getUserByEmail = function(email, callback){
    const query = { email: email };
    User.findOne(query, callback);
};

module.exports.addUser = function(newUser, callback){
    newUser.superuser = false;
    newUser.roles = [];
    if(!validPassword(newUser.password)) {
        return callback('Invalid password', null);
    }
    bcrypt.genSalt(14, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) =>{
            if(err) throw err;
            newUser.password = hash;
            newUser.save((err, res) => {
                if (!err) {
                    Email.sendUserAdd(newUser, (err, msg) => {
                        /* this could take a while */
                        if (err) {
                            console.error('sendPasswordReset', err);
                        }
                    });
                }
                callback(err, res);
            });
        });
    });
};

module.exports.delUser = function(user, callback){
    const unknownUser = {
        name: 'Deleted user ' + user.username,
        email: '',
        password: ''
    };
    user.updateOne(unknownUser, callback);
};

module.exports.comparePasswords = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
};

module.exports.getAllUsers = function(callback) {
    User.find({}, callback);
};

module.exports.updatePasswordWithJwt = function(token, newPassword, callback) {
    /* validate token */
    let valid;
    try {
        valid = jwt.verify(token, jwtConfig.secret, { algorithm: 'HS256' });
    } catch (err) {
        return callback(`${err}`, null);
    }

    if (!valid || !valid.data) {
        return callback('Invalid JWT', null);
    }

    /* make sure this is a prt */
    if (valid.data.type !== 'prt') {
        /* prt for password reset request */
        return callback('Wrong JWT type', null);
    }

    /* validate password reset request */
    const request = valid.data;
    User.findById(request.id, (err, user) => {
        if (err || !user) {
            return callback('No such user', null);
        }
        if (user.password === '' || user.email === '') {
            return callback('Deleted user', null);
        }
        bcrypt.compare(user.password, request.oph, (err, isMatch) => {
            /* request token can only be used, if the password is not changed */
            if (err) throw err;
            if (!isMatch) {
                return callback('Password already changed', null);
            }

            /* validate request username */
            if (user.username !== request.usr) {
                return callback('Invalid user', null);
            }

            /* change password */
            if(!validPassword(newPassword)) {
                return callback('Invalid password', null);
            }
            bcrypt.genSalt(14, (_err, salt) => {
                bcrypt.hash(newPassword, salt, (err, password) => {
                    user.password = password;
                    user.save((err, res) => {
                        if (!err) {
                            Email.sendPasswordReset(user, (err, msg) => {
                                /* this could take a while */
                                if (err) {
                                    console.error('sendPasswordReset', err);
                                }
                            });
                        }
                        callback(err, res);
                    });
                });
            });
        });
    });
};

module.exports.requestPasswordReset = function(user, callback) {
    /* validate user */
    User.findById(user._id, (err, user) => {
        if (err || !user) {
            return callback('Couldn\'t find user', null);
        } 
        if (user.password === '' || user.email === '') {
            return callback('Deleted user', null);
        }

        /* safe hash from old password hash */
        /* this is used to prevent multiple uses of this token */
        bcrypt.genSalt(14, (_err, salt) => {
            bcrypt.hash(user.password, salt, (err, oldPasswordHash) =>{
                if(err) throw err;

                /* password reset request token */
                /* possession of this token allows the user to perform */
                /* updatePasswordWithJwt and in result reset their password */
                const data = {
                    type: 'prt', /* prt for password reset request */
                    usr: user.username,
                    id: user._id,
                    oph: oldPasswordHash,
                };

                var token = jwt.sign(
                    { data: data }, /* password reset request */
                    jwtConfig.secret,
                    {
                        algorithm: 'HS256',
                        expiresIn: '7d', /* request expires in a week */
                    });

                Email.sendPasswordResetRequest(user, token, (err, msg) => {
                    /* this could take a while */
                    if (err) {
                        console.error('sendPasswordResetRequest', err);
                    }
                });
                callback(false, null);
            });
        });
    });
};
