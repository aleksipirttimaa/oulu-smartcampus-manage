const express = require('express');
const router = express.Router();

const Device = require('../models/device');
const Roles = require('../roles');
const User = require('../models/user');

const secondsSinceEpoch = require('../utils').secondsSinceEpoch;

// download users
/**
 * @swagger
 *
 * /download/users.json:
 *   get:
 *     summary: Download all users as a .json-file
 *     security:
 *       - ApiKey: []
 *     responses:
 *       200:
 *         description: A downloadable file of all users
 *     tags:
 *       - Download
 */
router.get('/users.json', Roles.authorize('user-manager'), (req, res, next) => {
    User.getAllUsers((err, users) => {
        if (err) {
            res.sendStatus(500);
        }

        if (users && users.length === 0) {
            res.status(400).send('No users to download');
        }

        // filename 'users-1594120452.json'
        const filename = 'users-' + secondsSinceEpoch() + '.json';

        // exportable is a simplified version of user stored internally
        const exportables = users.map(user => user.toObject());

        // user line is the exportable object represented in json
        // ending in newline
        const userLines = exportables.map(exportable => new TextEncoder('utf-8').encode(JSON.stringify(exportable) + '\n'));
        const response = new Buffer.concat(userLines);

        // set Content-Disposition header to initiate a download
        res.attachment(filename).send(response);
    });
});

// download devices
/**
 * @swagger
 *
 * /download/devices.json:
 *   get:
 *     summary: Download all devices as a .json-file
 *     responses:
 *       200:
 *         description: A downloadable file of all devices
 *     tags:
 *       - Download
 */
router.get('/devices.json', (req, res, next) => {
    Device.getAllDevices( (err, devices) => {
        if (err) {
            res.sendStatus(500);
        }

        if (devices && devices.length === 0) {
            res.status(400).send('No devices to download');
        }

        // filename 'devices-1594120452.json'
        const filename = 'devices-' + secondsSinceEpoch() + '.json';

        // asynchronously return a promise that resolves the exportable object
        const promiseExportable = async (device) => {
            return new Promise((resolve, reject) => {
                User.getUserById(device.addedByUser, (err, user) => {
                    let location = [];
                    if (device.location && device.location.coordinates instanceof Array) {
                        location = device.location.coordinates.map(n => (n || 0).toFixed(5));
                    }

                    let addedBy;
                    if (err || !user || !user.username) {
                        addedBy = 'unknown user';
                    } else {
                        addedBy = user.username;
                    }
                    resolve({
                        id: device.deviceId || '',
                        type: device.deviceType || '',
                        floor: device.floorLevel || 0,
                        status: device.status || 'unknown',
                        installed: device.installed,
                        desc: device.description || '',
                        location: location,
                        addedBy: addedBy
                    });
                });
            });
        };

        // call previous function, and map the results
        const exportables = devices.map(device => promiseExportable(device));

        // wait for all promises to resolve
        Promise.all(exportables).then(results => {
            // device line is the exportable object represented in json
            // ending in newline
            const deviceLines = results.map(exportable => new TextEncoder('utf-8').encode(JSON.stringify(exportable) + '\n'));
            const response = new Buffer.concat(deviceLines);

            // set Content-Disposition header to initiate a download
            res.attachment(filename).send(response);
        });
    });
});

module.exports = router;
