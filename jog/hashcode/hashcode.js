/**
 * @fileOverview HashCode utilities.
 * @author Hedger Wang
 */


/**
 * @const {Object}
 */
var HashCode = {};

var base = 0;
var prefix = 0;

/**
 * @param {*} obj
 * @return {string}
 */
HashCode.getHashCode = function(obj) {
  if (!obj) {
    switch (obj) {
      case '':
        return ':empty_str';

      case undefined:
        return ':undefined';

      case 0:
        return ':zero';

      case null:
        return ':null';

      case false:
        return ':false';

      default:
        throw new Error('unknown HashCode source');
    }
  }

  switch (typeof obj) {
    case 'object':
      var key = '__JS_HASH_CODE__';
      if (!obj[key]) {
        obj[key] = HashCode.nextHashCode();
      }
      return obj[key];

    case 'string':
      return obj;

    case 'number':
    case 'boolean':
      return '' + obj;
  }
};

/**
 * @return {string}
 */
HashCode.nextHashCode = function() {
  base++;
  if (base > Number.MAX_VALUE) {
    base = 0;
    prefix++;
  }
  return '_' + prefix + '_' + (base++).toString(16);
};

exports.HashCode = HashCode;

