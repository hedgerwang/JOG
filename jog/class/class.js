/**
 * @fileOverview Klass (a.k.a Class) utilities.
 * @author Hedger Wang
 */

var lang = require('jog/lang').lang;

/**
 * @type {number}
 */
var classID = 1;

/**
 * @type {Object}
 */
var defaultClassConfig = {
  dispose: classDispose,
  bind: classBind,
  callLater: classCallLater,
  callAfter: classCallAfter
};

var Class = {
  /**
   * Create a Class that implements these methods:
   * {
   *   main: function(){},
   *   dispose: function(){},
   *   bind: function(){}
   * }
   * @param {Function=} superClass
   * @param {Object=} prototype
   */
  create: function(superClass, prototype) {
    if (__DEV__) {
      if (superClass && typeof superClass !== 'function') {
        throw new Error('superclass should be function');
      }

      if (prototype && typeof prototype !== 'object') {
        throw new Error('class config should be an object');
      }
    }

    var newClass = function() {
      var klass = arguments.callee;
      var superKlass = klass._superClass;
      if (superKlass) {
        superKlass.apply(this, arguments);
      }
      var main = this[klass._mainID];
      main && main.apply(this, arguments);
    };

    if (superClass) {
      Class._extend(newClass, superClass);
    }

    newClass.prototype.constructor = newClass;
    newClass._superClass = superClass;
    newClass._mainID = 'main_' + classID++;
    newClass._disposeID = 'dispose_' + classID++;

    if (prototype) {
      if (prototype.main) {
        prototype[newClass._mainID] = prototype.main;
        delete prototype.main;
      }

      if (prototype.dispose) {
        prototype[newClass._disposeID] = prototype.dispose;
      }

      prototype.callAfter = classCallAfter;
      prototype.callLater = classCallLater;
      prototype.dispose = classDispose;
      prototype.bind = classBind;
    } else {
      prototype = defaultClassConfig;
    }

    Class.mixin(newClass.prototype, prototype);

    if (__DEV__) {
      var els = document.scripts;
      if (els && els.length) {
        newClass._debugSourceURL = els[els.length - 1].src;
      }
    }

    return newClass;
  },

  /**
   * @param {Object} obj
   */
  dispose: function(obj) {
    if (obj && obj.dispose) {
      obj.dispose();
    }
  },

  /**
   * @param {Object} target
   * @param {Object} source
   */
  mixin: function(target, source) {
    for (var key in source) {
      var thing = source[key];

      if (__DEV__) {
        if (key in target && key.charAt(0) === '_') {
          throw new Error('override private member = ' + key);
        }
        if (thing && typeof thing === 'object') {
          throw new Error('prototype member should not be an object');
        }
      }

      target[key] = thing;
    }
  },

  /**
   * @param {Function} childClass
   * @param {Function} superClass
   */
  _extend : function(childClass, superClass) {
    if (__DEV__) {
      if (childClass._debugSuperClass) {
        throw new Error('no multiple inheritence');
      }
      /**
       * @type {Function}
       */
      childClass._debugSuperClass = superClass;
    }

    // IE-Compatible Implementation.
    var midClass = function() {
    };

    midClass.prototype = superClass.prototype;
    childClass.prototype = new midClass();
    childClass.prototype.constructor = childClass;
  }
};


/**
 * The dispose() function that calls its internal dispose_* recursively.
 */
function classDispose() {
  if (!this.disposed) {
    var klass = this.constructor;
    while (klass) {
      var dispose = this[klass._disposeID];
      dispose && dispose.call(this);
      klass = klass._superClass;
    }

    if (this._callLaterTimers) {
      for (var id in this._callLaterTimers) {
        clearTimeout(id);
      }
    }

    for (var key in this) {
      delete this[key];
    }
  }
  this.disposed = true;
}

/**
 * @param {Function} fn
 * @return {Function}
 */
function classBind(fn) {
  if (fn._bound_by_class) {
    return fn;
  }

  var that = this;
  var fn2 = function() {
    if (!that.disposed) {
      return fn.apply(that, arguments)
    }
  };

  fn2._bound_by_class = true;
  return fn2;
}

/**
 * @param {Function} fn
 * @param {number} delay
 * @return {number}
 */
function classCallLater(fn, delay) {
  var that = this;
  var id;

  if (!that._callLaterTimers) {
    that._callLaterTimers = {};
  }

  var wfn = function() {
    delete that._callLaterTimers[id];
    fn.apply(that, arguments);
    that = null;
    id = null;
  };

  id = setTimeout(wfn, delay);
  that._callLaterTimers[id] = true;
  return id;
}


/**
 *
 * @param {Function} fn
 * @param {number} delay
 */
function classCallAfter(fn, delay) {
  var start = Date.now();
  return this.bind(function() {
    if (!this.disposed) {
      var dt = Date.now() - start;
      if (dt < delay) {
        var args = lang.toArray(arguments);
        var wfn = this.bind(function() {
          fn.apply(this, args);
          fn = null;
          args = null;
        });
        this.callLater(wfn, delay - dt);
      } else {
        fn.apply(this, arguments);
        fn = null;
      }
    }
    start = null;
    delay = null;
  });
}


exports.Class = Class;