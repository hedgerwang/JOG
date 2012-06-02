/**
 * @fileOverview Assertion Utilities.
 * @author Hedger Wang
 */

/**
 * Namespace
 * @const {Object}
 */
var asserts = {
  /**
   * @param {*} val
   * @param {string=} opt_description
   */
  isTrue : function(val, opt_description) {
    opt_description = opt_description || '';
    if (val !== true) {
      throw new Error(opt_description + ': ' + 'Expect true but get ' + val);
    }
  },

  /**
   * @param {*} val
   * @param {string=} opt_description
   */
  isFalse : function(val, opt_description) {
    opt_description = opt_description || '';
    if (val !== false) {
      throw new Error(opt_description + ': ' + 'Expect false but get ' + val);
    }
  },

  /**
   * @param {*} val
   * @param {string=} opt_description
   */
  notNull : function(val, opt_description) {
    opt_description = opt_description || '';
    if (val === null) {
      throw new Error(opt_description + ': ' + 'Expect not null not ' + val);
    }
  },

  /**
   * @param {*} val
   * @param {string=} opt_description
   */
  notEmpty : function(val, opt_description) {
    opt_description = opt_description || '';
    if (val === null || val === '' || val === undefined || val.length === 0) {
      throw new Error(opt_description + ': ' + 'Expect not empty not ' + val);
    }
  },

  /**
   * @param {*} val1
   * @param {*} val2
   * @param {string=} opt_description
   */
  equal : function(val1, val2, opt_description) {
    opt_description = opt_description || '';
    if (val1 !== val2) {
      throw new Error(
        opt_description + ': ' + 'Expect equals(' + val1 + ',' + val2 + ')'
      );
    }
  },

  /**
   * @param {Object} obj1
   * @param {Object} obj2
   * @param {string=} opt_description
   */
  objectEqual: function(obj1, obj2, opt_description) {
    if (obj1 === obj2) {
      return;
    }

    opt_description = opt_description || '';

    for (var key in obj1) {
      if (obj1[key] !== obj2[key]) {
        if (typeof obj1[key] && obj1[key]) {
          asserts.objectEqual(obj1[key], obj2[key]);
        } else {
          throw new Error(
            opt_description + ': ' + 'Expect objects equals at ' + key
          );
        }
      }
    }

    for (var key in obj2) {
      if (obj1[key] !== obj2[key]) {
        if (typeof obj1[key] && obj1[key]) {
          asserts.objectEqual(obj1[key], obj2[key]);
        } else {
          throw new Error(
            opt_description + ': ' + 'Expect objects equals at ' + key
          );
        }
      }
    }
  },

  arrayEqual:function(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      throw new Error('array length not equal.' +
        arr1.join(',') + ';' +
        arr2.join(','));
    }
    arr1.forEach(function(item, i) {
      if (arr2[i] !== item) {
        var msg = 'array not equal:' + arr1.join(',') + ' ; ' + arr2.join(',');
        throw new Error(msg);
      }
    });
  },

  /**
   * @param {Function} fn
   * @param {Object} opt_context
   * @param {*...} var_args
   */
  throws: function(fn, opt_context, var_args) {
    try {
      if (arguments.length > 2) {
        fn.apply(opt_context, Array.prototype.slice.call(arguments, 2));
      } else if (arguments.length > 1) {
        fn.call(opt_context);
      } else {
        fn();
      }
    } catch(ex) {
      return;
    }
    throw new Error('expected error');
  },

  /**
   * @param {*} val1
   * @param {*} val2
   * @param {string=} opt_description
   */
  notEqual : function(val1, val2, opt_description) {
    opt_description = opt_description || '';
    if (val1 === val2) {
      throw new Error(
        opt_description + ': ' + 'Expect not equals(' + val1 + ',' + val2 + ')'
      );
    }
  }
};

exports.asserts = asserts;