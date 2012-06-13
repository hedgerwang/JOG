/**
 * @fileOverview Imageable
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Events = require('jog/events').Events;
var HashMap = require('jog/hashmap').HashMap;
var ImageableManager = require('jog/behavior/imageable/Imageablemanager').ImageableManager;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var manager = new ImageableManager(1);

/**
 * Load image asynchronously and lazily.
 * TODO(hedger): Hide image when it's off-screen?
 */
var Imageable = Class.create(EventTarget, {

  /**
   * @type {string}
   */
  src: '',

  /**
   * @type {number}
   */
  naturalWidth: 0,

  /**
   * @type {number}
   */
  naturalHeight: 0,

  /**
   * @type {number}
   */
  width: 0,

  /**
   * @type {number}
   */
  height: 0,

  /**
   * @param {Element} element
   * @param {string} src
   * @param {number=} opt_resizeMode
   */
  main: function(element, src, opt_resizeMode, opt_useCanvas) {
    this.src = src;
    this._element = element;
    this._resizeMode = opt_resizeMode || Imageable.RESIZE_MODE_CROPPED;
    dom.addClassName(element, cssx('jog-behavior-imageable'));
    manager.register(this);

    if (__DEV__) {
      element.setAttribute('debug_imagable_src', this.src);
    }
  },

  dispose: function() {
    manager.unregister(this);
    var img = this._loadingImage;

    if (img) {
      delete img.onload;
      delete img.onerror;
    }
  },

  /**
   * @return {Imageable}
   */
  clone: function() {
    return new Imageable(this._element, this._src, this._resizeMode);
  },

  load: function() {
    if (this._loadingImage || !this.shouldLoad()) {
      return;
    }

    this.src = this._normalizeSrc(this.src);
    var img = new Image();
    this._loadingImage = img;
    var handler = this.bind(this._handleLoad);
    img.onload = handler;
    img.onerror = handler;
    img.src = this.src;
  },

  /**
   * @return {boolean}
   */
  shouldLoad: function() {
    return this.isVisible();
  },

  /**
   * @return {boolean}
   */
  isVisible: function() {
    if (!this._element || this.disposed) {
      return false;
    }

    var viewLeft = 0;
    var viewRight = dom.getViewportWidth();
    var viewTop = 0;
    var viewBottom = dom.getViewportHeight();
    var buffer = 30;

    if (__DEV__) {
      // TODO(hedger): There must be a better way to do this.
      var chrome = document.getElementById('debug-jog-chrome-element');
      if (chrome) {
        var chromeRect = chrome.getBoundingClientRect();
        viewTop = chromeRect.top;
        viewBottom = chromeRect.bottom;
        viewLeft = chromeRect.left;
        viewRight = chromeRect.right;
      }
    }

    var rect = this._element.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    if (!this.width) {
      return false;
    }

    if (rect.top > viewBottom + buffer || rect.bottom < viewTop - buffer) {
      return false;
    }

    if (rect.left > viewRight + buffer || rect.right < viewLeft - buffer) {
      return false;
    }

    var testElement = document.elementFromPoint(rect.left + 1, rect.top + 1) ||
      document.elementFromPoint(rect.right - 1, rect.bottom - 1);


    return testElement === this._element ||
      (this.width > 100 && this.height > 70);
  },

  /**
   * @return {boolean}
   */
  shouldReload:function() {
    return this.src && !this.disposed && dom.isInDocument(this._element);
  },

  show: function() {
    if (this.disposed) {
      return;
    }

    var nw = this.naturalWidth;
    var nh = this.naturalHeight;

    if (!nw || !nh) {
      if (__DEV__) {
        throw new Error('Attempt to show an image that is not ready. ' +
          ', naturalWidth = ' + nw +
          ', naturalHeight =' + nh +
          ', src = ' + this.src);
      }
      return;
    }

    var bgSize;

    switch (this._resizeMode) {
      case Imageable.RESIZE_MODE_USE_WIDTH:
        bgSize = '100% auto';
        break;

      case Imageable.RESIZE_MODE_USE_HEIGHT:
        bgSize = 'auto 100%';
        break;

      case Imageable.RESIZE_MODE_USE_NATURAL:
        if (nw < nh) {
          bgSize = 'auto 100%';
        } else if (nw > nh) {
          bgSize = '100% auto';
        } else {
          bgSize = '100% 100%';
        }
        break;

      case Imageable.RESIZE_MODE_CROPPED:
        if (nw < nh) {
          bgSize = '100% auto';
        } else if (nw > nh) {
          bgSize = 'auto 100%';
        } else {
          bgSize = '100% 100%';
        }
        break;

      default:
        if (__DEV__) {
          throw new Error('Invalid resize mode specified.' + this.src);
        }
        return;
    }

    this._element.style.backgroundSize = bgSize;
    this._element.style.backgroundImage = 'url("' + this.src + '")';
  },

  _handleLoad: function(event) {
    console.log(event.type);
    this.naturalWidth = this._loadingImage.naturalWidth;
    this.naturalHeight = this._loadingImage.naturalHeight;
    this.dispatchEvent(event.type);
    this.dispose();
  },

  /**
   * @param {string} src
   */
  _normalizeSrc: function(src) {
    if (!src) {
      console.warn('empty src', src);
      return '';
    }

    if (src.indexOf('fbexternal-a.akamaihd.net') > 0) {
      // TODO(hedger): I don't like this solution but this is how to fix it
      // now.
      var match = src.match(/[\?&]url=(.+)\&?/);
      if (match && match[1]) {
        console.warn('Safe Image failed from ' + src);
        src = decodeURIComponent(match[1]);
        console.warn('Try ' + src + ' instead');

        return src;
      }
    }

    return src;
  },

  /**
   * @type {Image}
   */
  _loadingImage: null,

  /**
   * @type {number}
   */
  _resizeMode: 0,

  /**
   * @type {number}
   */
  _element: null
});

Imageable.RESIZE_MODE_CROPPED = 1;
Imageable.RESIZE_MODE_USE_WIDTH = 2;
Imageable.RESIZE_MODE_USE_HEIGHT = 3;
Imageable.RESIZE_MODE_USE_NATURAL = 4;

exports.Imageable = Imageable;


