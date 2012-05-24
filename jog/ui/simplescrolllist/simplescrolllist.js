/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var Chunk = require('jog/ui/scrolllist/chunk').Chunk;
var Scrollable = require('jog/behavior/scrollable').Scrollable;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;
var lang = require('jog/lang').lang;


var SimpleScrollList = Class.create(BaseUI, {
  /** @override */
  main: function() {

  },

  /** @override */
  createNode: function() {
    var node = dom.createElement('div', cssx('jog-ui-simplescrolllist'));
    return node;
  },

  /** @override */
  onDocumentReady: function() {
  },

  /** @override */
  dispose: function() {
  },

  /**
   * @param {Element|BaseUI|string} content
   */
  addContent: function(content) {

  }
});


exports.SimpleScrollList = SimpleScrollList;






