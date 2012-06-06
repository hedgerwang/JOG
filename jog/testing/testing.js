/**
 * @fileOverview Testing utilities.
 * @author Hedger Wang
 */

/**
 * @param {string} description
 * @constructor
 */
function TestCase(description) {
  this._testsQueue = [];

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

  var that = this;
  this._testsTimer = setInterval(function() {
    that._processTests();
  }, 100);
}

/**
 *
 * @param {string} description
 * @param {Function} fn
 */
TestCase.prototype.demo = function(description, fn) {
  this._testsQueue.push({
    description: description,
    fn: fn,
    demo: true
  });
  return this;
};


/**
 *
 * @param {string} description
 * @param {Function} fn
 */
TestCase.prototype.test = function(description, fn) {
  this._testsQueue.push({
    description: description,
    fn: fn
  });
  return this;
};

/**
 * @param {number} ms
 * @param {string=} description
 */
TestCase.prototype.wait = function(ms, description) {
  this._testsQueue.push({
    description: description || '',
    waitTime: ms
  });
  return this;
};


/**
 * @type {Array}
 */
TestCase.prototype._testsQueue = null;

/**
 * @type {number}
 */
TestCase.prototype._testsTimer = 0;


TestCase.prototype._processTests = function() {
  if (!document.body) {
    return;
  }

  if (!this._logsEl.parentNode) {
    document.body.appendChild(this._logsEl);
  }

  var now = Date.now();

  if (this._waitStopTime && now < this._waitStopTime) {
    return;
  } else {
    delete this._waitStopTime;
  }

  var test = this._testsQueue.shift();

  if (!test) {
    if (this._tested) {
      this._log('Tests finished');
    }
    clearInterval(this._testsTimer);
    delete this._testsTimer;
    return;
  }

  if (test.demo) {
    test.fn(document.body);
    return;
  }

  if (typeof test.waitTime === 'number') {
    this._log('Wait ' + test.description + ' for ' + test.waitTime);
    this._waitStopTime = Date.now() + test.waitTime;
    return;
  }

  this._test(test.description, test.fn);
};


/**
 *
 * @param {string} description
 * @param {Function} fn
 */
TestCase.prototype._test = function(description, fn) {
  this._tested = true;
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
 * @type {boolean}
 */
TestCase.prototype._tested = false;

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