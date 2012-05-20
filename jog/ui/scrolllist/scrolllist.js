/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var ScrollList = Class.create(BaseUI, {
  /** @override */
  createNode: function() {
    var node = dom.createElement('div', {
      className: cssx('jog-ui-scrolllist')
    });
    return node;
  }
});


exports.ScrollList = ScrollList;