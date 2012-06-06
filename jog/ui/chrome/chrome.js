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
    } else {
      var re = /(initial-scale\s*=\s*)([0-9\.]+)/g;
      var match = document.head.innerHTML.match(re);
      var scale = match ? parseFloat(match[0].split('=')[1]) : 1;
      if (scale) {
        // This would make PC debugging easier.
        this.getNode().style.webkitTransform = 'scale(' + scale + ')';
      }
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
    if (!event.defaultPrevented) {
      var now = Date.now();
      if (now - this._touchedTime < 500) {
        event.preventDefault();
        this._reflow();
      }
      this._touchedTime = now;
    }
  },

  _reflow: function() {
    if (this._reflowing) {
      return;
    }
    var dpi = window.devicePixelRatio || 1;
    if (document.documentElement.offsetWidth > window.outerWidth) {
      dpi = document.documentElement.offsetWidth / window.outerWidth;
    }
    this._reflowing = true;
    this.getNode().style.height = screen.height * dpi + 'px';
    this.callLater(function() {
      if (!window.pageYOffset !== 1) {
        window.scrollTo(0, 1);
      }
    }, 100);
    this.callLater(function() {
      if (parseInt(this.getNode().style.height, 10) !== window.innerHeight) {
        this.getNode().style.height = window.innerHeight + 'px';
      }
    }, 500);
    this.callLater(function() {
      this._reflowing = false;
    }, 1000);
  },

  _touchedTime: 0,
  _reflowing: false
});

exports.Chrome = Chrome;