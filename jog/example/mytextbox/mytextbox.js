/**
 * @fileOverview
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var MyTextBox = Class.create(BaseUI, {
  /**
   * @param {string=} label
   */
  main: function(label) {
    this._label = label;
  },

  /** @override */
  createNode: function() {
    this._input = dom.createElement('input');

    var label = this._label ?
      dom.createElement(
        'label',
        cssx('jog-example-myinput-label'),
        this._label) :
      null;

    return dom.createElement('div', cssx('jog-example-myinput'),
      label, this._input);
  },

  /** @return {string} */
  getValue: function() {
    return this._input ? this._input.value : '';
  },

  _label: null,
  _input: null
});

exports.MyTextBox = MyTextBox;