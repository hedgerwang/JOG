/**
 * @fileOverview Events
 * @author Hedger Wang
 */

var Class = require('/jog/class').Class;
var Disposable = require('/jog/disposable').Disposable;
var HashCode = require('/jog/hashcode').HashCode;
var hashCodeGetHashCode = HashCode.getHashCode;

/**
 * @constructor
 */
function Events() {
  this.superClass.call(this);
  /**
   * @type {Object}
   * @private
   */
  this._eventsHandlers = {};
}
Class.extend(Events, Disposable);

/**
 * @override
 */
Events.prototype.disposeInternal = function() {
  this.unlistenAll();
  delete this._eventsHandlers;
};

/**
 * @param {Event} event
 * @this {Object}
 * @private
 */
Events._handleEvent = function(event) {
  var args = [event];
  if (this.args) {
    args = args.concat(this.args);
  }
  this.listener.apply(this.context || this.target, args);
};

/**
 * @param {EventTarget|Node} target
 * @param {string} type
 * @param {Function} listener
 * @param {Object=} opt_context
 * @param {boolean=} opt_capture
 * @param {...*} opt_more
 * @return {string}
 */
Events.prototype.listen = function(target, type, listener, opt_context,
                                   opt_capture, opt_more) {
  var context = opt_context || null;
  var capture = !!opt_capture;
  var args = typeof opt_more === 'undefined' ?
    null :
    Array.prototype.slice.call(arguments, 5);

  var key = this._getKey(target, type, listener, context, capture, args);
  if (this._eventsHandlers[key]) {
    return key;
  }

  var handler = {
    target: target,
    type: type,
    listener: listener,
    context: opt_context,
    args: args,
    capture: capture,
    handleEvent: Events._handleEvent
  };
  this._eventsHandlers[key] = handler;

  // TODO(hedger): This won't work in IE since IE does not support interface
  // handleEvent & addEventListener.
  target.addEventListener(type, handler, capture);
  return key;
};


/**
 * @param {EventTarget|Node} target
 * @param {string} type
 * @param {Function} listener
 * @param {Object=} opt_context
 * @param {boolean=} opt_capture
 * @param {...*} opt_more
 */
Events.prototype.unlisten = function(target, type, listener, opt_context,
                                     opt_capture, opt_more) {
  var context = opt_context || null;
  var capture = !!opt_capture;
  // if opt_more is provided, there is no easy way to getHashCode from args
  // since it's a new Array. For perf sake, use a dummy object for args instead.
  var args = typeof opt_more === 'undefined' ? null : {};
  var key = this._getKey(target, type, listener, context, capture, args);
  this.unlistenByKey(key);
};

/**
 * @param {string} key
 */
Events.prototype.unlistenByKey = function(key) {
  var handler = this._eventsHandlers[key];
  if (handler) {
    // TODO(hedger): This won't work in IE since IE does not support interface
    // handleEvent & addEventListener.
    handler.target.removeEventListener(handler.type, handler, handler.capture);
    delete this._eventsHandlers[key];
  }
};

/**
 * unlisten All
 */
Events.prototype.unlistenAll = function() {
  for (var key in this._eventsHandlers) {
    this.unlistenByKey(key);
  }
};

/**
 * @param {EventTarget|Node} target
 * @param {string} type
 * @param {Function} listener
 * @param {Object} context
 * @param {boolean} capture
 * @param {Array} args
 * @private
 * @return {string}
 */
Events.prototype._getKey = function(target, type, listener, context, capture,
                                    args) {
  return [
    type,
    hashCodeGetHashCode(target),
    hashCodeGetHashCode(listener),
    hashCodeGetHashCode(context),
    hashCodeGetHashCode(capture),
    hashCodeGetHashCode(args)
  ].join('_');
};

exports.Events = Events;