/**
 * @provides MTouchHelper
 * @requires javelin-install
 *           javelin-stratcom
 * @javelin
 */

/**
 * A helper class that provides utilities to help to handle touch related logic
 * easier.
 */
JX.install('MTouchHelper', {
  construct : function() {
    if (__DEV__) {
      throw new Error('Utility class should not be constructed');
    }
  },

  initialize : function() {
    // Javelin does not listen to touchmove event by default, need
    // to hook it up.
    JX.enableDispatch(window, 'touchmove');

    if (__DEV__) {
      // Patch the touch event types for desktop browsers.
      // This makes it easier to debug touch UI from your desktop browser.
      JX.enableDispatch(window, 'mousemove');

      var helper = JX.MTouchHelper;
      if (!helper.USE_TOUCH) {
        helper.EVT_TOUCHSTART = 'mousedown';
        helper.EVT_TOUCHMOVE = 'mousemove';
        helper.EVT_TOUCHCANCEL = 'mouseup';
        helper.EVT_TOUCHEND = 'mouseup';
      }
    }
  },

  statics : {
    USE_TOUCH : 'ontouchstart' in document,
    EVT_TOUCHSTART : 'touchstart',
    EVT_TOUCHEND : 'touchend',
    EVT_TOUCHMOVE : 'touchmove',
    EVT_TOUCHCANCEL : 'touchcancel',

    /**
     * @param {JX.Event} event The Javelin event.
     * @return {Object} The (x, y) coordinate of the touch event relative to the
     *         page.
     */
    getTouchPageCoord : function(event) {
      var touch = JX.MTouchHelper.getTouches(event)[0];
      return {
        x : touch.pageX,
        y : touch.pageY
      };
    },

    /**
     * @param {JX.Event} event The Javelin event.
     * @return {Array.<Event>} A list of native DOM events.
     */
    getTouches : function(event) {
      var results;
      var native_evt = event.getRawEvent();
      if (__DEV__) {
        if (!JX.MTouchHelper.USE_TOUCH) {
          return [native_evt];
        }
      }

      if (native_evt.targetTouches && native_evt.targetTouches[0]) {
        results = native_evt.targetTouches;
      } else if (native_evt.touches && native_evt.touches[0]) {
        results = native_evt.touches;
      } else if (native_evt.changedTouches && native_evt.changedTouches[0]) {
        results = native_evt.changedTouches;
      } else {
        results = [native_evt];
      }
      return results;
    }
  }
});

