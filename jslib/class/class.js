/**
 * @fileOverview Klass (a.k.a Class) utilities.
 * @author Hedger Wang
 */
var Class = {};

/**
 * @param {Function} childClass
 * @param {Function} parentClass
 */
Class.extend = function(childClass, parentClass) {
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
    superPrototype : superPrototype
  };
};

exports.Class = Class;
