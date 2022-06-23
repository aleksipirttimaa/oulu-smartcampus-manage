const mongoose = require('mongoose');

// GeoJSON pointSchema
const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

// Device Schema
const DeviceSchema = new mongoose.Schema({
    deviceId:{ // Id of the device. Used to query data from other db:s
        type: String,
        required: true,
    },
    location: { // coordinate location of the device
        type: pointSchema,
        required: false,
    },
    description: { // description of install (ceiling/wall/ground ect.)
        type: String,
        required: true,
    },
    image: { // picture of install
        type: Buffer,
    },
    deviceType: { // type of device ex. 'Elsys ERS CO2'
        type: String,
        required: true
    },
    status: { //Install status planned/installed/online
        type: String,
        required: true,
        enum: [
            'planned',     /* not installed, not healthy */
            'installed',   /* intalled, health not yet tested */
            'offline',     /* installed, not healthy */
            'online',      /* installed, healthy */
            'maintenance', /* taken down manually */
        ],
    },
    installed: {
        type: Date,
    },
    lastSeen: { // last time the device was confirmed online(future fuctionality)
        type: String,
    },
    floorLevel: {
        type: String,
        default: '1'
    },
    addedByUser:{
        type: String,
        required: true,
    }
});

const Device = module.exports = mongoose.model('Device', DeviceSchema);

module.exports.getDeviceById = function(_id, callback){
    Device.findById(_id, callback);
};

module.exports.getDeviceByDeviceId = function(deviceId, callback){
    const query = {deviceId: deviceId};
    Device.findOne(query, callback);
};

module.exports.deleteDeviceById = function(_id, callback){
    Device.findByIdAndDelete({_id: _id}, callback);
};

module.exports.updateDeviceById = function(_id, update, callback){
    Device.findByIdAndUpdate(_id, update, callback);
};

//should be replaced by get devices in view
module.exports.getAllDevices = function(callback){
    const query = {};
    Device.find(query, callback);
};

//module.exports.getDevicesInView = function(view, callback){
//    const query = { deviceLocation: deviceType }
//    Device.findAll(query, callback);
//};

module.exports.getDevicesByType = function(deviceType, callback){
    const query = { deviceType: deviceType };
    Device.findAll(query, callback);
};

module.exports.getDevicesByFloorLevel = function(floorLevel, callback){
    const query = { floorLevel: floorLevel };
    Device.findAll(query, callback);
};

module.exports.getDevicesByUser = function(addedByUser, callback){
    const query = { addedByUser: addedByUser };
    Device.findAll(query, callback);
};

module.exports.addDevice = function(newDevice, callback){
    newDevice.save(callback);
};