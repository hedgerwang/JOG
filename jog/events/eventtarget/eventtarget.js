/**
 * @fileOverview Events Utilities.
 * @author Hedger Wang
 */

var Class = require('/jog/class').Class;
var HashCode = require('/jog/hashcode').HashCode;
var hashCodeGetHashCode = HashCode.getHashCode;


var EventTarget = Class.create({
  members: {

    /**
     * @type {EventTarget}
     * @private
     */
    _parentEventTarget : null,

    /**
     * @type {Object}
     * @private
     */
    _eventTargetHandlers: null,

// TODO(hedger): Bubbling?
//    /**
//     * @return {EventTarget}
//     */
//    getParentEventTarget : function() {
//      return null;
//    },
//
//    /**
//     * @parm {EventTarget} target
//     */
//    setParentEventTarget : function(target) {
//      this._parentEventTarget = target;
//    },


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
     * @param {boolean=} opt_capture
     */
    dispatchEvent : function(type, opt_data, opt_capture) {
      var event = {
        type: type,
        target: this,
        data: opt_data ? opt_data : null,
        capture: !!opt_capture
      };
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
      // TODO(hedger): Implement event bubbling.
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
  }
});

exports.EventTarget = EventTarget;