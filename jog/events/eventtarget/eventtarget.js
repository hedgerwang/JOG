/**
 * @fileOverview Events Utilities.
 * @author Hedger Wang
 */

var HashCode = require('/jog/hashcode').HashCode;
var hashCodeGetHashCode = HashCode.getHashCode;


/**
 * @constructor
 */
function EventTarget() {
  /**
   * @type {Object}
   * @private
   */
  this._eventTargetHandlers = {};

  /**
   * @type {EventTarget}
   * @private
   */
  this._parentEventTarget = null;
}

/**
 * @return {EventTarget}
 */
EventTarget.prototype.getParentEventTarget = function() {
  return null;
};

/**
 * @parm {EventTarget} target
 */
EventTarget.prototype.setParentEventTarget = function(target) {
  this._parentEventTarget = target;
};


/**
 * @param {string} type
 * @param {EventListener} listener
 * @param {boolean=} opt_capture
 */
EventTarget.prototype.addEventListener = function(type, listener, opt_capture) {
  var capture = !!opt_capture;
  var key = this._getKey(type, listener, capture);

  if (this._eventTargetHandlers[key]) {
    // Already added.
    return;
  }
  this._eventTargetHandlers[key] = {
    type: type,
    listener: listener,
    capture: capture
  };
};

/**
 * @param {string} type
 * @param {EventListener} listener
 * @param {boolean=} opt_capture
 */
EventTarget.prototype.removeEventListener = function(type, listener,
                                                     opt_capture) {
  var capture = !!opt_capture;
  var key = this._getKey(type, listener, capture);
  delete this._eventTargetHandlers[key];
};

/**
 * @param {string} type
 * @param {Object=} opt_data
 * @param {boolean=} opt_capture
 */
EventTarget.prototype.dispatchEvent = function(type, opt_data, opt_capture) {
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
};

/**
 * @param {string} type
 * @param {EventListener} listener
 * @param {boolean} capture
 * @private
 * @return {string}
 */
EventTarget.prototype._getKey = function(type, listener, capture) {
  return [
    type,
    hashCodeGetHashCode(listener),
    hashCodeGetHashCode(capture)
  ].join('_');
};

exports.EventTarget = EventTarget;