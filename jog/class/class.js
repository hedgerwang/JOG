/**
 * @fileOverview Klass (a.k.a Class) utilities.
 * @author Hedger Wang
 */

/**
 * @type {number}
 */
var classID = 1;

/**
 * @type {Object}
 */
var defaultClassConfig = {
  dispose: classDispose,
  bind: classBind
};

var Class = {
  /**
   * @param {Function=} superClass
   * @param {Object=} config
   */
  create: function(superClass, config) {
    if (__DEV__) {
      if (superClass && typeof superClass !== 'function') {
        throw new Error('superclass should be function');
      }

      if (config && typeof config !== 'object') {
        throw new Error('class config should be an object');
      }
    }

    var newClass = function() {
      classMain.apply(this, arguments);
    };

    if (superClass) {
      Class._extend(newClass, superClass);
    }

    newClass.prototype.constructor = newClass;
    newClass._superClass = superClass;
    newClass._classID = classID++;

    if (config) {
      if (config.main) {
        config['main_' + newClass._classID] = config.main;
        delete config.main;
      }

      if (config.dispose) {
        config['dispose_' + newClass._classID] = config.dispose;
      }

      config.dispose = classDispose;
      config.bind = classBind;
    } else {
      config = defaultClassConfig;
    }

    Class.mixin(newClass, config);

    if (__DEV__) {
      var els = document.scripts;
      if (els && els.length) {
        newClass._debugSourceURL = els[els.length - 1].src;
      }
    }

    return newClass;
  },

  /**
   * @param {Function} klass
   * @param {Object} config
   */
  mixin: function(klass, config) {
    var proto = klass.prototype;
    for (var key in config) {
      var thing = config[key];

      if (__DEV__) {
        if (key in proto && key.charAt(0) === '_') {
          throw new Error('override private member');
        }
        if (thing && typeof thing === 'object') {
          throw new Error('prototype member should not be an object');
        }
      }

      proto[key] = thing;
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
 * The main() function that calls its internal main_* recursively.
 */
function classMain() {
  var constructor = this.constructor;
  var klass = constructor;
  var klassList = klass._classList;
  var i = 0;

  if (!klassList) {
    klassList = [];

    while (klass) {
      var main = this['main_' + klass._classID];
      if (main) {
        klassList[i] = main;
        i++;
      }
      klass = klass._superClass;
    }
    constructor._classList = klassList;
  }

  var args = arguments;
  if (klassList.length) {
    for (i = klassList.length - 1; i > -1; i--) {
      main = klassList[i];
      main.apply(this, args);
    }
  }
}

/**
 * The dispose() function that calls its internal dispose_* recursively.
 */
function classDispose() {
  if (!this.disposed) {
    var klass = this.constructor;
    while (klass) {
      var dispose = this['dispose_' + klass._classID];
      dispose && dispose.call(this);
      klass = klass._superClass;
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
  var that = this;
  return function() {
    if (!that.disposed) {
      return fn.apply(that, arguments);
    }
  };
}

exports.Class = Class;