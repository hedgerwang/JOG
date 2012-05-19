var Class = require('jog/class').Class;
var Disposable = require('jog/disposable').Disposable;
var Functions = require('jog/functions').Functions;

var Event = Class.create(Disposable, {

  _readonly: true,

  _prevented: false,

  type: null,

  target: null,

  data: null,

  clear : function() {
    for (var key in this) {
      delete this[key];
    }
  },

  stopPropagation: Functions.EMPTY,

  preventDefault: function() {
    this._prevented = true;
  }
});

exports.Event = Event;
