/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var Scene = Class.create({
  extend: BaseUI,

  main:  function() {
    BaseUI.call(this);
  },

  members: {
    /** @override */
    createNode: function() {
      var node = dom.createElement('div', {
        className: cssx('jog-ui-scene')
      });
      return node;
    }
  }
});


exports.Scene = Scene;