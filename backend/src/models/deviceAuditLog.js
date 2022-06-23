const mongoose = require('mongoose');

// Device Audit log contains persistent events 

// DeviceAudit Schema
const DeviceAuditSchema = new mongoose.Schema({
    callee: { // user who called the method
        type: String,
        required: true,
    },
    method: { // method type
        type: String,
        required: true,
        enum: [
            'add',
            'update',
            'mark',
            'comment',
            'delete',
            'import',
        ],
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    deviceId: { // mongo _id, not device.deviceId
        type: String,
        required: true,
    },
    fields: { // updated fields
        type: [String],
        required: function() {
            return this.method === 'update';
        },
    },
    comment: { // comment content
        type: String,
        required: function() {
            return this.method === 'comment';
        },
    },
    as: { // marked as
        type: String,
        required: function() {
            if (this.method === 'mark') {
                return true;
            } else if (this.method === 'update' && this.fields.includes('status')) {
                return true;
            }
            return false;
        },
    }
});

const DeviceAuditEntry = module.exports = mongoose.model('DeviceAuditLog', DeviceAuditSchema);

//
// Events
//

module.exports.add = function(callee, device, cb) {
    const entry = new DeviceAuditEntry({
        callee: callee._id,
        method: 'add',
        deviceId: device._id,
    });
    entry.save(cb);
};

module.exports.import = function(callee, device, cb) {
    const entry = new DeviceAuditEntry({
        callee: callee._id,
        method: 'import',
        deviceId: device._id,
    });
    entry.save(cb);
};

module.exports.update = function(callee, device, as, fields, cb) {
    const entry = new DeviceAuditEntry({
        callee: callee._id,
        method: 'update',
        deviceId: device._id,
        as: as,
        fields: fields,
    });
    entry.save(cb);
};

module.exports.mark = function(callee, device, as, cb) {
    const entry = new DeviceAuditEntry({
        callee: callee._id,
        method: 'mark',
        deviceId: device._id,
        as: as,
    });
    entry.save(cb);
};

module.exports.comment = function(callee, device, comment, cb) {
    const entry = new DeviceAuditEntry({
        callee: callee._id,
        method: 'comment',
        deviceId: device._id,
        comment: comment,
    });
    entry.save(cb);
};

module.exports.delete = function(callee, device, cb) {
    const entry = new DeviceAuditEntry({
        callee: callee._id,
        method: 'delete',
        deviceId: device._id,
    });
    entry.save(cb);
};

//
// Purge
//

module.exports.purge = function(cb) {
    // purge old events to save space

    // this log is never purged
    return cb(null, null);
};
