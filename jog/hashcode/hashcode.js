/**
 * @fileOverview HashCode utilities.
 * @author Hedger Wang
 */

var ID = require('jog/id').ID;

/**
 * @const {Object}
 */
var HashCode = {

  /**
   * Returns a hash code value for the object. If two variables are equal
   * (e.g. varFoo === varBar), their hashCode must be the same. Note that
   * variables of different types are not equal (e.g. "123" !== 123).
   * Also, if the variable is NaN (isNaN(obj) === true), returns the same
   * hashCode for NaN.
   *
   * @param {*} obj The object to get the hashCode from.
   * @return {string} the hashCode found.
   */
  getHashCode : function(obj) {
    if (obj === undefined) {
      return 'hash_undefined';
    }

    if (obj === null) {
      return 'hash_null';
    }

    if (obj === '') {
      return 'hash_empty_string';
    }

    switch (typeof obj) {
      case 'function':
      // fall-through.
      case 'object':
        // DOM Node, Array, Date, Object....etc.
        var key = '__auto__hash__';
        if (obj.hasOwnProperty(key)) {
          return obj[key];
        }

        var hashCode = ID.next();
        if (Object.defineProperty) {
          // Make the property "__auto__hash__" not enumerable
          // and writable. So it won't be cloned or show up in
          // for(x in in) loop.
          Object.defineProperty(
            obj,
            key,
            {
              value : hashCode,
              writable : false,
              enumerable : false,
              configurable : false
            });
        } else {
          // Add an expando to the object.
          // Note that the hashCode may not be universally unique if the
          // a object is cloned from the object which already have a hashCode
          // In mobile, browsers (Safari and Chrome)do support
          // Object.defineProperty so we're less worried about the
          // case that two objects have the same hashCode.
          obj[key] = hashCode;
        }
        return hashCode;

      case 'boolean':
        return obj ? 'hash_boolean_true' : 'hash_boolean_false';

      case 'string':
        return 'hash_string_' + obj;

      case 'number':
        return isNaN(obj) ? 'hash_nan' : 'hash_number_' + obj;

      default:
        // should never be here.
        throw new Error('Unknown Hash object:' + (typeof obj));
    }
  }
};

exports.HashCode = HashCode;
