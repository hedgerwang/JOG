/**
 * @fileOverview
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var MyForm = Class.create(BaseUI, {
  createNode: function() {
    return dom.createElement('div', cssx('jog-example-myform'));
  },

  onDocumentReady: function() {
    this.getEvents().listen(this, 'click', this._onClick);
  },

  _onClick: function(event) {
    if (event.target.type === 'submit') {
      this.dispatchEvent('submit');
    }
  }
});

exports.MyForm = MyForm;