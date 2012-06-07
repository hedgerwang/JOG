/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var Animator = require('jog/animator').Animator;
var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var Deferred = require('jog/deferred').Deferred;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var Scene = Class.create(BaseUI, {
  /** @override */
  createNode: function() {
    var node = dom.createElement('div', {
      className: cssx('jog-ui-scene')
    });
    return node;
  },

  /** @override */
  dispose: function() {
    Class.dispose(this._animator);
  },


  /**
   * @param {boolean} disabled
   * @return {Scene}
   */
  setDisabled: function(disabled) {
    if (this._disabled !== disabled) {
      this._disabled = disabled;
      dom.alterClassName(
        this.getNode(), cssx('jog-ui-scene-disabled'), disabled);
    }
    return this;
  },

  /**
   * @param {boolean} hidden
   * @return {Scene}
   */
  setHidden: function(hidden) {
    if (this._hidden !== hidden) {
      this._hidden = hidden;
      dom.alterClassName(this.getNode(), cssx('jog-ui-scene-hidden'), hidden);
    }
    return this;
  },

  /**
   * @param {number} x
   * @return {Deferred}
   */
  translateXTo: function(x) {
    Class.dispose(this._animator);

    var df = new Deferred();

    if (!this.isInDocument() || !this.getWidth()) {
      this._x = x;
      this.getNode().style.webkitTransform =
        'translate3d(' + this._x + 'px,0,0)';
      return df.succeed(this);
    }

    var x0 = this._x;
    var dx = x - this._x;

    var stepFn = this.bind(function(value) {
      this._x = x0 + ~~(dx * value);
      this.getNode().style.webkitTransform =
        'translate3d(' + this._x + 'px,0,0)';
    });

    var verifyFn = this.bind(function() {
      return this._x !== x;
    });

    var completedFn = this.bind(function() {
      Class.dispose(this._animator);
      df.succeed(this);
      df = null;
    });

    if (dx !== 0) {
      this._animator = new Animator();
      this._animator.start(stepFn, verifyFn, completedFn, 250);
    } else {
      df.succeed(this);
    }
    return df;
  },

  /**
   * @param {number} duration
   * @param {boolean=} opt_dispose
   * @return {Deferred}
   */
  faceOut: function(duration, opt_dispose) {
    Class.dispose(this._animator);
    this._animator = new Animator(32);

    var df = new Deferred();

    var stepFn = this.bind(function(value) {
      this._opacity = 1 - (~~(value * 10) / 10);
      this.getNode().style.opacity = this._opacity;
    });

    var verifyFn = this.bind(function() {
      return this._opacity > 0;
    });

    var completedFn = this.bind(function() {
      Class.dispose(this._animator);
      df.succeed(this);

      if (opt_dispose) {
        this.dispose();
      }
      df = null;
    });

    this._animator.start(stepFn, verifyFn, completedFn, duration);
    return df;
  },

  _x: 0,
  _y: 0,
  _hidden: false,
  _disabled: false,
  _animator: null,
  _opacity: 1
});


exports.Scene = Scene;