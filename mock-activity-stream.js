var activityMocks = require('activity-mocks');
var from = require('from2');

module.exports = from.obj(function (size, send) {
    send(null, activityMocks.create('livefyre.sitePostCollection'));
});
