/**
 * @fileOverview Testing utilities.
 * @author Hedger Wang
 */

/**
 * @param {string} description
 * @constructor
 */
function TestCase(description) {
  /**
   * @type {string}
   * @private
   */
  this._description = 'TestCase:' + description;
}

/**
 *
 * @param {string} description
 * @param {Function} fn
 */
TestCase.prototype.test = function(description, fn) {
  if (document.body) {
    this._test(description, fn);
  } else {
    var that = this;
    setTimeout(function() {
      that._test(description, fn);
    }, 500);
  }
  return this;
};


/**
 *
 * @param {string} description
 * @param {Function} fn
 */
TestCase.prototype._test = function(description, fn) {
  var label = this._description + '#' + description;
  try {
    debugLog(label);
    fn();
  } catch(error) {
    debugError(label, error.message, error);
    throw error;
  }
  return this;
};


exports.TestCase = TestCase;
