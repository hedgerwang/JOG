/**
 * @fileOverview Klass (a.k.a Class) utilities.
 * @author Hedger Wang
 */

var Functions = {
  EMPTY: function() {
//    if (__DEV__) {
//      debugLog('empty function called', arguments.callee.caller);
//    }
  },

  PREVENT_DEFAULT: function(evt) {
    evt && evt.preventDefault();
  },

  VALUE_TRUE: function() {
    return true;
  }
};

exports.Functions = Functions;