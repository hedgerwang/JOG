/**
 * @fileOverview
 * @author Hedger Wang
 */

var objects = {
  /**
   * @param {string} name The fully qualified name.
   * @param {Object=} opt_obj The object within which to look; default is global
   * @param {*=} opt_default_Value
   * @return {*} The value (object or primitive) or, if not found, null.
   */
  getValueByName: function(name, opt_obj, opt_default_Value) {
    if (opt_obj === null) {
      return opt_obj;
    }

    var cur = opt_obj === undefined ? window : opt_obj;

    if (name.indexOf('.') === -1) {
      return cur[name];
    }

    var parts = name.split('.');

    for (var part; part = parts.shift();) {
      if (cur[part]) {
        cur = cur[part];
      } else {
        return opt_default_Value === undefined ? null : opt_default_Value;
      }
    }
    return cur;
  }
};

exports.objects = objects;