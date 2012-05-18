/**
 * @fileOverview Klass (a.k.a Class) utilities.
 * @author Hedger Wang
 */


var Class = {
  /**
   * @param {Function} childClass
   * @param {Function} parentClass
   */
  extend : function(childClass, parentClass) {
    /**
     * @private
     */
    childClass._superClass = parentClass;

    // IE-Compatible Implementation.
    var midClass = function() {
    };
    midClass.prototype = parentClass.prototype;
    childClass.prototype = new midClass();
    childClass.prototype.constructor = childClass;
    childClass.prototype.superPrototype = parentClass.prototype;
  },

  /**
   * @return {Function}
   * @param {Object} object
   */
  create : function(object) {
    var childClass = object.construct || function() {
    };

    var parentClass = object.extend;

    if (parentClass) {
      Class.extend(childClass, parentClass);
    }

    var key;
    var members = object.members;
    if (members) {
      var classPrototype = childClass.prototype;
      for (key in members) {
        // TODO(hedgder): Check whether private property is overriden.
        if (__DEV__) {
          if (key in classPrototype && key.charAt(0) == '_') {
            throw new Error('private member should not be overriden');
          }
        }
        classPrototype[key] = members[key];
      }
    }

    var statics = object.statics;
    if (statics) {
      for (key in statics) {
        childClass[key] = statics[key];
      }
    }

    return childClass;
  }
};

exports.Class = Class;
