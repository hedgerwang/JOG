/**
 * @fileOverview Events Utilities.
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var Event = require('jog/events/event').Event;
var HashCode = require('jog/hashcode').HashCode;

var hashCodeGetHashCode = HashCode.getHashCode;

// For perf reason, we should re-use the event singleton.
var staticReadOnlyEvent = new Event();

var EventTarget = Class.create(null, {
  /**
   * @type {Object}
   * @private
   */
  _eventTargetHandlers: null,

  /**
   * @param {string} type
   * @param {EventListener} listener
   * @param {boolean=} opt_capture
   */
  addEventListener : function(type, listener, opt_capture) {
    var capture = !!opt_capture;
    var key = this._getKey(type, listener, capture);

    if (!this._eventTargetHandlers) {
      this._eventTargetHandlers = {};
    }

    if (this._eventTargetHandlers[key]) {
      // Already added.
      return;
    }
    this._eventTargetHandlers[key] = {
      type: type,
      listener: listener,
      capture: capture
    };
  },

  /**
   * @param {string} type
   * @param {EventListener} listener
   * @param {boolean=} opt_capture
   */
  removeEventListener : function(type, listener, opt_capture) {
    var capture = !!opt_capture;
    var key = this._getKey(type, listener, capture);
    delete this._eventTargetHandlers[key];
  },

  /**
   * @param {string} type
   * @param {Object=} opt_data
   * @param {boolean=} opt_bubble
   */
  dispatchEvent : function(type, opt_data, opt_bubble) {
    if (this.disposed) {
      return;
    }
    staticReadOnlyEvent.type = type;
    staticReadOnlyEvent.target = this;
    staticReadOnlyEvent.data = opt_data ? opt_data : null;
    staticReadOnlyEvent.bubbles = opt_bubble;

    for (var key in this._eventTargetHandlers) {
      var handler = this._eventTargetHandlers[key];
      if (handler.type === type) {
        var listener = handler.listener;
        if (typeof listener === 'function') {
          listener.call(this, staticReadOnlyEvent);
        } else {
          listener.handleEvent.call(listener, staticReadOnlyEvent);
        }
      }
    }
    staticReadOnlyEvent.clear();
  },

  /**
   * @param {string} type
   * @param {EventListener} listener
   * @param {boolean} capture
   * @private
   * @return {string}
   */
  _getKey : function(type, listener, capture) {
    return [
      type,
      hashCodeGetHashCode(listener),
      hashCodeGetHashCode(capture)
    ].join('_');
  }
});

exports.EventTarget = EventTarget;