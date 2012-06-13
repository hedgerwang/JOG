/**
 * @fileOverview
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var Events = require('jog/events').Events;

var ImageableManager = Class.create(null, {
  /**
   *
   * @param {number} maxLoadingCount
   */
  main: function(maxLoadingCount) {
    this._loadingQueue = [];
    this._maxLoadingCount = maxLoadingCount;
    this._onLoad = this.bind(this._onLoad);
    this._maybeLoadMore = this.bind(this._maybeLoadMore);
  },

  /** @override */
  dispose: function() {
    this._loadingQueue.length = 0;
    clearTimeout(this._loadMoreTimer);
  },

  /**
   * @param {Imageable} imageable
   */
  register: function(imageable) {
    if (!this._maybeLoad(imageable)) {
      this._loadingQueue.push(imageable);
      this._maybeLoadMore();
    }
  },

  /**
   * @param {Imageable} imageable
   */
  unregister: function(imageable) {
    var idx = this._loadingQueue.indexOf(imageable);
    if (idx > -1) {
      this._loadingQueue.splice(idx, 1);
    }
  },

  /**
   * @param {Imageable} imageable
   */
  _maybeLoad: function(imageable) {
    if (this._loadingCount > this._maxLoadingCount ||
      !imageable.isElementVisible()) {
      return false;
    } else {
      this._loadingCount++;
      imageable.addEventListener('load', this._onLoad);
      imageable.addEventListener(imageable, 'error', this._onLoad);
      imageable.load();
      return true;
    }
  },

  _maybeLoadMore: function() {
    clearTimeout(this._loadMoreTimer);
    delete this._loadMoreTimer;

    var now = Date.now();
    var interval = now - this._loadingTimeStamp;

    if (interval < this._loadingInterval) {
      if (this._loadingQueue.length) {
        this._loadMoreTimer = setTimeout(
          this._maybeLoadMore,
          this._loadingInterval - interval);
      }
      return;
    }

    this._loadingTimeStamp = now;

    var loadingCountAllowed = Math.min(
      this._loadingQueue.length,
      this._maxLoadingCount - this._loadingCount
    );

    // When we're allowed to load more.
    for (var i = 0, imageable; imageable = this._loadingQueue[i]; i++) {
      if (this._maybeLoad(imageable)) {
        loadingCountAllowed--;
        this._loadingQueue.splice(this._loadingQueue.indexOf(imageable), 1);
      }

      if (loadingCountAllowed <= 0) {
        // Enough.
        return;
      }
    }

    this._loadMoreTimer = setTimeout(
      this._maybeLoadMore,
      this._loadingInterval);
  },

  /**
   * @param {Imageable} imageable
   */
  _onLoad:function(event) {
    var imageable = event.target;
    this.unregister(imageable);
    this._loadingCount--;

    if (!imageable.disposed) {
      if (imageable.isElementVisible()) {
        imageable.show();
      } else {
        this._loadingQueue.push(imageable.clone());
      }
    }

    this._maybeLoadMore();
  },

  /**
   * @type {Number}
   */
  _loadingInterval: 300,

  /**
   * @type {Number}
   */
  _loadMoreTimer: 0,

  /**
   * @type {Number}
   */
  _loadingTimeStamp: 0,

  /**
   * @type {Number}
   */
  _loadingCount: 0,

  /**
   * @type {Number}
   */
  _maxLoadingCount: 0,

  /**
   * @type {Array.<Imageable>}
   */
  _loadingQueue: null,

  /**
   * @type {Events}
   */
  _events: null
});

exports.ImageableManager = ImageableManager;