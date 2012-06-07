/**
 * @fileOverview
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var lang = require('jog/lang').lang;

var Deferred = Class.create(null, {

  main: function() {
    this._callbacks = [];
  },

  /**
   * @type {Array.<Function>}
   */
  _callbacks : null,

  /**
   * @type {Array}
   */
  _waitForQueue: null,

  /**
   * @type {Object}
   */
  _waitForThing: null,

  /**
   * @type {boolean}
   */
  _done: false,

  dispose: function() {
    this._clearWaitFor();
  },

  /**
   * @param {Deferred} deferred
   */
  attachTo: function(deferred) {
    deferred.addCallback(this.bind(this.succeed), this.bind(this.fail));
    return deferred;
  },

  /**
   * @param {Function} fn
   */
  then: function(fn) {
    var df = new Deferred();
    this.addCallback(function(more) {
      var newDeferred = fn.apply(null, arguments);
      if (!newDeferred || !(newDeferred instanceof Deferred)) {
        var msg = 'Not Deferred';
        if (__DEV__) {
          msg = 'deferred.then() expects a function that returns ' +
            'a Deferred instance';
        }
        throw new Error(msg);
      }
      df.attachTo(newDeferred);
    });
    return df;
  },

  /**
   * @param {Function} onSuccess
   * @param {Function=} opt_onError
   * @return {Deferred}
   */
  addCallback: function(onSuccess, opt_onError) {
    this._callbacks.push(onSuccess, opt_onError);
    return this;
  },

  /**
   * @param {*} result
   * @param {*...} more
   * @return {Deferred}
   */
  succeed: function(result, more) {
    if (this._done || this.disposed) {
      throw new Error('Deferred already succeed');
    }

    this._clearWaitFor();
    this._done = true;

    if (arguments.length > 1) {
      more = lang.toArray(arguments);
    } else {
      more = undefined;
    }

    this.callLater(function() {
      if (this._callbacks) {
        for (var i = 0, j = this._callbacks.length; i < j; i += 2) {
          var callback = this._callbacks[i];
          if (callback) {
            more === undefined ? callback(result) : callback.apply(null, more);
          }
        }
      }

      result = null;
      more = null;
      this.dispose();
    }, 0);

    return this;
  },

  /**
   * @param {string=} opt_error
   * @return {Deferred}
   */
  fail: function(opt_error) {
    if (this._done || this.disposed) {
      throw new Error('Deferred already fail');
    }

    this._clearWaitFor();
    this._done = true;

    this.callLater(function() {
      if (this._callbacks) {
        for (var i = 1, j = this._callbacks.length; i < j; i += 2) {
          var callback = this._callbacks[i];
          callback && callback(opt_error);
        }
        this._callbacks.length = 0;
      }

      opt_error = null;
      this.dispose();
    }, 0);

    return this;
  },

  /**
   * @param {Object} object
   * @param {string} key
   * @return {Deferred}
   */
  waitForValue: function(object, key) {
    if (__DEV__) {
      if (key.charAt(0) === '_') {
        throw new Error('wait for a private(?) member "' + key +
          '" that could be renamed after compression')
      }
    }


    if (!this._waitForQueue) {
      this._waitForQueue = [];
    }

    this._waitForQueue.push(
      {
        object: object,
        key: key,
        time: Date.now()
      }
    );

    if (!this._waitForTimer) {
      this._waitForTimer = setInterval(this.bind(this._processWaitFor), 100);
    }

    return this;
  },

  _processWaitFor: function() {
    if (!this._waitForThing) {
      this._waitForThing = this._waitForQueue.shift();
    }

    var thing = this._waitForThing;
    var value = thing ? thing.object[thing.key] : null;
    if (value !== undefined && value !== null) {
      if (!this._waitForResults) {
        this._waitForResults = [];
      }

      this._waitForResults.push(value);

      if (this._waitForQueue.length) {
        delete this._waitForThing;
        // Then we'll continue to wait for the next one.
      } else {
        this.succeed.apply(this, this._waitForResults);
        this._clearWaitFor();
      }
      return;
    }

    if (((Date.now() - thing.time) > 60000)) {
      console.warn('waitForValue timeout', thing.key);
      this.fail('Wait for timeout');
      this._clearWaitFor();
    }
  },

  _clearWaitFor: function() {
    if (this._waitForResults) {
      this._waitForResults.length = 0;
    }
    delete this._waitForThing;
    clearInterval(this._waitForTimer);
    delete this._waitForTimer;
  }
});

exports.Deferred = Deferred;