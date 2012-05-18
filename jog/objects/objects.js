/**
 * @fileOverview
 * @author Hedger Wang
 */

var objects = {
  /**
   * @param {string} name The fully qualified name.
   * @param {Object=} opt_obj The object within which to look; default is global
   * @return {*} The value (object or primitive) or, if not found, null.
   */
  getValueByName: function(name, opt_obj) {
    var parts = name.split('.');
    var cur = opt_obj || window;
    for (var part; part = parts.shift();) {
      if (cur[part]) {
        cur = cur[part];
      } else {
        return null;
      }
    }
    return cur;
  }
};

exports.objects = objects;