/**
 * @fileOverview Assertion Utilities.
 * @author Hedger Wang
 */

/**
 * Namespace
 * @const {Object}
 */
var asserts = {};

/**
 * @param {*} val
 * @param {string=} opt_description
 */
asserts.assertTrue = function(val, opt_description) {
  opt_description = opt_description || '';
  if (val !== true) {
    throw new Error(opt_description + ': ' + 'Expect true but get ' + val);
  }
};

/**
 * @param {*} val
 * @param {string=} opt_description
 */
asserts.notNull = function(val, opt_description) {
  opt_description = opt_description || '';
  if (val == null) {
    throw new Error(opt_description + ': ' + 'Expect not null but get ' + val);
  }
};


/**
 * @param {*} val1
 * @param {*} val2
 * @param {string=} opt_description
 */
asserts.equal = function(val1, val2, opt_description) {
  opt_description = opt_description || '';
  if (val1 !== val2) {
    throw new Error(
      opt_description + ': ' + 'Expect equals(' + val1 + ',' + val2 + ')'
    );
  }
};


exports.asserts = asserts;