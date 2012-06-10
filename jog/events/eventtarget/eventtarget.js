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
var dispatchingStaticReadOnlyEvent = false;

var EventTarget = Class.create(null, {
  /**
   * @type {Object}
   * @private
   */
  _eventTargetHandlers: null,

  /**
   * @return {EventTarget}
   */
  getBubbleTarget: function() {
    return null;
  },

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
    if (this._eventTargetHandlers) {
      var capture = !!opt_capture;
      var key = this._getKey(type, listener, capture);
      delete this._eventTargetHandlers[key];
    }
  },

  /**
   * @param {string} type
   * @param {Object=} opt_data
   * @param {boolean=} opt_bubble
   * @param {Object=} opt_target
   */
  dispatchEvent : function(type, opt_data, opt_bubble, opt_target) {
    if (this.disposed) {
      return;
    }

    var event;
    if (dispatchingStaticReadOnlyEvent) {
      // Developer may have called dispatchEvent caused by another dispatchEvent
      // call. So we need to create more events to handle this case.
      event = new Event();
    } else {
      dispatchingStaticReadOnlyEvent = true;
      event = staticReadOnlyEvent;
    }

    event.type = type;
    event.target = opt_target || this;
    event.currentTarget = this;
    event.data = opt_data ? opt_data : null;
    event.bubbles = opt_bubble;
    this._dispatchEvent(event);

    if (dispatchingStaticReadOnlyEvent) {
      // Just clear it so we can reuse it.
      event.clear();
      dispatchingStaticReadOnlyEvent = false;
    } else {
      event.dispose();
    }
  },

  /**
   * @param {Event} event
   */
  _dispatchEvent: function(event) {
    var type = event.type;
    for (var key in this._eventTargetHandlers) {
      var handler = this._eventTargetHandlers[key];
      if (handler.type === type) {
        var listener = handler.listener;
        if (typeof listener === 'function') {
          listener.call(this, event);
        } else {
          listener.handleEvent.call(listener, event);
        }
      }
    }

    if (event.bubbles) {
      var bubbleTarget = this.getBubbleTarget();
      if (bubbleTarget) {
        bubbleTarget._dispatchEvent(event);
      }
    }
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