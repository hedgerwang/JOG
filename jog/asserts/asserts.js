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
  assertTrue : function(val, opt_description) {
    opt_description = opt_description || '';
    if (val !== true) {
      throw new Error(opt_description + ': ' + 'Expect true but get ' + val);
    }
  },

  /**
   * @param {*} val
   * @param {string=} opt_description
   */
  assertFalse : function(val, opt_description) {
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