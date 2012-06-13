/**
 * @fileOverview ScrollArea
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;

var animInterval = 16;
var lastAnimTime = 0;

var Animator = Class.create(null, {
  /**
   * @param {number=} opt_interval
   */
  main: function(opt_interval) {
    this._interval = opt_interval === undefined ?
      animInterval : opt_interval;
  },

  dispose:function() {
    this.stop();
  },

  /**
   * @param {Function} stepFn Function to call for each frame.
   * @param {Function} verifyFn Function to call before each frame.
   * @param {Function} completedFn Function to call when all frames complete
   *        or stop.
   * @param {number} duration Duration of playing frames.
   * @param {Function=} opt_easingFn Optional easing function.
   */
  start: function(stepFn, verifyFn, completedFn, duration, opt_easingFn) {
    // Kill the old animation (if exists).
    this.stop();

    duration = duration || 250;

    var easingFn = opt_easingFn || Animator.easeOutCubic;
    var percent = 0;
    var value = 0;
    var start = Date.now();
    this._value = 0;
    this._animating = true;
    this._onStopCallback = completedFn;

    if (__DEV__) {
      if (typeof stepFn !== 'function' ||
        typeof verifyFn !== 'function' ||
        typeof completedFn !== 'function' ||
        typeof easingFn !== 'function') {
        throw new Error('Invalid Animator functions');
      }
    }

    var frameFn = this.bind(function() {
      var now = Date.now();

      if (!verifyFn(value)) {
        this.stop();
        return;
      }

      percent = (now - start + 1) / duration;

      if (percent > 1) {
        percent = 1;
      }

      value = easingFn ? easingFn(percent) : percent;

      this._value = value;

      if (stepFn(value, this._animating, now) === false || percent === 1) {
        this.stop();
        return;
      }

      this._animID = Animator.requestAnimationFrame(frameFn, this._interval);
    }, this);

    this._animID = Animator.requestAnimationFrame(frameFn, this._interval);
  },

  stop: function() {
    if (this._animating) {
      this._animating = false;
      Animator.cancelAnimationFrame(this._animID);
      this._onStopCallback(this._value, this._animating, Date.now());
      delete this._animID;
      this._value = 0;
    }
  },

  _onStopCallback: null,
  _animating: false,
  _value: 0,
  _animID: '',
  _interval: 0
});

Class.mixin(Animator, {
  /**
   * @param {number} value Between 0 ~ 1.
   */
  easeOutCubic :function(value) {
    return (Math.pow((value - 1), 3) + 1);
  },

  linear: function(value) {
    return value;
  },

  /**
   * @param {number} value Between 0 ~ 1.
   */
  easeInOutCubic : function(value) {
    if ((value /= 0.5) < 1) {
      return 0.5 * Math.pow(value, 3);
    }

    return 0.5 * (Math.pow((value - 2), 3) + 2);
  },

  /**
   * Implementation of requestAnimationFrame.
   * @param {Function} callback
   * @param {number=} opt_interval
   * @return {string}
   */
  requestAnimationFrame : window.webkitRequestAnimationFrame ?
    function(callback, opt_interval) {
      return window.webkitRequestAnimationFrame(callback);
    } :
    function(callback, opt_interval) {
      // TODO(hedger): Use requestAnimationFrame when possible.
      var currTime = Date.now();
      var timeDelta = currTime - lastAnimTime;
      var interval = opt_interval || animInterval;
      var timeToCall = Math.max(0, interval - timeDelta);
      lastAnimTime = currTime + timeToCall;
      return setTimeout(callback, timeToCall);
    },

  /**
   * Implementation of requestAnimationFrame.
   * @param {string} requestID
   */
  cancelAnimationFrame : window.webkitCancelAnimationFrame ?
    function(requestID) {
      window.webkitCancelAnimationFrame(requestID);
    } :
    window.cancelAnimationFrame ||
      function(requestID) {
        // TODO(hedger): Use cancelAnimationFrame when possible.
        requestID && clearTimeout(requestID);
      }
});

exports.Animator = Animator;