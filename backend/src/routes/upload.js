const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const Device = require('../models/device');
const DeviceAuditLog = require('../models/deviceAuditLog');
const Roles = require('../roles');
const User = require('../models/user');


// upload users
router.post('/users.json', Roles.authorize('user-manager', 'role-manager'), bodyParser.text({ type: '*/*', limit: '16mb' }), (req, res, _next) => {
    User.find({}, (err, users) => {
        if (err || users.length > 0) {
            return res.json({ nImported: 0 });
        }
        let importables = [];
        for (const line of req.body.split('\n')) {
            // line by line
            if (line.length < 3) {
                continue;
            }

            const imported = JSON.parse(line);

            const importable = async (_line) => {
                return new Promise((resolve, _) => {
                    //const {__v, _id, ...others} = imported;
                    const user = new User(imported);
                    user.save();
                    resolve(); /* TODO append audit log */
                });
            };
            importables.push(importable(line));
        }
        Promise.allSettled(importables).then(results => {
            const fulfilled = results.filter(r => r.status === 'fulfilled');
            res.json({ nImported: fulfilled.length });
        });
    });
});

// upload devices
router.post('/devices.json', Roles.authorize('device-manager'), bodyParser.text({ type: '*/*', limit: '16mb' }), (req, res, _next) => {
    Device.find({}, (err, devices) => {
        if (err || devices.length > 0) {
            return res.json({ nImported: 0 });
        }
        let importables = [];
        for (const line of req.body.split('\n')) {
            // line by line
            if (line.length < 3) {
                continue;
            }

            const imported = JSON.parse(line);

            const username = imported.addedBy;

            const promiseImportable = async (_line) => {
                return new Promise((resolve, reject) => {
                    User.getUserByUsername(username, (err, user) => {
                        if (err || !user) {
                            console.warn('Importing device', imported.id, 'failed, no such user', username);
                            return reject(`${imported.id} failed, no such user`);
                        }

                        const addedBy = user._id;

                        const location = {
                            type: 'Point',
                            coordinates: imported.location,
                        };

                        const device = new Device({
                            description: imported.desc,
                            deviceId: imported.id,
                            deviceType: imported.type,
                            floorLevel: imported.floor,
                            location: location,
                            status: imported.status,
                            installed: imported.installed ? Date.parse(imported.installed) : null,
                            addedByUser: addedBy,
                        });
                        device.save(); /* add property _id */

                        DeviceAuditLog.import(req.user, device, (err, _entry) => {
                            if (err) {
                                console.warn('Device upload: audit: ', err);
                            }
                            resolve();
                        });
                    });
                });
            };
            importables.push(promiseImportable(line));
        }
        Promise.allSettled(importables).then(results => {
            const fulfilled = results.filter(r => r.status === 'fulfilled');
            res.json({ nImported: fulfilled.length });
        });
    });
});

module.exports = router;