/**
 * @fileOverview Events
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var Functions = require('jog/functions').Functions;

var Disposable = Class.create({
  members: {
    dispose: function() {
      if (!this._disposed) {
        this.disposeInternal();
        this._disposeAll();
        this._disposed = true;
      }
    },

    disposeInternal: Functions.EMPTY,

    /**
     * @type {boolean}
     * @private
     */
    _disposed: false,

    _disposeAll: function() {
      for (var key in this) {
        delete this[key];
      }
    }
  }
});


exports.Disposable = Disposable;