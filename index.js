var ActivityList = require('activity-list');
var ChronosStream = require('chronos-stream');
var StreamClient = require('livefyre-stream-client');
var through = require('through2');
var More = require('stream-more');
var ActivityElement = require('activity-element');

module.exports = PersonalizedNewsFeed;

/**
 * A list of rendered activities that are personalized to the logged-in user.
 * @param [opts] {object} options
 * @param [opts.el] {HTMLElement} an HTMLElement to render in. If not provided,
 *   one will be created automatically and accessible at .el
 */
function PersonalizedNewsFeed(opts) {
    opts = opts || {};
    this.el = opts.el || document.createElement('div');
    this._setLoading(true);
    // show this many more when asked
    this.showMoreAmount = 10;
    this._topic = null;
    this._userToken = null;
    this._streamClient = null;
    this._chronosStream = null;
    this._archiveStream = null;
    // has a child ActivityList, which streams from a passthrough
    this._listStream = through.obj({ highWaterMark: 0, lowWaterMark: 0 });
    this._activityList = this._createActivityList();
    this._activityList.stream(this._listStream);

    this._addEventListeners();
}

/**
 * Request that {amount} more activities are added to the Feed
 */
PersonalizedNewsFeed.prototype.showMore = function (amount) {
    this._archiveStream.setGoal(amount || this.showMoreAmount);
};

PersonalizedNewsFeed.prototype._setLoading = function (isLoading) {
    isLoading = (arguments.length === 0) ? true : isLoading;
    var el = this.el;
    var loadingAttr = 'data-loading';
    if (isLoading) {
        el.setAttribute(loadingAttr, '');
    } else {
        el.removeAttribute(loadingAttr);
    }
};

PersonalizedNewsFeed.prototype.setToken = function (token) {
    var parts = token.split('.');
    var dataPart = parts[1];
    var data = JSON.parse(new Buffer(dataPart, 'base64').toString('utf8'));
    var network = data.domain;
    var userId = data.user_id;
    this._userToken = token;
    this._setTopic(personalizedTopic(network, userId));
};

/**
 * Render an activity into an HTMLElement
 */
PersonalizedNewsFeed.prototype.renderActivity = function (activity) {
    throw new Error("Please override PersonalizedNewsFeed#renderActivity");
};

/**
 * Create an ActivityList to render activities in
 * If this.el has a child with role="list", that element will be used
 * Else a new element will be prepended to this.el
 */
PersonalizedNewsFeed.prototype._createActivityList = function () {
    var newsFeed = this;
    // if there is a child with [role=list], render in that
    var childListEl = [].filter.call(this.el.children, function (child) {
        return child.getAttribute('role') === 'list';
    })[0];
    var list = new ActivityList(childListEl);
    // if there was no child el to render in, prepend list to this
    if ( ! childListEl) {
      newsFeed.el.insertBefore(list.el, newsFeed.el.firstChild);
    }
    // the list should render activities according to this.renderActivity
    list.renderActivity = function () {
        return newsFeed.renderActivity.apply(newsFeed, arguments);
    }
    return list;
};

PersonalizedNewsFeed.prototype._setTopic = function (topic) {
    var self = this;
    if (topic === this._topic) {
        // same as before, do nothing
        return;
    }
    this._topic = topic;
    // get rid of old topic streams
    if (this._archiveStream) {
        this._archiveStream.unpipe(this._listStream);
    }
    if (this._streamClient) {
        this._streamClient.disconnect();
    }
    // connect new ones
    // old stuff (chronos through more)
    this._chronosStream = new ChronosStream(topic, {
        lowWaterMark: 0,
        highWaterMark: 0
    }).auth(this._userToken);
    var moreArchive = new More({
        objectMode: true,
        highWaterMark: 0,
        lowWaterMark: 0
    });
    // we're fully loaded once the more stream holds onto stuff
    // or more is finished, which means there weren't enough things
    // in the archive to get to 'hold'
    moreArchive.once('hold', didLoad);
    moreArchive.once('end', didLoad);
    function didLoad() {
        self._setLoading(false);
        moreArchive.removeListener('hold', didLoad)
        moreArchive.removeListener('end', didLoad)
    };
    function didLoad() {
        self._setLoading(false);
    }
    this._archiveStream = this._chronosStream.pipe(moreArchive);
    this._archiveStream.pipe(this._listStream);
    this._archiveStream.setGoal(this.showMoreAmount);
    // new stuff
    if ( ! this._streamClient) {
        this._streamClient = new StreamClient({
            hostname: "stream.qa-ext.livefyre.com",
            port: "80"
        });
        this._streamClient.pipe(this._listStream);
    }
    this._streamClient.connect(this._userToken, topic);
};

PersonalizedNewsFeed.prototype._addEventListeners = function () {
    var newsFeed = this;
    var el = this.el;
    // on click of el with data-show-more, show more
    el.addEventListener('click', function (e) {
        var target = e.target;
        var showMore = target.getAttribute('data-show-more');
        if (showMore === null) {
            return;
        }
        // clicked show more
        newsFeed.showMore(showMore);
    });
};

function personalizedTopic(network, userId) {
    var template = 'urn:livefyre:{{network}}:user={{userId}}:personalStream';
    var topic = template
        .replace('{{network}}', network)
        .replace('{{userId}}', userId);
    return topic;
}
