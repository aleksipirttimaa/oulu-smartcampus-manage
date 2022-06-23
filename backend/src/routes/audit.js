const express = require('express');
const router = express.Router();
const passport = require('passport');

const Device = require('../models/device');
const DeviceAuditLog = require('../models/deviceAuditLog');
const Roles = require('../roles');
const User = require('../models/user');
const UserAuditLog = require('../models/userAuditLog');

// asynchronously return a promise that resolves the minimal audit log entry object
// this annotates or strips raw _id references to other objects
const minimalEntry = async (entry) => {
    return new Promise((resolve, reject) => {
        User.getUserById(entry.callee, (err, user) => {
            let res = entry.toObject();
            if (err) {
                res.callee = 'unknown user';
                res.calleeFullName = 'Unknown user';
            } else if (user) {
                res.callee = user.username || 'unknown user';
                res.calleeFullName = user.name || 'Unknown user';
            }
            if (entry.userId && entry.deviceId) {
                // not supported
                reject('Can\'t produce minimal entry for object with both, userId, deviceId');
            } else if (entry.userId) {
                User.getUserById(entry.userId, (err, user) => {
                    if (err || !user) {
                        res.userFullName = 'Unknown user';
                    } else {
                        res.userFullName = !err ? user.name: 'Unknown user';
                    }
                    resolve(res);
                });
            } else if (entry.deviceId) {
                Device.getDeviceById(entry.deviceId, (err, device) => {
                    if (err || !device) {
                        res.deviceId = 'unknown device';
                    } else {
                        res.deviceId = device.deviceId;
                    }
                    res._deviceId = entry.deviceId;
                    resolve(res);
                });
            } else {
                resolve(res);
            }
        });
    });
};

/**
 * @swagger
 *
 * /audit/device/{_id}/minimal:
 *   get:
 *     summary: Get full device audit log
 *     security:
 *       - ApiKey: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         allOf:
 *           - $ref: "#/components/responses/Ok"
 *           - content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   device:
 *                     $ref: "#/components/schemas/AuditLog"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - AuditLog
 */
router.get('/device/:_id/minimal', Roles.authorize('device-manager'), (req, res, _next) => {
    const _id = req.params._id;
    const query = { deviceId: _id };
    DeviceAuditLog.find(query, (err, entries) => {
        if (err) {
            return res.json({ success: false, msg: `Failed getting audit log ${err}` });
        }
        // map of promises
        const minimalEntries = entries.map(entry => minimalEntry(entry));

        // wait for all promises to resolve
        Promise.all(minimalEntries).then(entries => {
            res.json({ success: true, log: entries });
        });
    });
});

/**
 * @swagger
 *
 * /audit/device/{_id}/minimalPublic:
 *   get:
 *     summary: Get public device audit log
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         allOf:
 *           - $ref: "#/components/responses/Ok"
 *           - content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   device:
 *                     $ref: "#/components/schemas/AuditLog"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - AuditLog
 */
router.get('/device/:_id/minimalPublic', (req, res, _next) => {
    const _id = req.params._id;
    const query = {
        deviceId: _id,
        $or: [
            { method: 'add' },
            { method: 'update' },
            { method: 'mark' },
            { method: 'delete' },
        ],
    };
    DeviceAuditLog.find(query, (err, entries) => {
        if (err) {
            return res.json({ success: false, msg: `Failed getting audit log ${err}` });
        }

        // map of promises
        const minimalEntries = entries.map(entry => minimalEntry(entry));

        // wait for all promises to resolve
        Promise.all(minimalEntries).then(entries => {
            res.json({ success: true, log: entries });
        });
    });
});

// Comments
/**
 * @swagger
 *
 * /audit/comments/device/{_id}:
 *   get:
 *     summary: Get device Comments
 *     security:
 *       - ApiKey: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         allOf:
 *           - $ref: "#/components/responses/Ok"
 *           - content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   apiKey:
 *                     $ref: "#/components/schemas/Comments"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - AuditLog
 */
