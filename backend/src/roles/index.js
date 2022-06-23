const express = require('express');
const router = express.Router();
const passport = require('passport');

const VALID_ROLES = [
    'role-manager',
    'user-manager',
    'api-key-manager',
    'api-key-user',
    'device-manager',
];

module.exports.valids = VALID_ROLES;

module.exports.hasRole = function(user, role) {
    if (!VALID_ROLES.includes(role)) {
        throw `Unknown role ${role}`;
    }

    /* superuser has all roles */
    if (user.superuser) {
        return true;
    }

    return user.roles.includes(role);
};

module.exports.authorize = function(_) {
    /* argument list is roles */
    const roles = Array.from(arguments);

    /* always validate roles */
    for (let role of roles) {
        if (!VALID_ROLES.includes(role)) {
            throw `Unknown role ${role}`;
        }
    }
    return function(req, res, next) {
        /* make sure the user is logged in */
        return passport.authenticate(['jwt', 'headerapikey'], {session:false})(req, res, function() {
            /* superuser has all roles */
            if (req.user.superuser) {
                return next();
            }
            
            if (req.user.roles.length > 0) {
                for (let role of roles) {
                    if (req.user.roles.includes(role)) {
                        return next();
                    }
                }
            }

            return res.status(403).json({ success: false, msg: 'Unauthorized' });
        });
    };
};