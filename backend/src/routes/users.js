const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('../config/jwt');
const Roles = require('../roles');
const User = require('../models/user');
const UserAuditLog = require('../models/userAuditLog');

// Register (request sends an email)
router.post('/register', Roles.authorize('user-manager'), (req, res, next) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.getUserByUsername(newUser.username, (err, user) => {
        if(err){
            return res.json({ success: false, msg: 'Something went wrong' });
        }
        if(user){
            return res.json({ success: false, msg: 'Username taken, Please select a new username' });
        } else {
            User.getUserByEmail(newUser.email, (err, user) => {
                if(err){
                    return res.json({ success: false, msg: 'Something went wrong' });
                }
                if(user){
                    return res.json({ success: false, msg: 'Email is already registered. Please use another email or try to login.' });
                } else {
                    User.addUser(newUser, (err, user) => {
                        if(err){
                            return res.json({ success: false, msg: 'Failed to register user' });
                        } else {
                            UserAuditLog.addUser(req.user, user, (err, _entry) => {
                                if (err) {
                                    return res.json({ success: false, msg: 'Failed to audit' });
                                }
                                res.json({ success: true, msg: 'User was successfully registered' });
                            });
                        }
                    });
                }
            }); 
        }
    });
});

// Delete
router.post('/delete', Roles.authorize('user-manager'), (req, res, next) => {
    const username = req.body.username || '';
    User.getUserByUsername(username, (err, user) => {
        const _id = user._id;
        if (err) {
            return res.json({ success: false, msg:'User query went wrong' });
        }
        if (!user) {
            return res.json({ success: false, msg:'No such user' });
        }
        User.delUser(user, (err, _user) => {
            if (err) {
                return res.json({ success: false, msg: 'Delete failed' });
            }
            UserAuditLog.delUser(req.user, _id, (err, _entry) => {
                if (err) {
                    return res.json({ success: false, msg: 'Failed to audit' });
                }
                res.json({ success: true, msg: 'User deleted' });
            });
        });
    });
});

// List
/**
 * @swagger
 *
 * /users/list:
 *   get:
 *     summary: List all users
 *     security:
 *       - ApiKey: []
 *     responses:
 *       200:
 *         allOf:
 *           - $ref: "#/components/responses/Ok"
 *           - content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   users:
 *                     $ref: "#/components/schemas/OtherUsers"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - User
 */
router.get('/list', Roles.authorize('user-manager', 'role-manager'), (req, res, next) => {
    User.getAllUsers((err, arr) => {
        if (err) {
            return res.json({ success: false, msg: `Listing users failed ${err}` });
        }
        if (!arr || arr.length === 0) {
            return res.json({ success: false, msg: 'No users to list' });
        }
        const users = arr.map(u => {
            return {
                _id: u._id,
                username: u.username, 
                name: u.name,
            };
        });
        res.json({success: true, users: users});
    });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: `Getting users failed ${err}` });
        }
        if(!user){
            return res.json({ success: false, msg: 'User not found' });
        }

        User.comparePasswords(password, user.password, (err, isMatch) => {
            if (err) {
                return res.json({ success: false, msg: 'Comparing password failed' });
            }
            if(isMatch){
                const token = jwt.sign({ data: user }, config.secret, {
                    expiresIn: 604800 // 1week
                });
                UserAuditLog.login(user, (err, _entry) => {
                    if (err) {
                        return res.json({ success: false, msg: 'Failed to audit' });
                    }
                    res.json({
                        success: true,
                        msg: 'Authentication successful',
                        token: 'JWT ' + token,
                        user: {
                            id: user._id,
                            name: user.name,
                            username: user.username,
                            email: user.email,
                            superuser: user.superuser,
                            roles: user.roles,
                        },
                    });
                });
            } else {
                return res.json({ success: false, msg: 'Wrong password' });
            }
        });
    });
});

// Profile
/**
 * @swagger
 *
 * /users/profile:
 *   get:
 *     summary: Get self
 *     security:
 *       - ApiKey: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/Profile"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - User
 */
router.get('/profile', passport.authenticate(['jwt', 'headerapikey'], { session: false }), (req, res, next) => {
    res.json({
        user: {
            _id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            username: req.user.username,
            superuser: req.user.superuser,
            roles: req.user.roles,
        }
    });
});

