/**
 * @fileOverview ScrollArea
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;

var animInterval = 16;
var lastAnimTime = 0;

var Animator = Class.create(null, {
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

      this._animID = Animator.requestAnimationFrame(frameFn);
    }, this);

    this._animID = Animator.requestAnimationFrame(frameFn);
  },

  stop: function() {
    if (this._animating) {
      this._animating = false;
      Animator.cancelAnimationFrame(this._animID);
      this._onStopCallback(this._value, this._animating, Date.now());
      delete this._animID;
      delete this._onStopCallback;
      this._value = 0;
    }
  },

  _onStopCallback: null,
  _animating: false,
  _value: 0,
  _animID: ''
});

Class.mixin(Animator, {
  /**
   * @param {number} value Between 0 ~ 1.
   */
  easeOutCubic :function(value) {
    return (Math.pow((value - 1), 3) + 1);
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
   * @return {string}
   */
  requestAnimationFrame : function(callback) {
    // TODO(hedger): Use requestAnimationFrame when possible.
    var currTime = Date.now();
    var timeDelta = currTime - lastAnimTime;
    var timeToCall = Math.max(0, animInterval - timeDelta);
    lastAnimTime = currTime + timeToCall;
    return setTimeout(callback, timeToCall);
  },

  /**
   * Implementation of requestAnimationFrame.
   * @param {string} requestID
   */
  cancelAnimationFrame : function(requestID) {
    // TODO(hedger): Use cancelAnimationFrame when possible.
    requestID && clearTimeout(requestID);
  }
});


exports.Animator = Animator;