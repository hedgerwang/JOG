/**
 * @fileOverview
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var lang = require('jog/lang').lang;

var Deferred = Class.create(null, {

  /**
   * @type {Array.<Function>}    PC@nc6000
   *
   */
  _callbacks : null,

  /**
   * @param {Function} onSuccess
   * @param {Function=} opt_onError
   * @return {Deferred}
   */
  addCallback: function(onSuccess, opt_onError) {
    if (!this._callbacks) {
      this._callbacks = [];
    }
    this._callbacks.push(onSuccess, opt_onError);
    return this;
  },

  /**
   * @param {Object} context
   * @param {Function} onSuccess
   * @param {Function=} opt_onError
   * @return {Deferred}
   */
  bindCallback: function(context, onSuccess, opt_onError) {
    if (context) {
      onSuccess = onSuccess ?
        lang.bind(context, onSuccess) :
        onSuccess;

      opt_onError = opt_onError ?
        lang.bind(context, opt_onError) :
        opt_onError;
    }

    return this.addCallback(onSuccess, opt_onError);
  },

  /**
   * @param {*} result
   * @return {Deferred}
   */
  succeed: function(result) {
    setTimeout(lang.bind(this, function() {
      if (this._callbacks) {
        for (var i = 0, j = this._callbacks.length; i < j; i += 2) {
          var callback = this._callbacks[i];
          callback && callback(result);
        }
        this._callbacks.length = 0;
        result = null;
      }
      this.dispose();
    }), 10);

    return this;
  },

  /**
   * @param {string=} opt_error
   * @return {Deferred}
   */
  fail: function(opt_error) {
    setTimeout(lang.bind(this, function() {
      if (this._callbacks) {
        for (var i = 1, j = this._callbacks.length; i < j; i += 2) {
          var callback = this._callbacks[i];
          callback && callback(opt_error);
        }
        this._callbacks.length = 0;
      }
      opt_error = null;
      this.dispose();
    }), 0);

    return this;
  },

  /**
   * @param {Object} object
   * @param {string} key
   * @return {Deferred}
   */
  waitForValue: function(object, key) {
    // Kill self since we'll return a new instance.
    this.dispose();

    var df = new Deferred();

    var onWaitForValue = lang.bind(df, function() {
      if (object[key]) {
        clearTimeout(timeout);
        clearInterval(interval);
        df.succeed(object[key]);
      }
    });

    var onWaitForValueTimeout = lang.bind(df, function() {
      clearTimeout(timeout);
      clearInterval(interval);
      df.fail('wait timeout');
    }, 100);

    var interval = setInterval(onWaitForValue);
    var timeout = setTimeout(onWaitForValueTimeout, 60000);
    return df;
  }
});

exports.Deferred = Deferred;