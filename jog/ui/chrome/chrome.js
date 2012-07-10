/**
 * @fileOverview Chrome that sticks to the page.
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var UserAgent = require('jog/useragent').UserAgent;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;
var lang = require('jog/lang').lang;

var Chrome = Class.create(BaseUI, {

  /** @override */
  createNode: function() {
    var classNames = [
      cssx('jog-ui-chrome'),
      UserAgent.USE_TOUCH ? cssx('touch') : null,
      UserAgent.IS_ANDROID ? cssx('android') : null,
      UserAgent.IS_IOS ? cssx('ios') : null,
      UserAgent.IS_DESKTOP ? cssx('pc') : null,
      __DEV__ ? cssx('dev') : null
    ];

    var node = dom.createElement('div', classNames.join(' '));
    node.id = 'debug-jog-chrome-element';

    this._spacer = dom.createElement('div', cssx('jog-ui-chrome_spacer'));
    return node;
  },

  dispose: function() {
    dom.remove(this._spacer);
  },

  onDocumentReady:function() {
    if (UserAgent.IS_MOBILE) {
      this._onresize = lang.throttle(this._onresize, 500, this);
      this.getEvents().listen(document, 'resize', this._onresize);
      this.getEvents().listen(document, 'orientationchange', this._onresize);
      if (UserAgent.USE_TOUCH) {
        this.getEvents().listen(document, 'touchstart', this._onTouch);
        this.getEvents().listen(document, 'touchmove', this._onTouchMove);
      }
      // this.getEvents().listen(document, 'focusin', this._reflow);
      this._reflow();
    } else {
      var re = /(initial-scale\s*=\s*)([0-9\.]+)/g;
      var match = document.head.innerHTML.match(re);
      var scale = match ? parseFloat(match[0].split('=')[1]) : 1;
      if (scale) {
        // This would make PC debugging easier.
        this._scale = scale;
        this.getNode().style.webkitTransform = 'scale(' + scale + ')';
      }
    }
    document.body.appendChild(this._spacer);
  },

  /**
   * @return {number}
   */
  getScale: function() {
    return this._scale;
  } ,

  _onresize: function() {
    if (!this._reflowing) {
      this._reflow();
    }
  },

  /**
   * @param {Event} event
   */
  _onTouch: function(event) {
    if (!event.defaultPrevented && event.pageY > 50) {
      this._reflow();
    }
  },

  /**
   * @param {Event} event
   */
  _onTouchMove: function(event) {
    event.preventDefault();
  },

  _reflow: function() {
    if (this._reflowing || UserAgent.IS_ANDROID || window.pageYOffset >= 1) {
      return;
    }
    var dpi = window.devicePixelRatio || 1;
    if (document.documentElement.offsetWidth > window.outerWidth) {
      dpi = document.documentElement.offsetWidth / window.outerWidth;
    }
    this._reflowing = true;
    this._spacer.style.height = (screen.height + 1) * dpi + 'px';

    if (!this.getNode().style.height) {
      this.getNode().style.height = this._spacer.style.height;
    }

    this.setTimeout(function() {
      if (!window.pageYOffset !== 1) {
        window.scrollTo(0, 1);
      }
    }, 100);

    this.setTimeout(function() {
      if (parseInt(this._spacer.style.height, 10) !== window.innerHeight + 1) {
        this._spacer.style.height = window.innerHeight + 1 + 'px';
      }
    }, 500);

    this.setTimeout(function() {
      this._reflowing = false;
      this.getNode().style.height = this._spacer.style.height;
    }, 1000);
  },

  _scale: 1,
  _spacer: null,
  _reflowing: false
});

exports.Chrome = Chrome;