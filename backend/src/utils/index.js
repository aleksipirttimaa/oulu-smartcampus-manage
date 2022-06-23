module.exports.secondsSinceEpoch = () => {
    return Math.round(Date.now() / 1000);
};