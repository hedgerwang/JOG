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

  /**
   * @type {Element}
   * @private
   */
  this._logsEl = document.createElement('div');
  this._logsEl.style.cssText = 'font:12px/140%  Monaco, monospace;';
}

/**
 *
 * @param {string} description
 * @param {Function} fn
 */
TestCase.prototype.test = function(description, fn) {
  if (document.body) {
    if (!this._logsEl.parentNode) {
      document.body.appendChild(this._logsEl);
    }
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
    this._log(label);
    fn();
  } catch(error) {
    this._logError(label, error.message, error);
    throw error;
  }
  return this;
};


/**
 * @param {*...} var_obj
 */
TestCase.prototype._log = function(var_obj) {
  debugLog.apply(null, arguments);
  this._logToPage(true, arguments);
};


/**
 * @param {*...} var_obj
 */
TestCase.prototype._logError = function(var_obj) {
  debugError.apply(null, arguments);
  this._logToPage(false, arguments);
};

/**
 * @param {boolean} success
 * @param {Array.<*>} objs
 */
TestCase.prototype._logToPage = function(success, objs) {
  var msg = Array.prototype.slice.call(objs, 0).join(', ');
  var el = document.createElement('div');
  el.appendChild(document.createTextNode(msg));
  el.style.cssText = 'padding:5px; margin:1px;';
  el.style.background = success ? '#00ff00' : '#ff99ff'
  this._logsEl.appendChild(el);
};

exports.TestCase = TestCase;
