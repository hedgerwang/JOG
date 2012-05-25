/**
 * @fileOverview Chrome that sticks to the page.
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var Functions = require('jog/functions').Functions;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;
var lang = require('jog/lang').lang;

// features.
var ua = window.navigator.userAgent;
var useTouch = 'ontouchstart' in document;
var isAndroid = /Android/g.test(ua);
var isIOS = /iPhone/g.test(ua);
var isPC = !(isAndroid || isIOS);

var Chrome = Class.create(BaseUI, {

  /** @override */
  createNode: function() {
    var classNames = [
      cssx('jog-ui-chrome'),
      useTouch ? cssx('touch') : null,
      isAndroid ? cssx('android') : null,
      isIOS ? cssx('ios') : null,
      isPC ? cssx('pc') : null,
      __DEV__ ? cssx('dev') : null
    ];

    var node = dom.createElement('div', classNames.join(' '));
    return node;
  },

  onDocumentReady:function() {
    if (!isPC) {
      this._onresize = lang.throttle(this._onresize, 500, this);
      this.getEvents().listen(document, 'resize', this._onresize);
      this.getEvents().listen(document, 'orientationchange', this._onresize);
      this.getEvents().listen(document, 'touchstart', this._onTouch);
      this._reflow();
    }

    if (useTouch) {
      // this.getEvents().listen(
      //  document, 'touchmove', Functions.PREVENT_DEFAULT);
    }
  },

  _onresize: function() {
    if (!this._reflowing) {
      this._reflow();
    }
  },

  /**
   * @param {Event} event
   */
  _onTouch: function(event) {
    var now = Date.now();
    if (now - this._touchedTime < 500) {
      event.preventDefault();
      this._reflow();
    }
    this._touchedTime = now;
  },

  _reflow: function() {
    if (this._reflowing) {
      return;
    }
    var dpi = window.devicePixelRatio || 1;
    this._reflowing = true;
    this.getNode().style.height = screen.height * dpi + 'px';
    this.scheduleCall(function() {
      if (!window.pageYOffset !== 1) {
        window.scrollTo(0, 1);
      }
    }, 1);
    this.scheduleCall(function() {
      if (parseInt(this.getNode().style.height, 10) !== window.innerHeight) {
        this.getNode().style.height = window.innerHeight + 'px';
      }
    }, 100);
    this.scheduleCall(function() {
      this._reflowing = false;
    }, 1000);
  },

  _touchedTime: 0,
  _reflowing: false
});

exports.Chrome = Chrome;