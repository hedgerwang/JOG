/**
 * @fileOverview
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var MyButton = Class.create(BaseUI, {
  /**
   * @param {string=} text
   * @param {string=} type
   */
  main: function(text, type) {
    this._text = text || 'Button';
    this.type = type || 'submit';
  },


  type: '',

  createNode: function() {
    return dom.createElement('div', cssx('jog-example-mybutton'), this._text);
  },

  onDocumentReady: function() {
    this._reset();
  },

  _reset: function() {
    this.getEvents().unlistenAll();
    this.getEvents().listen(this.getNode(), 'mousedown', this._onMouseDown);
  },

  _onMouseDown: function() {
    dom.addClassName(this.getNode(), cssx('jog-example-mybutton-pressed'));
    this.getEvents().unlistenAll();
    this.getEvents().listen(document, 'mouseup', this._onMouseUp);
  },

  _onMouseUp: function(event) {
    dom.removeClassName(this.getNode(), cssx('jog-example-mybutton-pressed'));
    this._reset();

    if (event.target === this.getNode() ||
      this.getNode().contains(event.target)) {
      console.log('MyButton:clicked');
      this.dispatchEvent('click', this._text, true);
    }
  }
});

exports.MyButton = MyButton;