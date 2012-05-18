/**
 * @fileOverview ID
 * @author Hedger Wang
 */


var base = 0;
var prefix = 0;

var ID = {
  /**
   * @param {string=} opt_prefix
   */
  next: function(opt_prefix) {
    base++;
    if (base > Number.MAX_VALUE) {
      base = 0;
      prefix++;
    }
    opt_prefix = opt_prefix || '';
    return opt_prefix + '_' + prefix + '_' + (base++).toString(16);
  }
};


exports.ID = ID;
