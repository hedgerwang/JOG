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
        return ':empty';

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
      var key = '__auto_hash_code__';
      if (!obj.hasOwnProperty(key)) {
        var value = HashCode.nextHashCode();
        if (Object.defineProperty) {
          Object.defineProperty(
            obj,
            key,
            {
              value : value ,
              writable : false,
              enumerable : false,
              configurable : false
            }
          );
        } else {
          obj[key] = value;
        }
        return value;
      } else {
        return obj[key];
      }

    case 'string':
      return ':str-' + obj;

    case 'number':
      return isNaN(obj) ? ':nan' : ':number-' + obj;

    case 'boolean':
      return ':true';
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
