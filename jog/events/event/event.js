var Class = require('jog/class').Class;

var Functions = require('jog/functions').Functions;

var Event = Class.create(null, {

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
