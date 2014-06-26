var ActivityList = require('activity-list');
var ChronosStream = require('chronos-stream');
var LivefyreStream = require('livefyre-stream-client');

// add ?auth=lftoken to auth
var auth;
var authQuery = window.location.search.match(/auth=([^&]+)/);
var token = authQuery ? authQuery[1] : null;

console.log('loading personalized feed example');

// The Feed container has a list
// and clicking on something with [data-show-more] should show more
var feed = document.getElementById('feed');
feed.addEventListener('click', function (e) {
    var target = e.target;
    if ( ! target.attributes['data-show-more']) {
        return;
    }
    console.log('calling list.showMore()');
    list.showMore();
});
var list = window.list = new ActivityList();
// prepend the ActivityList
feed.insertBefore(list.el, feed.lastElementChild)




list.streamMore(require('./mock-activity-stream'));
// list.streamMore(chronosActivityStream(
//     'urn:livefyre:profiles-qa.fyre.co:user=5329c8c285889e7bc6000000:personalStream',
//     auth))

// real-time stuff from stream
var sc = new LivefyreStream({
    hostname: "stream.qa-ext.livefyre.com",
    port: "80"
});

onUser(function (user) {
    // sc.connect(user.get('token'), 'sample');
    // list.stream(sc);
});



// create an authenticated stream of activities
// from chronos
function chronosActivityStream(topic, auth) {
    topic = topic || 'urn:livefyre:livefyre.com:site=290596:collection=2486485:SiteStream';
    var activities = new ChronosStream(topic, {
        highWaterMark: 0,
        lowWaterMark: 0
    });
    activities.auth(token);
    // onUser(function () {
    //     activities.auth(user.get('token'));
    // })
    // if (auth) {
    //     activities.auth(auth);
    // }
    return activities;
}

/**
 * Fire cb whenever a LivefyreUser logs in
 */
function onUser(cb) {
    var auth = (typeof Livefyre !== 'undefined') && Livefyre.auth;
    if ( ! auth) {
        return setTimeout(function () {
            onUser(cb);
        }, 1000);
    }
    var user = auth.get('livefyre');
    if (user) cb(user);
    auth.on('login.livefyre', cb);
}

Livefyre.require(['auth-contrib#0.0.0-pre'], function (authContrib) {
    var auth = auth = Livefyre.auth;
    auth.delegate(auth.createDelegate('http://qa-ext.livefyre.com'));
    var authLog = authContrib.createLog(auth, document.getElementById('auth-log'));
    authContrib.createButton(auth, document.getElementById('auth-button'), authLog);
});
