/**
 * @fileOverview Klass (a.k.a Class) utilities.
 * @author Hedger Wang
 */

var Functions = {
  EMPTY: function() {
    if (__DEV__) {
      debugLog('empty function called', arguments);
    }
  }
};

exports.Functions = Functions;