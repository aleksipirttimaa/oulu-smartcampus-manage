const express = require('express');
const router = express.Router();

const Device = require('../models/device');
const DeviceAuditLog = require('../models/deviceAuditLog');
const Roles = require('../roles');
const User = require('../models/user');


// Add
/**
 * @swagger
 *
 * /devices/add:
 *   post:
 *     summary: Add new device
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Device"
 *     responses:
 *       200:
 *         $ref: "#/components/responses/Ok"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - Device
 */
router.post('/add', Roles.authorize('device-manager'), (req, res, next) => {
    if (req.body.location.type != 'Point') {
        res.json({success: false, msg: 'bad location type'});
        return;
    }
    if (!(req.body.location.coordinates instanceof Array)) {
        res.json({success: false, msg: 'bad coordinates'});
        return;
    }
    if (!(req.body.location.coordinates[0])) {
        res.json({success: false, msg: 'bad first coordinate'});
        return;
    }
    let newDevice = new Device({
        deviceId: req.body.deviceId,
        deviceType: req.body.deviceType,
        description: req.body.description,
        image: req.body.image,
        status: req.body.status,
        installed: req.body.installed,
        floorLevel: req.body.floorLevel,
        location: req.body.location,
        addedByUser: req.body.addedByUser,
    });
    Device.addDevice(newDevice, (err, device) => {
        if(err){
            return res.json({success: false, msg: `Failed to add new device ${err}`});
        }
        DeviceAuditLog.add(req.user, device, (err, _entry) => {
            if (err) {
                return res.json({success: false, msg: 'Failed to audit'});
            }
            res.json({success: true, msg: 'Device added successfully'});
        });
    });
});

// Get by internal 'id'
/**
 * @swagger
 *
 * /devices/getById:
 *   post:
 *     summary: Get device by id
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
 *                   device:
 *                     $ref: "#/components/schemas/Device"
 *     tags:
 *       - Device
 */
router.post('/getById', (req, res, next) => {
    const _id = req.body._id;
    Device.getDeviceById(_id, (err, device) => {
        if (err) {
            res.json({success: false, msg: 'Failed to get device'});
        } else {
            res.json({success: true, device: device});
        }
    });
});

// Get first sensor with matching 'deviceId'
/**
 * @swagger
 *
 * /devices/getByDeviceId:
 *   post:
 *     summary: Get first matching device by deviceId
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *             - deviceId
 *             properties:
 *               deviceId:
 *                 type: string
 *     responses:
 *       200:
 *         allOf:
 *           - $ref: "#/components/responses/Ok"
 *           - content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   device:
 *                     $ref: "#/components/schemas/Device"
 *     tags:
 *       - Device
 */
router.post('/getByDeviceId', (req, res, next) => {
    const deviceId = req.body.deviceId;
    Device.getDeviceByDeviceId(deviceId, (err, device) => {
        if (err) {
            res.json({success: false, msg: 'Failed to get device by deviceId'});
        } else {
            res.json({success: true, device: device});
        }
    });
});

// Update
/**
 * @swagger
 *
 * /devices/update:
 *   post:
 *     summary: Update device
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *             - _id
 *             - update
 *             properties:
 *               _id:
 *                 type: string
 *               update:
 *                 $ref: "#/components/schemas/DeviceUpdate"
 *     responses:
 *       200:
 *         $ref: "#/components/responses/Ok"
 *       401:
 *         $ref: "#/components/responses/NotAuthorized"
 *     tags:
 *       - Device
 */
router.post('/update', Roles.authorize('device-manager'), (req, res, next) => {
    const _id = req.body._id;
    const update = req.body.update;
    const fields = Object.keys(update);
    const as = update.status || null;
    if (Object.keys(update).length === 0) {
        return res.json({success: false, msg: 'Nothing to update'});
    } 
    Device.updateDeviceById(_id, update, (err, device) => {
        if(err){
            return res.json({success: false, msg: 'Failed to update device'});
        }
        if (fields.length === 1 && fields[0] === 'status') {
            const as = update.status;
            DeviceAuditLog.mark(req.user, device, as, (err, _entry) => {

                if (err) {
                    return res.json({success: false, msg: 'Failed to audit'});
                }
                res.json({success: true, msg: 'Device updated successfully'});
            });
        } else {
            DeviceAuditLog.update(req.user, device, as, fields, (err, _entry) => {
                if (err) {
                    return res.json({success: false, msg: 'Failed to audit'});
                }
                res.json({success: true, msg: 'Device updated successfully'});
            });
        }
    });
});

// Delete
/**
 * @swagger
 *
 * /devices/delete:
 *   post:
 *     summary: Delete device
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
 *       - Device
 */
router.post('/delete', Roles.authorize('device-manager'), (req, res, next) => {
    Device.deleteDeviceById(req.body._id, (err, device) => {
        if(err){
            return res.json({success: false, msg: 'Failed to delete device'});
        }
        DeviceAuditLog.delete(req.user, device, (err, _entry) => {
            if (err) {
                return res.json({success: false, msg: 'Failed to audit'});
            }
            res.json({success: true, msg: 'Device deleted successfully'});
        });
    });
});

/**
 * @swagger
 *
 * /devices/listAll:
 *   get:
 *     summary: List all devices
 *     responses:
 *       200:
 *         $ref: "#/components/schemas/Devices"
 *     tags:
 *       - Device
 */
router.get('/listAll', (req, res, next) => {
    Device.getAllDevices((err, devices) => {
        if (err || !devices) {
            res.json({});
        }
        const ret = devices.map(d => d.toObject());
        res.json(ret);
    });
});

module.exports = router;