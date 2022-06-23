const express = require('express');
const router = express.Router();

const ApiKey = require('../models/apikey');
const Roles = require('../roles');
const User = require('../models/user');
const UserAuditLog = require('../models/userAuditLog');


// Add
/**
 * @swagger
 *
 * /apikeys/add:
 *   post:
 *     summary: Add new ApiKey
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *             - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         allOf:
 *           - $ref: "#/components/responses/Ok"
 *           - content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   apiKey:
 *                     $ref: "#/components/schemas/ApiKey"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - ApiKey
 */
router.post('/add', Roles.authorize('api-key-user'), (req, res, _next) => {
    if (!req.user._id) {
        return res.json({ success: false, msg: 'Unknown user' });
    }
    const name = req.body.name || 'Unnamed';
    const template = {
        name: name,
        owner: req.user._id,
    };
    ApiKey.addForUser(template, (err, apiKey) => {
        if (err) {
            return res.json({ success: false, msg: `Add failed ${err}` });
        }
        if (!apiKey) {
            return res.json({ success: false, msg: 'No result' });
        }
        UserAuditLog.addApiKey(req.user, apiKey, (err, _entry) => {
            if (err) {
                return res.json({ success: false, msg: `Add failed in audit ${err}` });
            }
            res.json({ success: true, apiKey: apiKey });
        });
    });
});

// List for this user
/**
 * @swagger
 *
 * /apikeys/list:
 *   post:
 *     summary: "List your ApiKeys WARNING: Responds with secrets!"
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
 *                   apiKeys:
 *                     $ref: "#/components/schemas/ApiKeys"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - ApiKey
 */
router.post('/list', Roles.authorize('api-key-user'), (req, res, _next) => {
    const user = req.user._id;
    if (!user) {
        return res.json({ success: false, msg: 'Unknown user' });
    }
    ApiKey.getByUser(user, (err, result) => {
        if (err) {
            return res.json({ success: false, msg: `List failed ${err}` });
        }
        if (!result) {
            return res.json({ success: false, msg: 'No result' });
        }
        res.json({ success: true, apiKeys: result });
    });
});

// List all
/**
 * @swagger
 *
 * /apikeys/listAll:
 *   post:
 *     summary: List ApiKeys of all users, secrets stripped
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
 *                   otherUserApiKeys:
 *                     $ref: "#/components/schemas/ApiKeys"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - ApiKey
 */
router.post('/listAll', Roles.authorize('api-key-manager'), (req, res, _next) => {
    ApiKey.getAll((err, result) => {
        if (err) {
            return res.json({ success: false, msg: `List failed ${err}` });
        }
        if (!result) {
            return res.json({ success: false, msg: 'No result' });
        }
        const promise = async (apiKey) => {
            return new Promise((resolve, _) => {
                User.getUserById(apiKey.owner, (err, user) => {
                    const name = err ? '' : (user ? user.name : '');
                    resolve({
                        _id: apiKey._id,
                        created: apiKey.created,
                        name: apiKey.name,
                        owner: apiKey.owner,
                        ownerFullName: name,
                    });
                });
            });
        };

        const promises = result.map(apiKey => promise(apiKey));

        Promise.all(promises).then(otherUserApiKeys => {
            res.json({ success: true, otherUserApiKeys: otherUserApiKeys });
        });
    });
});

// Get
/**
 * @swagger
 *
 * /apikeys/get:
 *   post:
 *     summary: Get ApiKey by id. You can only request ApiKeys that you own
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
 *                   apiKey:
 *                     $ref: "#/components/schemas/ApiKey"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - ApiKey
 */
router.post('/get', Roles.authorize('api-key-user'), (req, res, _next) => {
    const _id = req.body._id;
    ApiKey.getById(_id, (err, apiKey) => {
        if (err) {
            return res.json({ success: false, msg: `Get failed ${err}` });
        }
        if (!apiKey) {
            return res.json({ success: false, msg: 'No result' });
        }
        if (apiKey.owner !== req.user._id) {
            return res.json({ success: false, msg: 'Not your key' });
        }
        res.json({ success: true, apiKey: apiKey });
    });
});

// Delete
/**
 * @swagger
 *
 * /apikeys/delete:
 *   post:
 *     summary: Delete ApiKey
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
 *         $ref: "#/components/responses/Ok"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - ApiKey
 */
router.post('/delete', Roles.authorize('api-key-user'), (req, res, _next) => {
    const _id = req.body._id;
    ApiKey.getById(_id, (err, apiKey) => {
        if (err) {
            return res.json({ success: false, msg: `Get for delete failed ${err}`});
        }
        if (!apiKey) {
            return res.json({ success: false, msg: 'No such ApiKey' });
        }
        if (apiKey.owner != req.user._id) {
            if (!Roles.hasRole(req.user, 'api-key-manager')) {
                return res.status(403).json({ success: false, msg: 'You didn\'t own this ApiKey' });
            }
        }
        ApiKey.delete(_id, (err, apiKey) => {
            if (err) {
                return res.json({ success: false, msg: `Delete failed ${err}` });
            }
            UserAuditLog.deleteApiKey(req.user, apiKey, (err, _entry) => {
                if (err) {
                    return res.json({ success: false, msg: `Delete failed in audit ${err}` });
                }
                res.json({ success: true, msg: 'ApiKey deleted' });
            });
        });
    });
});

module.exports = router;
