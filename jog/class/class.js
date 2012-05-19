/**
 * @fileOverview Klass (a.k.a Class) utilities.
 * @author Hedger Wang
 */

/**
 * @type {number}
 */
var classID = 0;

var Class = {
  /**
   * @param {Function=} superClass
   * @param {Object=} config
   */
  create: function(superClass, config) {
    var newClass = function() {
      if (superClass) {
        superClass.apply(this, arguments);
      }

      var main = this['_main_' + newClass._classID];
      if (main) {
        main.apply(this, arguments);
      }
    };

    if (superClass) {
      Class._extend(newClass, superClass);
    } else {
      newClass.prototype.constructor = newClass;
    }

    newClass._classID = classID++;

    if (config) {
      var newClassPrototype = newClass.prototype;
      for (var key in config) {
        var thing = config[key];
        if (key === 'main') {
          delete config[key];
          // TODO(hedger): Better way to make ClassID more readable.
          key = '_main_' + newClass._classID;
        }

        if (__DEV__) {
          if (superClass &&
            key.charAt(0) === '_' &&
            key in superClass.prototype) {
            throw new Error('override private member');
          }

          if (thing && typeof thing === 'object') {
            throw new Error('prototype member should not be an object');
          }
        }

        newClassPrototype[key] = thing;
      }
    }

    return newClass;
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

exports.Class = Class;
