/**
 * @fileOverview LoadingIndicator
 * @author Hedger Wang
 */

var Animator = require('jog/animator').Animator;
var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var Deferred = require('jog/deferred').Deferred;
var UserAgent = require('jog/useragent').UserAgent;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var LoadingIndicator = Class.create(BaseUI, {
  main: function() {
    this._animator = new Animator(32);
  },

  /** @override */
  createNode: function() {
    var node = dom.createElement('div', {
      className: cssx('jog-ui-loading-indicator')
    });

    if (UserAgent.IS_ANDROID) {
      dom.addClassName(node, cssx('jog-ui-loading-indicator-android'));
    }

    return node;
  },

  dispose: function() {
    this._animator.dispose();
  },

  /** @override */
  onDocumentReady: function() {
    this._shownTime = Date.now();
    this.play();
  },

  center: function() {
    dom.addClassName(this.getNode(), cssx('jog-ui-loading-indicator-centered'));
  },

  /**
   * @return {Deferred}
   */
  dismiss: function() {
    var df = new Deferred();
    if (!this.disposed) {
      var now = Date.now();
      var duration = now - this._shownTime;
      if (duration < 1000) {
        this.setTimeout(function() {
          this.dispose();
          df.succeed();
          df = null;
        }, 1000 - duration);
      } else {
        this.dispose();
        df.succeed();
      }
    } else {
      df.succeed();
    }
    return df;
  },

  play: function() {
    if (!this._playing) {
      this._playing = true;
      this._animator.start(
        this.bind(this._stepFn),
        this.bind(this._verifyFn),
        this.bind(this._completedFn),
        1000,
        Animator.linear
      );
    }
  },

  _stepFn: function(value) {
    var degree = ~~(value * 360);
    if (this._degree !== degree) {
      this._degree = degree;
      var style = this.getNode().style;
      style['-webkit-transform'] = 'rotate(' + degree + 'deg)';
    }
  },

  _verifyFn: function() {
    if (!this._playing) {
      return false;
    } else if (this._degree === 0) {
      return this.getNode() && this.getNode().offsetHeight > 0;
    }
    return true;
  },

  _completedFn: function() {
    if (this._verifyFn()) {
      this._playing = false;
      this.play();
    }
  },

  _shownTime: 0,
  _playing: false,
  _animator: null,
  _animID: 0,
  _degree: 0,
  _opacity: 0.5
});


exports.LoadingIndicator = LoadingIndicator;