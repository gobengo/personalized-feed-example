var activityMocks = require('activity-mocks');
var from = require('from2');

var opts = {
    highWaterMark: 0,
    lowWaterMark: 0
};

module.exports = function () {
    return from.obj(opts, function (size, send) {
        console.log('mock-activity-stream _read', size);
        send(null, activityMocks.create('livefyre.sitePostCollection'));
    });
};
