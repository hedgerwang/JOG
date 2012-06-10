/**
 * @fileOverview TouchHelper
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;

var useTouch = 'ontouchstart' in document;
var touchStartCoord = {};
var touchMoveCoord = {};
var touchEndCoord = {};
var touchCancelCoord = {};
var readonlyTouchEvents = [];

var TouchHelper = {
  USE_TOUCH : useTouch,
  EVT_TOUCHSTART : 'touchstart',
  EVT_TOUCHEND : 'touchend',
  EVT_TOUCHMOVE : 'touchmove',
  EVT_TOUCHCANCEL : 'touchcancel',

  /**
   * @param {Event} event
   * @return {Object} The (x, y) coordinate of the touch event relative to the
   *         page.
   */
  getTouchPageCoord : function(event) {
    var touch = TouchHelper.getTouches(event)[0];
    var coord;
    switch (event.type) {
      case TouchHelper.EVT_TOUCHSTART:
        coord = touchStartCoord;
        break;
      case TouchHelper.EVT_TOUCHMOVE:
        coord = touchMoveCoord;
        break;
      case TouchHelper.EVT_TOUCHCANCEL:
        coord = touchCancelCoord;
        break;
      case TouchHelper.EVT_TOUCHEND:
        coord = touchEndCoord;
        break;
      default:
        if (__DEV__) {
          throw new Error('Unknown touch event type = ' + event.type);
        }
        coord = {};
    }

    coord.x = touch.pageX;
    coord.y = touch.pageY;
    return coord;
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