// Get
/**
 * @swagger
 *
 * /users/get:
 *   post:
 *     summary: Get user by id
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *             - _id
 *             properties:
 *               _id:
 *                 type: string
 *     responses:
 *       200:
 *         allOf:
 *           - $ref: "#/components/responses/Ok"
 *           - content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   user:
 *                     $ref: "#/components/schemas/OtherUser"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - User
 */
router.post('/get', Roles.authorize('user-manager', 'role-manager'), (req, res, next) => {
    const _id = req.body._id;
    User.getUserById(_id, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: 'Failed to get user' });
        } 
        if (!user) {
            return res.json({ success: false, msg: 'No such user' });
        } else {
            const username = user.username ? user.username : 'unknown user';
            const ret = {
                _id: user._id,
                name: user.name || username,
                username: username,
                roles: user.roles,
                superuser: user.superuser,
            };
            res.json({ success: true, user: ret });
        }
    });
});

// Create Teemu Testaaja if no users are created
router.get('/getInitialTeemu', (req, res, next) => {
    const teemu = new User({
        name: 'Teemu Testaaja',
        email: 'teemu@name.test',
        username: 'teemutestaaja',
        password: '1234567890',
        superuser: true,
    });
    User.getUserByUsername(teemu.username, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: 'Something went wrong' });
        }
        if (user) {
            return res.json({ success: false, msg: 'Teemu created already' });
        } else {
            User.addUser(teemu, (err, _user) => {
                if (err) {
                    res.json({ success: false, msg: `Failed to register user: ${err}` });
                } else {
                    res.json({ success: true, msg: 'Teemu was successfully registered' });
                }
            });
        }
    });
});

// Update new password to db (request sends an email)
router.post('/password/update/with-jwt', (req, res, next) => {
    const password = req.body.password;
    const jwt = req.body.jwt;

    User.updatePasswordWithJwt(jwt, password, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: `Setting new password failed: ${err}` });
        }
        UserAuditLog.passwordReset(user, (err, _entry) => {
            if (err) {
                return res.json({ success: false, msg: 'Failed to audit' });
            }
            res.json({ success: true });
        });
    });
});

// Reset own password (request sends an email)
router.get('/password/request-reset', passport.authenticate(['jwt', 'headerapikey'], { session: false }), (req, res, next) => {
    const user = req.user;
    User.requestPasswordReset(user, (err, isMatch) => {
        if (err) {
            return res.json({ success: false, msg: `Requesting reset failed: ${err}` });
        }
        return res.json({ success: true });
    });
});

// Reset password by username (request sends an email)
router.get('/password/request-reset/:username', Roles.authorize('user-manager'), (req, res, next) => {
    const username = req.params.username;
    User.getUserByUsername(username, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: `Getting users failed ${err}` });
        }
        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        }
        User.requestPasswordReset(user, (err, isMatch) => {
            if (err) {
                return res.json({ success: false, msg: `Requesting reset failed: ${err}` });
            }
            return res.json({ success: true });
        });
    });
});


router.post('/roles/valid-for', Roles.authorize('role-manager'), (req, res, next) => {
    const _id = req.body.user;
    User.getUserById(_id, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: `Getting users failed ${err}` });
        }
        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        }
        return res.json({ success: true, roles: Roles.valids });
    });
});

router.post('/roles/add', Roles.authorize('role-manager'), (req, res, next) => {
    const _id = req.body.user;
    const roles = req.body.roles;
    User.getUserById(_id, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: `Getting users failed ${err}` });
        }
        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        }
        if (user.email == '') {
            return res.json({ success: false, msg: 'User previously deleted'});
        } 
        roles.forEach(role => {
            if (!user.roles.includes(role)) {
                user.roles.push(role);
            }
        });
        user.save();
        return res.json({ success: true });
    });
});

router.post('/roles/remove', Roles.authorize('role-manager'), (req, res, next) => {
    const _id = req.body.user;
    const roles = req.body.roles;
    User.getUserById(_id, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: `Getting users failed ${err}` });
        }
        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        }
        if (user.email == '') {
            return res.json({ success: false, msg: 'User previously deleted'});
        } 
        if (roles.length > 0) {
            if (_id == req.user._id) {
                if (roles.includes('role-manager')) {
                    return res.json({ success: false, msg: 'You can\'t demote yourself as the role-manager' });
                }
            }
            user.roles = user.roles.filter(x => !roles.includes(x));
        }
        user.save();
        return res.json({ success: true });
    });
});

module.exports = router;
