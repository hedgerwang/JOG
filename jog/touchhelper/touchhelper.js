/**
 * @fileOverview TouchHelper
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;

var useTouch = 'ontouchstart' in document;
var readonlyTouchEvents = [];

var TouchHelper = {
  USE_TOUCH : useTouch,
  EVT_TOUCHSTART : 'touchstart',
  EVT_TOUCHEND : 'touchend',
  EVT_TOUCHMOVE : 'touchmove',
  EVT_TOUCHCANCEL : 'touchcancel',

  /**
   * @param {Event} event
   * @return {boolean}
   */
  isMultiTouch : function(event) {
    return ((event.targetTouches && event.targetTouches[1]) ||
      (event.touches && event.touches[1]) ||
      (event.changedTouches && event.changedTouches[1])
      ) ? true : false;
  },

  /**
   * @param {Event} event
   * @return {Object} The (x, y) coordinate of the touch event relative to the
   *         page.
   */
  getTouchPageCoord : function(event) {
    var touch = TouchHelper.getTouches(event)[0];
    return {
      x: touch.pageX,
      y: touch.pageY
    };
  },

  /**
   * @param {Event} event The event.
   * @return {Array.<Event>} A list of native DOM events.
   */
  getTouches : function(event) {
    var results;

    if (!useTouch) {
      readonlyTouchEvents.length = 0;
      readonlyTouchEvents[0] = event;
      return readonlyTouchEvents;
    }

    if (event.targetTouches && event.targetTouches[0]) {
      results = event.targetTouches;
    } else if (event.touches && event.touches[0]) {
      results = event.touches;
    } else if (event.changedTouches && event.changedTouches[0]) {
      results = event.changedTouches;
    } else {
      readonlyTouchEvents.length = 0;
      readonlyTouchEvents[0] = event;
      return readonlyTouchEvents;
    }
    return results;
  }
};


if (!useTouch) {
  Class.mixin(TouchHelper, {
    EVT_TOUCHSTART : 'mousedown',
    EVT_TOUCHEND : 'mouseup',
    EVT_TOUCHMOVE : 'mousemove',
    EVT_TOUCHCANCEL : 'mouseup'
  });
}

exports.TouchHelper = TouchHelper;