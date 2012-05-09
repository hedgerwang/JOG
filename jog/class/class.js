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
    childClass.superClass = parentClass;

    // IE-Compatible Implementation.
    //  var midClass = function() {
    //  };
    //  midClass.prototype = parentClass.prototype;
    //  childClass.prototype = new midClass();
    //  childClass.prototype.superPrototype = parentClass.prototype;

    // Modern Style Implementation.
    var superPrototype = parentClass.prototype;
    childClass.prototype = {
      __proto__ : superPrototype,
      superClass: parentClass,
      superPrototype : superPrototype,
      constructor: childClass
    };
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
