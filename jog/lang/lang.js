/**
 * @fileOverview
 * @author Hedger Wang
 */

var lang = {

  /**
   * @param {Object} context
   * @param {Function} fn
   */
  bind: function(context, fn) {
    if (__DEV__) {
      if (!context) {
        throw new Error('bound context is null');
      }

      if (fn._bound_context && fn._bound_context !== context) {
        throw new Error('context already bound');
      }
    }

    if (fn._bound_by_lang) {
      return fn;

    }
    var fn2 = function() {
      return fn.apply(context, arguments)
    };

    fn2._bound_by_lang = true;

    if (__DEV__) {
      fn2._bound_context = context;
    }

    return fn2;
  }
};

exports.lang = lang;