router.get('/comments/device/:_id', Roles.authorize('device-manager'), (req, res, _next) => {
    const _id = req.params._id;
    DeviceAuditLog.find({ method: 'comment', deviceId: _id }, (err, entries) => {
        if (err) {
            return res.json({ success: false, msg: `Failed getting comments ${err}` });
        }

        // map of promises
        const minimalEntries = entries.map(entry => minimalEntry(entry));

        // wait for all promises to resolve
        Promise.all(minimalEntries).then(entries => {
            res.json({ success: true, log: entries });
        });
    });
});

// Comment
/**
 * @swagger
 *
 * /audit/comment/device:
 *   post:
 *     summary: Comment device
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *             - _id
 *             - comment
 *             properties:
 *               _id:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         $ref: "#/components/responses/Ok"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - AuditLog
 */
router.post('/comment/device', Roles.authorize('device-manager'), (req, res, next) => {
    const _id = req.body._id;
    const comment = req.body.comment;
    Device.getDeviceById(_id, (err, device) => {
        if (err || !device) {
            return res.json({success: false, msg: `Failed to add comment, no such device ${err || ''}`});
        }
        DeviceAuditLog.comment(req.user, device, comment, (err, comment) => {
            if (err) {
                return res.json({success: false, msg: `Failed to add comment: ${err}`});
            }
            minimalEntry(comment).then(minimalComment => {
                res.json({ success: true, comment: minimalComment });
            }).catch(_err => {
                res.json({ success: false, msg: 'Failed to produce minimal response' });
            });
        });
    });
});

/**
 * @swagger
 *
 * /audit/users:
 *   get:
 *     summary: Get the full users audit log
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
 *                   device:
 *                     $ref: "#/components/schemas/AuditLog"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - AuditLog
 */
router.get('/users', Roles.authorize('user-manager'), (req, res, _next) => {
    UserAuditLog.find({}, (err, entries) => {
        if (err) {
            return res.json({ success: false, msg: `Failed getting audit log ${err}` });
        }
        // map of promises
        const minimalEntries = entries.map(entry => minimalEntry(entry));

        // wait for all promises to resolve
        Promise.all(minimalEntries).then(entries => {
            res.json({ success: true, log: entries });
        });
    });
});

/**
 * @swagger
 *
 * /audit/by-username/{username}:
 *   get:
 *     summary: Audit a user
 *     security:
 *       - ApiKey: []
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         allOf:
 *           - $ref: "#/components/responses/Ok"
 *           - content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   device:
 *                     $ref: "#/components/schemas/AuditLog"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - AuditLog
 */
router.get('/by-username/:callee', passport.authenticate(['jwt', 'headerapikey'], { session: false }), (req, res, _next) => {
    const callee = req.params.callee;
    User.getUserByUsername(callee, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: `Failed getting username ${err}` });
        }
        UserAuditLog.find({ callee: user._id }, (err, userEntries) => {
            if (err) {
                return res.json({ success: false, msg: `Failed getting user audit log ${err}` });
            }
            DeviceAuditLog.find({ callee: user._id }, (err, deviceEntries) => {
                if (err) {
                    return res.json({ success: false, msg: `Failed getting device audit log ${err}` });
                }

                if (req.user.username != callee && !Roles.hasRole(req.user, 'user-manager')) {
                    res.json({ success: false, msg: 'You can only audit yourself'});
                }

                // combine entries
                const entries = new Array().concat(deviceEntries, userEntries);

                entries.sort((a, b) => {
                    return b.date - a.date; // descend by date
                });

                // map of promises
                const minimalEntries = entries.map(entry => minimalEntry(entry));

                // wait for all promises to resolve
                Promise.all(minimalEntries).then(entries => {
                    res.json({ success: true, log: entries });
                });
            });
        });
    });
});

//
// Allow simple purge
//

router.get('/purge', Roles.authorize('role-manager'), (req, res, _next) => {
    DeviceAuditLog.purge((_err, _result) => {});
    UserAuditLog.purge((_err, _result) => {});
    res.json({ success: true });
});

module.exports = router;
