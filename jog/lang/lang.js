/**
 * @fileOverview
 * @author Hedger Wang
 */

var lang = {

  /**
   * @param {Object} context
   * @param {Function} fn
   */
  bind: function(context, fn) {
    if (__DEV__) {
      if (!context) {
        throw new Error('bound context is null');
      }

      if (fn._jogLangBoundContext && fn._jogLangBoundContext !== context) {
        throw new Error('context already bound');
      }
    }

    if (fn._jogLangBound) {
      return fn;
    }

    var fn2 = function() {
      return fn.apply(context, arguments)
    };

    fn2._jogLangBound = true;

    if (__DEV__) {
      fn2._jogLangBoundContext = context;
    }

    return fn2;
  },

  /**
   * @param {*} obj
   * @return {boolean}
   */
  isArray: function(obj) {
    return obj && obj.slice ?
      Object.prototype.toString.call(obj) === '[object Array]' : false;
  },

  /**
   * @param {Arguments} args
   */
  toArray: function(args) {
    return Array.prototype.slice.call(args, 0);
  },

  /**
   *
   * @param {Function} fn
   * @param {number} delay
   * @param {Object=} opt_context
   */
  throttle: function(fn, delay, opt_context) {
    if (!delay) {
      delay = 16;
    }

    var args;

    var wfn1 = function() {
      fn.apply(opt_context, args);
      args = null;
    };

    var time1 = 0;

    var wfn2 = function() {
      var time2 = Date.now();
      var dt = time2 - time1;
      time1 = time2;

      args = arguments;

      if (wfn2._throttleTimer) {
        clearTimeout(wfn2._throttleTimer);
        wfn2._throttleTimer = setTimeout(wfn1, Math.max(delay - dt, 0));
      } else {
        wfn1();
        wfn2._throttleTimer = 1;
      }
    };

    return wfn2;
  },

  /**
   * @param {Function} fn
   */
  unthrottle: function(fn) {
    clearTimeout(fn._throttleTimer);
  }
};

exports.lang = lang;
