const mongoose = require('mongoose');

// User Audit log contains persistent events 

// UserAudit Schema
const UserAuditSchema = new mongoose.Schema({
    callee: { // user who called the method
        type: String,
        required: true,
    },
    method: { // method type
        type: String,
        required: true,
        enum: [
            'login',
            'add-api-key',
            'delete-api-key',
            'add-user',
            'delete-user',
            'password-reset',
        ],
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    apiKeyId: {
        type: String,
        required: function() {
            return this.method === 'add-api-key' || this.method === 'delete-api-key';
        },
    },
    userId: {
        type: String,
        required: function() {
            return this.method === 'add-user' || this.method === 'delete-user';
        },
    },
});

const UserAuditEntry = module.exports = mongoose.model('UserAuditLog', UserAuditSchema);

//
// Events
//

module.exports.login = function(callee, cb) {
    const entry = new UserAuditEntry({
        callee: callee._id,
        method: 'login',
    });
    entry.save(cb);
};

module.exports.addUser = function(callee, user, cb) {
    const entry = new UserAuditEntry({
        callee: callee._id,
        method: 'add-user',
        userId: user._id,
    });
    entry.save(cb);
};

module.exports.delUser = function(callee, _id, cb) {
    const entry = new UserAuditEntry({
        callee: callee._id,
        method: 'delete-user',
        userId: _id,
    });
    entry.save(cb);
};

module.exports.addApiKey = function(callee, apiKey, cb) {
    const entry = new UserAuditEntry({
        callee: callee._id,
        method: 'add-api-key',
        apiKeyId: apiKey._id,
    });
    entry.save(cb);
};

module.exports.deleteApiKey = function(callee, apiKey, cb) {
    const entry = new UserAuditEntry({
        callee: callee._id,
        method: 'delete-api-key',
        apiKeyId: apiKey._id,
    });
    entry.save(cb);
};

module.exports.passwordReset = function(callee, cb) {
    const entry = new UserAuditEntry({
        callee: callee._id,
        method: 'password-reset',
    });
    entry.save(cb);
};

//
// Purge
//

module.exports.purge = function(cb) {
    // purge old events to save space

    // delete entries of methods: (login) that are older than
    // a set time

    // older than six months
    let old = new Date().setMonth(new Date().getMonth() - 6);

    const query = {
        date: { $lt: old },
        $or: [
            { method: 'login' },
        ],
    };
    UserAuditEntry.remove(query, cb);
};
