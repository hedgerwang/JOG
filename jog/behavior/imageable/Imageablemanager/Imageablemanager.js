/**
 * @fileOverview
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;


var ImageableManager = Class.create(null, {
  /**
   *
   * @param {number} maxLoadingCount
   */
  main: function(maxLoadingCount) {
    this._loadingQueue = [];
    this._maxLoadingCount = maxLoadingCount || 1;
    this._onLoad = this.bind(this._onLoad);
    this._lookup = this.bind(this._lookup);
    this._startLookUp = this.bind(this._startLookUp);
  },

  /** @override */
  dispose: function() {
    this._loadingQueue.length = 0;
    this._stopLookUp();
  },

  /**
   * @param {Imageable} imageable
   */
  register: function(imageable) {
    this._loadingQueue.push(imageable);
    this._startLookUp();
  },

  /**
   * @param {Imageable} imageable
   */
  unregister: function(imageable) {
    var idx = this._loadingQueue.indexOf(imageable);
    if (idx > -1) {
      this._loadingQueue.splice(idx, 1);
    }
    if (imageable.isLoading()) {
      this._loadingCount--;
    }
  },

  _lookupInterval: 500,

  _lookupTimer: 0,

  _startLookUp: function() {
    if (this._lookupTimer) {
      return;
    }

    var now = Date.now();
    var timeDiff = now - this._lookupTimeStamp;

    if (timeDiff >= this._lookupInterval) {
      this._lookupTimer = setTimeout(this._lookup, 0);
    } else {
      // Too early to lookup now, shall come back later.
      this.setTimeout(this._startLookUp, this._lookupInterval - timeDiff);
    }
  },

  _stopLookUp: function() {
    if (this._lookupTimer) {
      clearTimeout(this._lookupTimer);
      delete this._lookupTimer;
    }
  },

  _lookup: function() {
    this._lookupTimeStamp = Date.now();

    if (this._loadingCount >= this._maxLoadingCount ||
      !this._loadingQueue.length) {
      this._stopLookUp();
      return;
    }

    // When we're allowed to load more.
    for (var i = 0, imageable; imageable = this._loadingQueue[i]; i++) {
      if (imageable.shouldLoad()) {
        var src = imageable.src;

        this._loadingCount++;
        imageable.addEventListener('load', this._onLoad);
        imageable.addEventListener('error', this._onLoad);
        imageable.load();
      }

      if (this._loadingCount >= this._maxLoadingCount) {
        this._stopLookUp();
        // No lookup when loading is full.
        // Will restart it later.
        break;
      }
    }

    this._lookupTimer = setTimeout(this._lookup, this._lookupInterval);
  },

  /**
   * @param {Imageable} imageable
   */
  _onLoad:function(event) {
    var imageable = event.target;
    this._loadingCount--;
    this.unregister(imageable);

    if (event.type === 'load') {
      if (imageable.isVisible()) {
        imageable.show();
      } else if (imageable.shouldReload()) {
        this._loadingQueue.unshift(imageable.clone());
      }
    }

    clearTimeout(this._lookupTimer);
    delete this._lookupTimer;
    this._startLookUp();
  },

  /**
   * @type {Number}
   */
  _loadingCount: 0,

  /**
   * @type {Number}
   */
  _maxLoadingCount: 0,
  /**
   * @type {Number}
   */
  _lookupTimeStamp : 0,

  /**
   * @type {Array.<Imageable>}
   */
  _loadingQueue: null
});

exports.ImageableManager = ImageableManager;