/**
 * @fileOverview ID
 * @author Hedger Wang
 */


var base = 0;
var prefix = 0;

var ID = {
  next: function() {
    base++;
    if (base > Number.MAX_VALUE) {
      base = 0;
      prefix++;
    }
    return '_' + prefix + '_' + (base++).toString(16);
  }
};


exports.ID = ID;
