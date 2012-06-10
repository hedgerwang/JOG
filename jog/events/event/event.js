var Class = require('jog/class').Class;
var Functions = require('jog/functions').Functions;

var Event = Class.create(null, {

  _readonly: true,

  defaultPrevented: false,

  type: null,

  target: null,

  data: null,

  currentTarget: null,

  bubbles: false,

  clear : function() {
    for (var key in this) {
      delete this[key];
    }
  },

  stopPropagation: function() {
    this.bubbles = false;
  },

  preventDefault: function() {
    this.defaultPrevented = true;
  }
});

exports.Event = Event;
