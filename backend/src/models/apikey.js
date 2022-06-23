const crypto = require('crypto');

const mongoose = require('mongoose');

// ApiKey Schema
const ApiKeySchema = new mongoose.Schema({
    key: { // random key
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    owner: { // created by user
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

const ApiKey = module.exports = mongoose.model('ApiKey', ApiKeySchema);

module.exports.getById = function(_id, callback) {
    ApiKey.findById(_id, callback);
};

module.exports.getByKey = function(key, callback) {
    const query = { key: key };
    ApiKey.findOne(query, callback);
};

module.exports.getByUser = function(user, callback) {
    const query = { owner: user };
    ApiKey.find(query, callback);
};

module.exports.getAll = function(callback) {
    ApiKey.find({}, callback);
};

module.exports.addForUser = function(template, callback) {
    const key = crypto.randomBytes(48).toString('base64');
    const newApiKey = new ApiKey({
        name: template.name,
        owner: template.owner,
        key: key,
    });
    newApiKey.save(callback);
};

module.exports.delete = function(_id, callback) {
    ApiKey.findByIdAndDelete({_id: _id}, callback);
};