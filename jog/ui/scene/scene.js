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
   * @param {number} opt_duration
   * @return {Deferred}
   */
  translateXTo: function(x, opt_duration) {
    Class.dispose(this._animator);
    this.translating = true;

    var df = new Deferred();

    if (!opt_duration || !this.isInDocument() || !this.getWidth()) {
      this._setTranslate(x, this._sceneTranslateY);
      this.translating = false;
      return df.succeed(this);
    }

    var x0 = this._sceneTranslateX;
    var dx = x - this._sceneTranslateX;

    if (__DEV__) {
      if (isNaN(x0) || isNaN(x) || isNaN(dx)) {
        throw  new Error('Invalid x');
      }
    }

    var stepFn = this.bind(function(value) {
      this._setTranslate(x0 + ~~(dx * value), this._sceneTranslateY);
    });

    var verifyFn = this.bind(function() {
      return this._sceneTranslateX !== x;
    });

    var completedFn = this.bind(function() {
      Class.dispose(this._animator);
      this.translating = false;
      df.succeed(this);
      x0 = null;
      dx = null;
      df = null;
      x = null;
    });

    if (dx !== 0) {
      this._animator = new Animator();
      this._animator.start(stepFn, verifyFn, completedFn, opt_duration || 350);
    } else {
      this.translating = false;
      df.succeed(this);
    }
    return df;
  },


  /**
   * @param {number} y
   * @param {number} opt_duration
   * @return {Deferred}
   */
  translateYTo: function(y, opt_duration) {
    Class.dispose(this._animator);
    this.translating = true;
    y = Math.round(y);

    var df = new Deferred();

    if (!opt_duration || !this.isInDocument() || !this.getWidth()) {
      this._setTranslate(this._sceneTranslateX, y);
      this.translating = false;
      return df.succeed(this);
    }

    var y0 = this._sceneTranslateY;
    var dy = y - this._sceneTranslateY;

    if (__DEV__) {
      if (isNaN(y0) || isNaN(y) || isNaN(dy)) {
        throw new Error('Invalid y');
      }
    }

    var stepFn = this.bind(function(value) {
      this._setTranslate(this._sceneTranslateX, y0 + ~~(dy * value));
    });

    var verifyFn = this.bind(function() {
      return this._sceneTranslateY !== y;
    });

    var completedFn = this.bind(function() {
      Class.dispose(this._animator);
      this.translating = false;
      df.succeed(this);
      y0 = null;
      dy = null;
      df = null;
      y = null;
    });

    if (dy !== 0) {
      this._animator = new Animator();
      this._animator.start(stepFn, verifyFn, completedFn, opt_duration || 350);
    } else {
      this.translating = false;
      df.succeed(this);
    }
    return df;
  },

  /**
   * @return {number}
   */
  getTranslateX: function() {
    return this._sceneTranslateX;
  },

  /**
   * @return {number}
   */
  getTranslateY: function() {
    return this._sceneTranslateY;
  },

  /**
   * @param {number} duration
   * @param {boolean=} opt_dispose
   * @return {Deferred}
   */
  fadeOut: function(duration, opt_dispose) {
    Class.dispose(this._animator);
    this._animator = new Animator(32);

    var df = new Deferred();

    var stepFn = this.bind(function(value) {
      this._setOpacity(1 - (~~(value * 10) / 10));
    });

    var verifyFn = this.bind(function() {
      return this._sceneOpacity > 0;
    });

    var completedFn = this.bind(function() {
      Class.dispose(this._animator);
      this.translating = false;
      df.succeed(this);

      if (opt_dispose) {
        this.dispose();
      }
      df = null;
    });

    this._animator.start(stepFn, verifyFn, completedFn, duration);
    return df;
  },

  /**
   * @param {number} x
   * @param {number} y
   */
  _setTranslate: function(x, y) {
    if (x !== this._sceneTranslateX || y !== this._sceneTranslateY) {
      this.getNode().style.webkitTransform =
        'translate3d(' + x + 'px,' + y + 'px,0)';
      this._sceneTranslateX = x;
      this._sceneTranslateY = y;
    }
  },

  /**
   * @param {number} opacity
   */
  _setOpacity: function(opacity) {
    if (opacity === 1) {
      this.getNode().style.opacity = '';
    } else if (opacity !== this._sceneOpacity) {
      this.getNode().style.opacity = opacity;
    }
    this._sceneOpacity = opacity;
  },

  translating: false,
  _sceneTranslateX: 0,
  _sceneTranslateY: 0,
  _sceneOpacity: 1,
  _hidden: false,
  _disabled: false,
  _animator: null,
  _opacity: 1
});


exports.Scene = Scene;