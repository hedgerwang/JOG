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

  moveTo: function(x, y) {

  },

  /**
   * @param {number} duration
   * @param {boolean=} opt_dispose
   * @return {Deferred}
   */
  faceOut: function(duration, opt_dispose) {
    this.getEvents().unlistenAll();
    Class.dispose(this._animator);

    var df = new Deferred();

    if (this._animator) {
      this._animator.dispose();
    }


    this._animator = new Animator(32);
    var stepFn = this.bind(function(value) {
      this._opacity = 1 - (~~(value * 10) / 10);
      this.getNode().style.opacity = this._opacity;
    });

    var verifyFn = this.bind(function() {
      return this._opacity > 0;
    });

    var completedFn = this.bind(function() {
      this._opacity = 0;
      this.getNode().style.opacity = this.opacity;
      this._animator.dispose();
      delete this._animator;
      df.succeed(true);

      if (opt_dispose) {
        this.dispose();
      }

      df = null;
    });

    this._animator.start(stepFn, verifyFn, completedFn, duration);
    return df;
  },

  _animator: null,
  _opacity: 1
});


exports.Scene = Scene;