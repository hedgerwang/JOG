/**
 * @provides MAnimator
 *
 * @requires javelin-install
 * @javelin
 */

/**
 * Class for playing animation frames.
 */
JX.install('MAnimator', {
  statics : {
    _animInterval: 16,

    _lastAnimTime: 0,

    /**
     * @param {number} value Between 0 ~ 1.
     */
    easeOutCubic : function(value) {
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
    requestAnimationFrame: function(callback) {
      // TODO(hedger): Use requestAnimationFrame when possible.
      var klass = JX.MAnimator;
      var currTime = JX.now();
      var timeDelta = currTime - klass._lastAnimTime;
      var timeToCall = Math.max(0, klass._animInterval - timeDelta);
      klass._lastAnimTime = currTime + timeToCall;
      return setTimeout(callback, timeToCall);
    },

    /**
     * Implementation of requestAnimationFrame.
     * @param {string} requestID
     */
    cancelAnimationFrame: function(requestID) {
      // TODO(hedger): Use cancelAnimationFrame when possible.
      requestID && clearTimeout(requestID);
    }
  },

  members: {
    dispose: function() {
      if (!this._disposed) {
        this.stop();
        for (var property in this) {
          delete this[property];
        }
        this._disposed = true;
      }
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

      var easingFn = opt_easingFn || JX.MAnimator.easeOutCubic;
      var percent = 0;
      var value = 0;
      var start = JX.now();
      this._value = 0;
      this._animating = true;
      this._onStopCallback = completedFn;

      var frameFn = JX.bind(this, function() {
        var now = JX.now();

        if (!verifyFn()) {
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

        this._animID = JX.MAnimator.requestAnimationFrame(frameFn);
      }, this);

      this._animID = JX.MAnimator.requestAnimationFrame(frameFn);
    },

    stop: function() {
      if (this._animating) {
        this._animating = false;
        JX.MAnimator.cancelAnimationFrame(this._animID);
        this._onStopCallback(this._value, this._animating, JX.now());
        delete this._animID;
        delete this._onStopCallback;
        this._value = 0;
      }
    },

    _value: 0
  }
});
