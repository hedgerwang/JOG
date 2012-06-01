/**
 * @fileOverview LoadingIndicator
 * @author Hedger Wang
 */

var Animator = require('jog/animator').Animator;
var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var LoadingIndicator = Class.create(BaseUI, {
  main: function() {
    this._animator = new Animator();
  },

  /** @override */
  createNode: function() {
    var node = dom.createElement('div', {
      className: cssx('jog-ui-loading-indicator')
    });
    return node;
  },

  dispose: function() {
    this._animator.dispose();
  },

  /** @override */
  onDocumentReady: function() {
    this._play();
  },

  _play: function() {
    this._animator.start(
      this.bind(this._stepFn),
      this.bind(this._verifyFn),
      this.bind(this._completedFn),
      2000,
      Animator.linear
    );
  },

  _stepFn: function(value) {
    var degree = ((value * 10) % 10) * 36;
    if (this._degree !== degree) {
      this._degree = degree;
      var style = this.getNode().style;
      style['-webkit-transform'] = 'rotate(' + degree + 'deg)';
    }
  },

  _verifyFn: function() {
    if (this._degree === 0) {
      return this.getNode() && this.getNode().offsetHeight > 0;
    }
    return true;
  },

  _completedFn: function() {
    if (this._verifyFn()) {
      this._play();
    }
  },

  _animator: null,
  _animID: 0,
  _degree: 0,
  _opacity: 0.5
});


exports.LoadingIndicator = LoadingIndicator;